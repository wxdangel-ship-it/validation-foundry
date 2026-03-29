import { spawn } from "node:child_process";
import { mkdir, rm, access, copyFile, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import puppeteer from "puppeteer";

const mode = process.argv[2] ?? "all";
const root = resolve(new URL("..", import.meta.url).pathname);
const repoRoot = resolve(root, "../../../../../");
const distUrl = "http://127.0.0.1:4173";
const outputRoot = join(repoRoot, "outputs/_work");
const routeOut = join(outputRoot, "t03_route_video");
const tripOut = join(outputRoot, "t03_trip_summary");
const prototypeOut = join(outputRoot, "t03_prototype");
const qaOut = join(outputRoot, "t03_qa");
const frameRoot = join(root, ".render_frames");
const publicBundlePath = join(root, "public", "demo-data.json");

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolveRun({ stdout, stderr });
      } else {
        rejectRun(new Error(stderr || stdout || `command failed: ${command}`));
      }
    });
  });
}

async function ensureBuild() {
  await run("npm", ["run", "build"]);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf-8"));
}

async function syncDemoData() {
  const bundleRootCandidates = [join(qaOut, "data_contract"), tripOut, routeOut];
  let sourceRoot = null;
  for (const candidate of bundleRootCandidates) {
    try {
      await access(join(candidate, "sample_manifest.json"), constants.R_OK);
      sourceRoot = candidate;
      break;
    } catch {
      // continue
    }
  }
  if (!sourceRoot) {
    throw new Error("No T03 contract bundle found. Run the Python pipeline first.");
  }

  const sampleManifest = await readJson(join(sourceRoot, "sample_manifest.json"));
  const routeKeypoints = await readJson(join(sourceRoot, "route_keypoints.json"));
  const tripTrack = await readJson(join(sourceRoot, "trip_track.geojson"));
  const tripEvents = await readJson(join(sourceRoot, "trip_events.json"));
  const sensorTimeseries = await readJson(join(sourceRoot, "sensor_timeseries.json"));
  const summaryStory = await readJson(join(sourceRoot, "summary_story.json"));
  const routeDraftPath = join(repoRoot, sampleManifest.source.route_draft_path);
  const routeDraft = await readJson(routeDraftPath);

  const trackPointFeatures = tripTrack.features.filter(
    (feature) => feature.properties?.feature_type === "track_point",
  );

  const bundle = {
    sample: {
      routeId: sampleManifest.sample_route_id,
      routeName:
        routeDraft.semantic_draft?.route_name_candidate ??
        sampleManifest.source.route_name_candidate ??
        sampleManifest.sample_route_id,
      sourceIdentifier: sampleManifest.source.source_identifier,
      routeDescription:
        routeDraft.semantic_draft?.short_description_candidate ??
        "T03 demo bundle derived from the fixed T02 six-foot sample.",
      distanceKm: Number(sampleManifest.track.total_distance_km ?? 0),
      durationSeconds: Math.round(Number(sampleManifest.track.duration_seconds ?? 0)),
      terrainTags: routeDraft.semantic_draft?.terrain_tags ?? [],
      difficulty: routeDraft.semantic_draft?.difficulty_candidate ?? "未标注",
      locationLabel: routeDraft.region ?? routeDraft.source_meta?.source_capture_time ?? "",
    },
    routeKeypoints: routeKeypoints.keypoints.map((item) => ({
      keypoint_id: item.keypoint_id,
      kind: item.kind,
      name: item.candidate_label || item.name,
      lat: item.latitude,
      lng: item.longitude,
      confidence: item.confidence,
      note: item.candidate_label || item.name,
      track_index: item.index,
    })),
    tripTrack: {
      type: "FeatureCollection",
      features: trackPointFeatures.map((feature, index) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]],
        },
        properties: {
          index,
          timestamp: feature.properties.timestamp,
          speed: feature.properties.speed ?? 0,
          elevation: feature.properties.elevation_m ?? 0,
          slope_or_pitch: feature.properties.slope_or_pitch ?? 0,
          normalized_time: index / Math.max(trackPointFeatures.length - 1, 1),
        },
      })),
    },
    tripEvents: tripEvents.map((event) => ({
      event_id: event.event_id,
      timestamp: event.timestamp,
      event_type: event.event_type,
      severity: event.severity,
      message: event.message,
      track_index: event.track_sample_index,
    })),
    sensorTimeseries: sensorTimeseries,
    summaryStory: {
      quickSummary: summaryStory.quick_summary ?? [],
      deepSummary: (summaryStory.deep_summary ?? []).map((item) => item.synopsis),
      keyMetrics: {
        distance_km: Number(sampleManifest.track.total_distance_km ?? 0).toFixed(2),
        duration_min: Math.round(Number(sampleManifest.track.duration_seconds ?? 0) / 60),
        peak_speed_kmh: Math.round(Number(summaryStory.key_metrics?.max_speed_kmh ?? 0)),
        elevation_span_m:
          Math.round(
            Number(summaryStory.key_metrics?.max_elevation_m ?? 0) -
              Number(summaryStory.key_metrics?.min_elevation_m ?? 0),
          ) || 0,
      },
      chapters: (summaryStory.deep_summary ?? []).map((item) => ({
        title: item.title,
        detail: item.synopsis,
      })),
    },
  };

  await writeFile(publicBundlePath, `${JSON.stringify(bundle, null, 2)}\n`);
}

async function startPreview() {
  const child = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4173"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });

  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(distUrl, { method: "GET" });
      if (response.ok) {
        return child;
      }
    } catch {
      // keep polling
    }
    await sleep(500);
  }
  throw new Error(`vite preview did not become ready\n${logs}`);
}

async function waitForExportReady(page) {
  await page.waitForFunction(() => window.__T03_READY__ === true, {
    timeout: 30_000,
  });
}

async function captureFrames(page, route, dir, frameCount) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await page.goto(`${distUrl}/#${route}?export=1`, { waitUntil: "domcontentloaded" });
  await waitForExportReady(page);
  for (let index = 0; index < frameCount; index += 1) {
    const progress = index / Math.max(frameCount - 1, 1);
    await page.evaluate((value) => {
      window.__T03_SET_PROGRESS__(value);
    }, progress);
    await sleep(60);
    await page.screenshot({
      path: join(dir, `${String(index).padStart(4, "0")}.png`),
      type: "png",
    });
  }
}

async function makeVideo(frameDir, targetFile, fps = 24) {
  await run("ffmpeg", [
    "-y",
    "-framerate",
    String(fps),
    "-i",
    join(frameDir, "%04d.png"),
    "-vf",
    "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-pix_fmt",
    "yuv420p",
    targetFile,
  ]);
}

async function captureRoute(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
  const frameDir = join(frameRoot, "route");
  await captureFrames(page, "/render/route-teaser", frameDir, 72);
  await mkdir(routeOut, { recursive: true });
  await makeVideo(frameDir, join(routeOut, "route_teaser.mp4"));
  await copyFile(join(frameDir, "0036.png"), join(routeOut, "route_teaser_poster.png"));
  await writeFile(join(routeOut, "render_log.txt"), `frames=${72}\nroute=/render/route-teaser\n`);
  await page.close();
}

async function captureTrip(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
  const frameDir = join(frameRoot, "trip");
  await captureFrames(page, "/render/trip-summary", frameDir, 84);
  await mkdir(tripOut, { recursive: true });
  await makeVideo(frameDir, join(tripOut, "trip_summary.mp4"));
  await copyFile(join(frameDir, "0042.png"), join(tripOut, "trip_summary_poster.png"));
  await writeFile(join(tripOut, "render_log.txt"), `frames=${84}\nroute=/render/trip-summary\n`);
  await page.close();
}

async function capturePrototype(browser) {
  await mkdir(join(prototypeOut, "screenshots"), { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 });
  await page.goto(`${distUrl}/#/`, { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: join(prototypeOut, "route_entry.png"), type: "png" });
  await page.click("[data-testid='home-open-route-detail']");
  await page.waitForFunction(() => window.location.hash.includes("/route-detail"));
  await page.screenshot({ path: join(prototypeOut, "route_detail.png"), type: "png" });
  await page.click("[data-testid='route-detail-start-trip']");
  await page.waitForFunction(() => window.location.hash.includes("/trip-ready"));
  await page.screenshot({ path: join(prototypeOut, "trip_ready.png"), type: "png" });
  await page.click("[data-testid='trip-ready-enter-map']");
  await page.waitForFunction(() => window.location.hash.includes("/map"));
  await page.screenshot({ path: join(prototypeOut, "map_mainline.png"), type: "png" });
  await page.click("[data-testid='map-open-safety-drawer']");
  await sleep(300);
  await page.screenshot({ path: join(prototypeOut, "safety_drawer.png"), type: "png" });
  await page.click("[data-testid='safety-drawer-return']");
  await sleep(300);
  await page.screenshot({ path: join(prototypeOut, "abnormal_state.png"), type: "png" });
  await page.click("[data-testid='map-finish-trip']");
  await page.waitForFunction(() => window.location.hash.includes("/summary"));
  await page.screenshot({ path: join(prototypeOut, "summary_page.png"), type: "png" });
  await writeFile(join(prototypeOut, "render_log.txt"), "prototype click path captured\n");
  await page.close();
}

async function buildQaBundle() {
  await mkdir(join(qaOut, "manifest"), { recursive: true });
  await mkdir(join(qaOut, "data_contract"), { recursive: true });
  await mkdir(join(qaOut, "logs"), { recursive: true });
  await mkdir(join(qaOut, "route_video"), { recursive: true });
  await mkdir(join(qaOut, "trip_summary"), { recursive: true });
  await mkdir(join(qaOut, "prototype"), { recursive: true });
  await mkdir(join(qaOut, "reports"), { recursive: true });

  const copies = [
    [join(qaOut, "data_contract", "sample_manifest.json"), join(qaOut, "manifest", "sample_manifest.json")],
    [join(routeOut, "route_teaser.mp4"), join(qaOut, "route_video", "route_teaser.mp4")],
    [join(routeOut, "route_teaser_poster.png"), join(qaOut, "route_video", "route_teaser_poster.png")],
    [join(routeOut, "render_log.txt"), join(qaOut, "route_video", "render_log.txt")],
    [join(tripOut, "trip_summary.mp4"), join(qaOut, "trip_summary", "trip_summary.mp4")],
    [join(tripOut, "trip_summary_poster.png"), join(qaOut, "trip_summary", "trip_summary_poster.png")],
    [join(tripOut, "render_log.txt"), join(qaOut, "trip_summary", "render_log.txt")],
    [join(prototypeOut, "route_entry.png"), join(qaOut, "prototype", "route_entry.png")],
    [join(prototypeOut, "route_detail.png"), join(qaOut, "prototype", "route_detail.png")],
    [join(prototypeOut, "trip_ready.png"), join(qaOut, "prototype", "trip_ready.png")],
    [join(prototypeOut, "map_mainline.png"), join(qaOut, "prototype", "map_mainline.png")],
    [join(prototypeOut, "safety_drawer.png"), join(qaOut, "prototype", "safety_drawer.png")],
    [join(prototypeOut, "abnormal_state.png"), join(qaOut, "prototype", "abnormal_state.png")],
    [join(prototypeOut, "summary_page.png"), join(qaOut, "prototype", "summary_page.png")],
  ];

  for (const [source, target] of copies) {
    try {
      await access(source, constants.R_OK);
      await copyFile(source, target);
    } catch {
      // ignore missing items; QA assembly final step can report gaps
    }
  }
}

async function main() {
  await syncDemoData();
  await ensureBuild();
  const server = await startPreview();
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--enable-unsafe-swiftshader", "--use-gl=swiftshader", "--no-sandbox"],
      defaultViewport: null,
    });
    try {
      if (mode === "route" || mode === "all") {
        await captureRoute(browser);
      }
      if (mode === "trip" || mode === "all") {
        await captureTrip(browser);
      }
      if (mode === "prototype" || mode === "all") {
        await capturePrototype(browser);
      }
    } finally {
      await browser.close();
    }
    if (mode === "all") {
      await buildQaBundle();
    }
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch(async (error) => {
  await mkdir(join(qaOut, "logs"), { recursive: true });
  await writeFile(join(qaOut, "logs", "browser.log"), String(error.stack || error));
  console.error(error);
  process.exitCode = 1;
});

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import maplibregl, { type LngLatBoundsLike, type Map as MapLibreMap } from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { TripsLayer } from "@deck.gl/geo-layers";
import * as Cesium from "cesium";
import { AlertTriangle, ArrowLeft, Compass, Flag, Gauge, Mountain, Search } from "lucide-react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Card, CardContent } from "./components/ui/card";
import { Sheet, SheetContent } from "./components/ui/sheet";

type Keypoint = {
  keypoint_id: string;
  kind: string;
  name: string;
  lat: number;
  lng: number;
  confidence: string;
  note: string;
  track_index?: number;
};

type TrackFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    index: number;
    timestamp: string;
    speed: number;
    elevation: number;
    slope_or_pitch: number;
    normalized_time: number;
  };
};

type TripEvent = {
  event_id: string;
  timestamp: string;
  event_type: string;
  severity: string;
  message: string;
  track_index: number;
};

type SensorRow = {
  timestamp: string;
  speed: number;
  elevation: number;
  slope_or_pitch: number;
  event_type?: string;
};

type SummaryStory = {
  quickSummary: string[];
  deepSummary: string[];
  keyMetrics: Record<string, string | number>;
  chapters: { title: string; detail: string }[];
};

type AppBundle = {
  sample: {
    routeId: string;
    routeName: string;
    sourceIdentifier: string;
    routeDescription: string;
    distanceKm: number;
    durationSeconds: number;
    terrainTags: string[];
    difficulty: string;
    locationLabel: string;
  };
  routeKeypoints: Keypoint[];
  tripTrack: {
    type: "FeatureCollection";
    features: TrackFeature[];
  };
  tripEvents: TripEvent[];
  sensorTimeseries: SensorRow[];
  summaryStory: SummaryStory;
};

type ExportWindow = Window & {
  __T03_SET_PROGRESS__?: (value: number) => void;
  __T03_READY__?: boolean;
};

const MAP_STYLE = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#071218",
      },
    },
  ],
} as const;

function useExportMode() {
  const location = useLocation();
  return new URLSearchParams(location.search).get("export") === "1";
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${mins}m ${remain.toString().padStart(2, "0")}s`;
}

function useBundle() {
  const [bundle, setBundle] = useState<AppBundle | null>(null);

  useEffect(() => {
    let active = true;
    fetch("./demo-data.json")
      .then((response) => response.json())
      .then((data: AppBundle) => {
        if (active) {
          setBundle(data);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return bundle;
}

function computeBounds(features: TrackFeature[]): LngLatBoundsLike {
  const lons = features.map((feature) => feature.geometry.coordinates[0]);
  const lats = features.map((feature) => feature.geometry.coordinates[1]);
  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ];
}

function interpolateTrack(features: TrackFeature[], progress: number) {
  if (!features.length) {
    return [0, 0] as [number, number];
  }
  const target = progress * (features.length - 1);
  const lower = Math.floor(target);
  const upper = Math.min(features.length - 1, lower + 1);
  const factor = target - lower;
  const from = features[lower].geometry.coordinates;
  const to = features[upper].geometry.coordinates;
  return [
    from[0] + (to[0] - from[0]) * factor,
    from[1] + (to[1] - from[1]) * factor,
  ] as [number, number];
}

function RouteTeaserMap({
  features,
  keypoints,
  progress,
  heightClass = "h-[420px]",
}: {
  features: TrackFeature[];
  keypoints: Keypoint[];
  progress: number;
  heightClass?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  const tripData = useMemo(
    () => [
      {
        path: features.map((feature) => feature.geometry.coordinates),
        timestamps: features.map((feature) => feature.properties.normalized_time * 180),
      },
    ],
    [features],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !features.length) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      cooperativeGestures: true,
      attributionControl: false,
      pitch: 62,
      bearing: 18,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.fitBounds(computeBounds(features), { padding: 56, duration: 0 });
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: features.map((feature) => feature.geometry.coordinates),
          },
        },
      });
      map.addLayer({
        id: "route-shadow",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#11252d",
          "line-width": 12,
          "line-opacity": 0.72,
        },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#ef8d54",
          "line-width": 6,
          "line-opacity": 0.95,
        },
      });
      map.addSource("keypoints", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: keypoints.map((keypoint) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [keypoint.lng, keypoint.lat],
            },
            properties: {
              label: keypoint.name,
              kind: keypoint.kind,
            },
          })),
        },
      });
      map.addLayer({
        id: "keypoint-rings",
        type: "circle",
        source: "keypoints",
        paint: {
          "circle-color": "#071218",
          "circle-radius": 12,
          "circle-stroke-color": "#dcc7a0",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "keypoint-core",
        type: "circle",
        source: "keypoints",
        paint: {
          "circle-color": "#84b59f",
          "circle-radius": 5,
        },
      });

      const overlay = new MapboxOverlay({
        interleaved: true,
        layers: [],
      });
      overlayRef.current = overlay;
      map.addControl(overlay);
    });

    return () => {
      overlayRef.current?.finalize();
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
  }, [features, keypoints]);

  useEffect(() => {
    const map = mapRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay || !features.length) {
      return;
    }
    overlay.setProps({
      layers: [
        new TripsLayer({
          id: "route-trip",
          data: tripData,
          getPath: (item) => item.path,
          getTimestamps: (item) => item.timestamps,
          getColor: [132, 181, 159],
          opacity: 0.9,
          widthMinPixels: 6,
          trailLength: 38,
          currentTime: progress * 180,
          shadowEnabled: false,
        }),
      ],
    });
    map.easeTo({
      bearing: 10 + progress * 24,
      pitch: 58 + Math.sin(progress * Math.PI) * 12,
      duration: 120,
      essential: true,
    });
  }, [features, progress, tripData]);

  const active = interpolateTrack(features, progress);

  return (
    <div className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-[#071218] ${heightClass}`}>
      <div className="terrain-grid absolute inset-0 opacity-25" />
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-4 top-4 flex gap-2">
        <Badge>Route Teaser</Badge>
        <Badge className="text-moss">{Math.round(progress * 100)}% path traced</Badge>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-white/10 bg-[#071218]/80 px-4 py-2 text-xs text-steel">
        Cursor {active[1].toFixed(5)}, {active[0].toFixed(5)}
      </div>
    </div>
  );
}

function SensorChart({
  data,
  progress,
}: {
  data: SensorRow[];
  progress: number;
}) {
  const width = 620;
  const height = 180;
  if (!data.length) {
    return null;
  }
  const maxSpeed = Math.max(...data.map((item) => item.speed), 1);
  const maxElevation = Math.max(...data.map((item) => item.elevation), 1);

  const toPath = (selector: (row: SensorRow) => number, maxValue: number) =>
    data
      .map((item, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * width;
        const y = height - (selector(item) / maxValue) * (height - 24) - 12;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");

  const markerX = progress * width;

  return (
    <svg
      className="w-full overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Sensor chart"
    >
      <rect width={width} height={height} rx="24" fill="#0a171c" />
      <path d={toPath((item) => item.speed, maxSpeed)} fill="none" stroke="#ef8d54" strokeWidth="4" />
      <path d={toPath((item) => item.elevation, maxElevation)} fill="none" stroke="#84b59f" strokeWidth="4" />
      <line x1={markerX} x2={markerX} y1="14" y2={height - 14} stroke="#dcc7a0" strokeDasharray="8 6" />
    </svg>
  );
}

function TripSummaryScene({
  features,
  events,
  progress,
}: {
  features: TrackFeature[];
  events: TripEvent[];
  progress: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const clockRef = useRef<{
    start: Cesium.JulianDate;
    stop: Cesium.JulianDate;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current || !features.length) {
      return;
    }
    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      fullscreenButton: false,
      shouldAnimate: false,
    });
    viewer.imageryLayers.removeAll();
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#081318");
    viewer.scene.skyBox?.destroy();
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#081318");
    viewer.scene.moon.destroy();
    viewer.scene.sun.destroy();

    const positions = features.map((feature) =>
      Cesium.Cartesian3.fromDegrees(
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1],
        250 + feature.properties.elevation * 8,
      ),
    );
    const sampled = new Cesium.SampledPositionProperty();
    const start = Cesium.JulianDate.fromIso8601(features[0].properties.timestamp);
    const stop = Cesium.JulianDate.fromIso8601(features[features.length - 1].properties.timestamp);

    features.forEach((feature) => {
      sampled.addSample(
        Cesium.JulianDate.fromIso8601(feature.properties.timestamp),
        Cesium.Cartesian3.fromDegrees(
          feature.geometry.coordinates[0],
          feature.geometry.coordinates[1],
          250 + feature.properties.elevation * 8,
        ),
      );
    });

    viewer.entities.add({
      polyline: {
        positions,
        width: 6,
        material: new Cesium.PolylineGlowMaterialProperty({
          color: Cesium.Color.fromCssColorString("#ef8d54"),
          glowPower: 0.18,
        }),
      },
    });

    viewer.entities.add({
      position: sampled,
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString("#dcc7a0"),
        outlineColor: Cesium.Color.fromCssColorString("#081318"),
        outlineWidth: 3,
      },
    });

    events.forEach((event) => {
      const feature = features[event.track_index];
      if (!feature) {
        return;
      }
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          feature.geometry.coordinates[0],
          feature.geometry.coordinates[1],
          280 + feature.properties.elevation * 8,
        ),
        label: {
          text: event.event_type.toUpperCase(),
          fillColor: Cesium.Color.fromCssColorString(
            event.severity === "critical" ? "#ef8d54" : "#84b59f",
          ),
          font: "bold 13px sans-serif",
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString("#0a171c"),
          pixelOffset: new Cesium.Cartesian2(0, -24),
        },
      });
    });

    viewer.camera.flyToBoundingSphere(Cesium.BoundingSphere.fromPoints(positions), {
      duration: 0,
      offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(28), Cesium.Math.toRadians(-38), 3200),
    });

    viewerRef.current = viewer;
    clockRef.current = { start, stop };

    return () => {
      viewer.destroy();
      viewerRef.current = null;
      clockRef.current = null;
    };
  }, [events, features]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const clock = clockRef.current;
    if (!viewer || !clock) {
      return;
    }
    const totalSeconds = Cesium.JulianDate.secondsDifference(clock.stop, clock.start);
    const current = Cesium.JulianDate.addSeconds(
      clock.start,
      totalSeconds * progress,
      new Cesium.JulianDate(),
    );
    viewer.clock.currentTime = current;
  }, [progress]);

  return <div ref={containerRef} className="h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-[#071218]" />;
}

function ExportController({
  progress,
  setProgress,
}: {
  progress: number;
  setProgress: (value: number) => void;
}) {
  useEffect(() => {
    const exportWindow = window as ExportWindow;
    exportWindow.__T03_SET_PROGRESS__ = (value: number) => {
      setProgress(Math.max(0, Math.min(1, value)));
    };
    exportWindow.__T03_READY__ = true;
    return () => {
      delete exportWindow.__T03_SET_PROGRESS__;
      delete exportWindow.__T03_READY__;
    };
  }, [setProgress]);

  return (
    <div className="flex items-center gap-4">
      <div className="h-2 flex-1 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-ember transition"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="text-xs uppercase tracking-[0.2em] text-sand">
        Frame {Math.round(progress * 100)}
      </div>
    </div>
  );
}

function RenderRouteTeaser({ bundle }: { bundle: AppBundle }) {
  const exportMode = useExportMode();
  const [progress, setProgress] = useState(0.08);

  useEffect(() => {
    if (exportMode) {
      return;
    }
    const started = performance.now();
    let frame = 0;
    const tick = () => {
      const elapsed = performance.now() - started;
      const value = Math.min(1, (elapsed % 16000) / 16000);
      setProgress(value);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [exportMode]);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8">
      {exportMode ? <ExportController progress={progress} setProgress={setProgress} /> : null}
      <section className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <RouteTeaserMap features={bundle.tripTrack.features} keypoints={bundle.routeKeypoints} progress={progress} heightClass="h-[560px]" />
        <Card>
          <CardContent className="flex h-full flex-col gap-5">
            <Badge>Route 展示视频 POC</Badge>
            <h1 className="font-display text-5xl uppercase tracking-[0.05em] text-white">
              {bundle.sample.routeName}
            </h1>
            <p className="text-sm leading-7 text-steel">{bundle.sample.routeDescription}</p>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard icon={<Compass className="h-4 w-4" />} label="Distance" value={`${bundle.sample.distanceKm.toFixed(2)} km`} />
              <MetricCard icon={<Gauge className="h-4 w-4" />} label="Duration" value={formatDuration(bundle.sample.durationSeconds)} />
              <MetricCard icon={<Mountain className="h-4 w-4" />} label="Difficulty" value={bundle.sample.difficulty} />
              <MetricCard icon={<Flag className="h-4 w-4" />} label="Source" value={bundle.sample.sourceIdentifier} />
            </div>
            <div className="flex flex-wrap gap-2">
              {bundle.sample.terrainTags.map((tag) => (
                <Badge key={tag} className="text-moss">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="space-y-3">
              {bundle.routeKeypoints.slice(0, 4).map((keypoint, index) => (
                <div key={keypoint.keypoint_id} className="rounded-3xl border border-white/8 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-sand">Stop {index + 1}</div>
                  <div className="mt-2 text-lg font-semibold text-white">{keypoint.name}</div>
                  <div className="mt-1 text-sm text-steel">{keypoint.note}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function RenderTripSummary({ bundle }: { bundle: AppBundle }) {
  const exportMode = useExportMode();
  const [progress, setProgress] = useState(0.12);
  const activeEvent = bundle.tripEvents.find((event) => {
    const frameIndex = Math.floor(progress * Math.max(bundle.tripTrack.features.length - 1, 1));
    return event.track_index >= frameIndex - 12 && event.track_index <= frameIndex + 12;
  });

  useEffect(() => {
    if (exportMode) {
      return;
    }
    const started = performance.now();
    let frame = 0;
    const tick = () => {
      const elapsed = performance.now() - started;
      setProgress(Math.min(1, (elapsed % 18000) / 18000));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [exportMode]);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8">
      {exportMode ? <ExportController progress={progress} setProgress={setProgress} /> : null}
      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <TripSummaryScene features={bundle.tripTrack.features} events={bundle.tripEvents} progress={progress} />
        <Card>
          <CardContent className="space-y-5">
            <Badge>Trip 总结回放</Badge>
            <h1 className="text-4xl font-semibold text-white">轨迹 + 事件 + 传感器</h1>
            <p className="text-sm leading-7 text-steel">
              这不是完整分析平台，而是验证 T03 是否能把一条 Route 的行中过程沉淀成可回放的总结资产。
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(bundle.summaryStory.keyMetrics).map(([key, value]) => (
                <MetricCard key={key} icon={<Gauge className="h-4 w-4" />} label={key} value={String(value)} />
              ))}
            </div>
            {activeEvent ? (
              <div className="rounded-3xl border border-ember/40 bg-ember/10 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-sand">Live event</div>
                <div className="mt-2 text-lg font-semibold text-white">{activeEvent.event_type}</div>
                <div className="text-sm text-steel">{activeEvent.message}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-sand">Sensor overlay</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">速度 / 海拔联动</h2>
              </div>
              <Badge className="text-moss">{Math.round(progress * 100)}% replay</Badge>
            </div>
            <SensorChart data={bundle.sensorTimeseries} progress={progress} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <div className="text-xs uppercase tracking-[0.22em] text-sand">Summary story</div>
            <div className="space-y-3">
              {bundle.summaryStory.quickSummary.map((item) => (
                <div key={item} className="rounded-3xl border border-white/8 bg-white/5 p-4 text-sm text-white">
                  {item}
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-2">
              {bundle.summaryStory.chapters.map((chapter) => (
                <div key={chapter.title}>
                  <div className="text-sm font-semibold text-white">{chapter.title}</div>
                  <div className="text-sm leading-6 text-steel">{chapter.detail}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-steel">
        {icon}
        {label}
      </div>
      <div className="mt-3 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function PrototypeHome({ bundle }: { bundle: AppBundle }) {
  const navigate = useNavigate();

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8">
      <header className="flex items-center justify-between rounded-[32px] border border-white/10 bg-white/5 px-6 py-5">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-sand">T03 prototype</div>
          <div className="mt-2 text-2xl font-semibold text-white">Route / Trip Experience</div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost">
            <Search className="mr-2 h-4 w-4" />
            搜越野路线
          </Button>
          <Button data-testid="home-open-route-detail-hero" variant="secondary" onClick={() => navigate("/route-detail")}>
            打开样例 Route
          </Button>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-5">
            <Badge>首页推荐入口</Badge>
            <h1 className="font-display text-5xl uppercase text-white">{bundle.sample.routeName}</h1>
            <p className="max-w-2xl text-sm leading-7 text-steel">{bundle.sample.routeDescription}</p>
            <div className="grid grid-cols-3 gap-3">
              <MetricCard icon={<Compass className="h-4 w-4" />} label="Distance" value={`${bundle.sample.distanceKm.toFixed(2)} km`} />
              <MetricCard icon={<Mountain className="h-4 w-4" />} label="Difficulty" value={bundle.sample.difficulty} />
              <MetricCard icon={<Flag className="h-4 w-4" />} label="Entry" value={bundle.sample.locationLabel} />
            </div>
            <div className="flex gap-3">
              <Button data-testid="home-open-route-detail" onClick={() => navigate("/route-detail")}>
                查看 Route 详情
              </Button>
              <Button data-testid="home-open-route-teaser" variant="secondary" onClick={() => navigate("/render/route-teaser")}>
                打开展示视频页
              </Button>
            </div>
          </CardContent>
        </Card>
        <RouteTeaserMap features={bundle.tripTrack.features} keypoints={bundle.routeKeypoints} progress={0.3} />
      </section>
    </main>
  );
}

function RouteDetailPage({ bundle }: { bundle: AppBundle }) {
  const navigate = useNavigate();
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8">
      <BackBar label="Route 详情页" />
      <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <RouteTeaserMap features={bundle.tripTrack.features} keypoints={bundle.routeKeypoints} progress={0.62} />
        <Card>
          <CardContent className="space-y-5">
            <Badge>Trip 发起入口</Badge>
            <h1 className="text-4xl font-semibold text-white">{bundle.sample.routeName}</h1>
            <p className="text-sm leading-7 text-steel">{bundle.sample.routeDescription}</p>
            <div className="space-y-3">
              {bundle.routeKeypoints.map((keypoint) => (
                <div key={keypoint.keypoint_id} className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-sand">{keypoint.kind}</div>
                  <div className="mt-2 text-lg font-semibold text-white">{keypoint.name}</div>
                  <div className="mt-1 text-sm text-steel">{keypoint.note}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button data-testid="route-detail-start-trip" onClick={() => navigate("/trip-ready")}>
                发起 Trip
              </Button>
              <Button variant="secondary">下载离线轨迹</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function TripReadyPage({ bundle }: { bundle: AppBundle }) {
  const navigate = useNavigate();
  const checklist = [
    "Route 轨迹包已离线缓存",
    "关键点与撤离点已下载",
    "接驳导航入口已确认",
    "过程记录与传感器采集已开启",
  ];
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <BackBar label="Trip 准备态" />
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4">
            <Badge>Ready gate</Badge>
            <h1 className="text-4xl font-semibold text-white">正式进入离线寻迹主线前</h1>
            <p className="text-sm leading-7 text-steel">
              详情页负责展示和发起；正式准备动作在这里补齐最低出发条件，然后接驳到 Route 入口。
            </p>
            <div className="space-y-3">
              {checklist.map((item, index) => (
                <div key={item} className="flex items-start gap-4 rounded-[24px] border border-white/8 bg-white/5 p-4">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-moss/20 text-sm font-semibold text-moss">
                    {index + 1}
                  </div>
                  <div className="text-sm text-white">{item}</div>
                </div>
              ))}
            </div>
            <Button data-testid="trip-ready-enter-map" onClick={() => navigate("/map")}>
              Ready，进入地图页
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <Badge className="text-moss">接驳导航提示</Badge>
            <div className="rounded-[28px] border border-white/8 bg-[#071218] p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-sand">主入口</div>
              <div className="mt-3 text-2xl font-semibold text-white">
                {bundle.routeKeypoints[0]?.name ?? "入口点待补"}
              </div>
              <div className="mt-2 text-sm leading-7 text-steel">
                从准备态进入接驳导航，目的不是自动寻路，而是把用户接到正式离线寻迹主线的起点。
              </div>
            </div>
            <RouteTeaserMap features={bundle.tripTrack.features} keypoints={bundle.routeKeypoints} progress={0.1} heightClass="h-[280px]" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function MapPage({ bundle }: { bundle: AppBundle }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [phase, setPhase] = useState<"mainline" | "returning">("mainline");

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8">
      <BackBar label="越野地图页" />
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <RouteTeaserMap
            features={bundle.tripTrack.features}
            keypoints={bundle.routeKeypoints}
            progress={phase === "mainline" ? 0.64 : 0.34}
            heightClass="h-[600px]"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <Button data-testid="map-open-safety-drawer" variant="secondary" onClick={() => setDrawerOpen(true)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              进入异常态
            </Button>
            <Button variant="ghost" onClick={() => setPhase("returning")}>
              模拟返航
            </Button>
            <Button data-testid="map-finish-trip" onClick={() => navigate("/summary")}>
              结束 Trip
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="space-y-5">
            <Badge>离线寻迹主线</Badge>
            <h1 className="text-3xl font-semibold text-white">准备、进行、异常是一条连续链路</h1>
            <p className="text-sm leading-7 text-steel">
              地图页不是孤立页面。它承接准备态的离线数据、接驳导航和关键点，并在偏航或风险升高时打开安全抽屉做保守回撤。
            </p>
            <div className="space-y-3">
              {bundle.tripEvents.map((event) => (
                <div key={event.event_id} className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-sand">{event.event_type}</div>
                  <div className="mt-2 text-sm text-white">{event.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent>
          <div className="space-y-5">
            <Badge>安全抽屉</Badge>
            <h2 className="text-3xl font-semibold text-white">偏航识别，保守回撤</h2>
            <p className="text-sm leading-7 text-steel">
              首轮不做自动越野寻路；异常态只做偏航提示、返航建议和接驳点撤离。
            </p>
            <div className="rounded-[24px] border border-ember/30 bg-ember/10 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-sand">当前告警</div>
              <div className="mt-2 text-lg font-semibold text-white">偏离参考轨迹 90 米</div>
              <div className="text-sm text-steel">建议回到最近轨迹点，或改为最近接驳点撤离。</div>
            </div>
            <div className="grid gap-3">
              <Button
                data-testid="safety-drawer-return"
                onClick={() => {
                  setPhase("returning");
                  setDrawerOpen(false);
                }}
              >
                返航到最近安全点
              </Button>
              <Button
                data-testid="safety-drawer-evacuate"
                variant="secondary"
                onClick={() => {
                  setPhase("returning");
                  setDrawerOpen(false);
                }}
              >
                撤离到接驳点
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}

function SummaryPage({ bundle }: { bundle: AppBundle }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8">
      <BackBar label="结束总结页" />
      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardContent className="space-y-5">
            <Badge>快速总结</Badge>
            <h1 className="text-4xl font-semibold text-white">这次 Trip 完成了吗？</h1>
            <div className="space-y-3">
              {bundle.summaryStory.quickSummary.map((item) => (
                <div key={item} className="rounded-[24px] border border-white/8 bg-white/5 p-4 text-sm text-white">
                  {item}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(bundle.summaryStory.keyMetrics).map(([key, value]) => (
                <MetricCard key={key} icon={<Gauge className="h-4 w-4" />} label={key} value={String(value)} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-5">
            <Badge className="text-moss">深度总结入口</Badge>
            <h2 className="text-3xl font-semibold text-white">Trip 结果反哺 Route 展示</h2>
            <p className="text-sm leading-7 text-steel">
              深度总结不是孤立工具页，而是新的 Route 展示素材来源。后续可把真实 Trip 结果回流为新的展示入口和分享资产。
            </p>
            <div className="space-y-4">
              {bundle.summaryStory.chapters.map((chapter) => (
                <div key={chapter.title} className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                  <div className="text-lg font-semibold text-white">{chapter.title}</div>
                  <div className="mt-2 text-sm leading-7 text-steel">{chapter.detail}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link to="/render/trip-summary">打开深度总结回放</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/">返回 Route 入口</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function BackBar({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-steel">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Link>
      </Button>
      <span>{label}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-4 text-sm text-steel">
        Loading T03 bundle...
      </div>
    </main>
  );
}

export default function App() {
  const bundle = useBundle();
  if (!bundle) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<PrototypeHome bundle={bundle} />} />
      <Route path="/route-detail" element={<RouteDetailPage bundle={bundle} />} />
      <Route path="/trip-ready" element={<TripReadyPage bundle={bundle} />} />
      <Route path="/map" element={<MapPage bundle={bundle} />} />
      <Route path="/summary" element={<SummaryPage bundle={bundle} />} />
      <Route path="/render/route-teaser" element={<RenderRouteTeaser bundle={bundle} />} />
      <Route path="/render/trip-summary" element={<RenderTripSummary bundle={bundle} />} />
    </Routes>
  );
}

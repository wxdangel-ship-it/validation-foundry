import type { MapPoint } from "../components/map-stage";
import type {
  GpsStatus,
  PrototypeMode,
  RecordingStatus,
  SatelliteStatus,
  SummaryStatus,
  WarningLevel,
} from "../state/prototype-machine";

type Keypoint = {
  keypoint_id: string;
  kind: string;
  name: string;
  lat: number;
  lng: number;
  confidence: string;
  note: string;
};

export type TrackFeature = {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    index: number;
    timestamp?: string;
    speed?: number;
    elevation?: number;
    slope_or_pitch?: number;
    normalized_time?: number;
  };
};

export type T03Bundle = {
  sample: {
    routeId: string;
    routeName: string;
    sourceIdentifier?: string;
    routeDescription: string;
    distanceKm: number;
    durationSeconds: number;
    terrainTags: string[];
    difficulty: string;
    locationLabel: string;
  };
  routeKeypoints: Keypoint[];
  tripTrack: {
    features: TrackFeature[];
  };
};

export type RouteScenario = {
  mode: "platform" | "imported";
  modeLabel: string;
  routeName: string;
  distanceKm: string;
  etaLabel: string;
  difficulty: string;
  routeType: string;
  terrainSummary: string;
  detailSummaryShort: string;
  detailSummaryLong: string;
  recommendedVehicle: string;
  buddyAdvice: string;
  prerequisites: string;
  avoidWhen: string;
  startPoint: MapPoint;
  alternateStartPoint: MapPoint;
  endPoint: MapPoint;
  detourPoints: MapPoint[];
  returnPoints: MapPoint[];
  safetyPoints: MapPoint[];
  anchorPoints: MapPoint[];
  currentPoint: MapPoint;
  routeLine: [number, number][];
};

export type ExploreScenario = {
  exploreAreaName: string;
  summary: string;
  currentStatus: string;
  riskHint: string;
  instructions: string;
  startPoint: MapPoint;
  alternateStartPoint: MapPoint;
  anchorCandidate: MapPoint;
  safetyAnchors: MapPoint[];
  manualMarks: MapPoint[];
  polygon: [number, number][];
  maxRangeLabel: string;
  rangeLabel: string;
};

export type StatusTone = "neutral" | "ok" | "warning" | "critical";

export type OffroadStatusToken = {
  label: string;
  value: string;
  tone: StatusTone;
};

export type OffroadWarning = {
  level: WarningLevel;
  title: string;
  detail: string;
  suggestion: string;
};

export type OffroadMapScenario = {
  mode: PrototypeMode;
  modeLabel: string;
  headerStatuses: OffroadStatusToken[];
  referenceLine: [number, number][];
  actualTrackLine: [number, number][];
  polygon?: [number, number][];
  points: MapPoint[];
  keyPoints: MapPoint[];
  bottomPrimaryLabel: string;
  bottomPrimaryValue: string;
  bottomSecondaryLabel: string;
  bottomSecondaryValue: string;
  bottomHint: string;
  warning: OffroadWarning;
  currentBearing: number;
};

export type SafetyDrawerScenario = {
  mode: PrototypeMode;
  currentStatusLabel: string;
  currentStatusSummary: string;
  conservativeActions: string[];
  externalActions: { label: string; note: string }[];
  satelliteEntryLabel: string;
};

export type SummarySegment = {
  id: string;
  label: string;
  title: string;
  summary: string;
  chip: string;
  note: string;
  startIndex: number;
  endIndex: number;
};

export type SummaryVehicleHighlight = {
  label: string;
  value: string;
  detail: string;
  source: "derived" | "mock";
};

export type SummaryTrackSample = {
  index: number;
  timeLabel: string;
  speed: number;
  elevation: number;
  slope: number;
  risk: number;
  lng: number;
  lat: number;
};

export type SummaryScenario = {
  mode: PrototypeMode;
  modeLabel: string;
  routeName: string;
  completionStatus: SummaryStatus;
  completionLabel: string;
  totalDistance: string;
  totalDuration: string;
  startTime: string;
  endTime: string;
  retreatStatus: string;
  portraitTags: string[];
  portraitSummary: string;
  challengeIndex: string;
  keySegments: SummarySegment[];
  vehicleHighlights: SummaryVehicleHighlight[];
  feedbackSummary: string;
  feedbackActions: { label: string; note: string }[];
  footerActions: {
    save: string;
    share: string;
    feedback: string;
  };
  actualTrackLine: [number, number][];
  highlightedSegments: Record<string, [number, number][]>;
  mapPoints: MapPoint[];
  trackSamples: SummaryTrackSample[];
  timelineEvents: { id: string; label: string; index: number }[];
};

type MetricsBundle = {
  routeLine: [number, number][];
  currentIndex: number;
  currentBearing: number;
  startTime: string;
  endTime: string;
  speedSeries: number[];
  elevationSeries: number[];
  slopeSeries: number[];
  samples: SummaryTrackSample[];
  hardestIndex: number;
  fastestIndex: number;
  slowSpan: { startIndex: number; endIndex: number };
};

let bundleCache: T03Bundle | null = null;

function durationLabel(durationSeconds: number) {
  const totalMinutes = Math.round(durationSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} 小时 ${minutes} 分` : `${minutes} 分钟`;
}

function toPoint(id: string, name: string, kind: MapPoint["kind"], lng: number, lat: number): MapPoint {
  return { id, name, kind, lng, lat };
}

function toTrackFeature(
  index: number,
  coordinates: [number, number],
  timestamp: string,
  speed: number,
  elevation: number,
  slope: number,
  normalizedTime: number,
): TrackFeature {
  return {
    geometry: {
      coordinates,
    },
    properties: {
      index,
      timestamp,
      speed,
      elevation,
      slope_or_pitch: slope,
      normalized_time: normalizedTime,
    },
  };
}

function buildFallbackBundle(): T03Bundle {
  const timestamps = [
    "2018-10-26T09:18:57Z",
    "2018-10-26T09:20:57Z",
    "2018-10-26T09:22:57Z",
    "2018-10-26T09:24:57Z",
    "2018-10-26T09:26:57Z",
    "2018-10-26T09:28:57Z",
    "2018-10-26T09:30:57Z",
    "2018-10-26T09:32:57Z",
    "2018-10-26T09:34:57Z",
    "2018-10-26T09:36:57Z",
    "2018-10-26T09:38:57Z",
    "2018-10-26T09:40:57Z",
    "2018-10-26T09:42:57Z",
    "2018-10-26T09:44:57Z",
    "2018-10-26T09:48:30Z",
  ];
  const routeLine: [number, number][] = [
    [121.033981, 31.434921],
    [121.033469, 31.435249],
    [121.03268, 31.43707],
    [121.034005, 31.440927],
    [121.03898, 31.445626],
    [121.037515, 31.448749],
    [121.033437, 31.450465],
    [121.029116, 31.450938],
    [121.025632, 31.446771],
    [121.023628, 31.442908],
    [121.022664, 31.43878],
    [121.024773, 31.436085],
    [121.028981, 31.435435],
    [121.031755, 31.435006],
    [121.034022, 31.434895],
  ];
  const speeds = [0, 6, 12, 18, 26, 24, 16, 9, 7, 8, 11, 13, 10, 12, 6];
  const elevations = [4, 4, 5, 6, 7, 7, 6, 5, 4, 4, 3, 3, 3, 3, 2];
  const slopes = [0, 4, 8, 12, 10, -5, -9, -14, 6, 8, 3, -2, -4, -3, 0];

  return {
    sample: {
      routeId: "liuzhijiao_1989358",
      routeName: "昆山周市镇近环线 #1989358",
      sourceIdentifier: "#1989358",
      routeDescription:
        "六只脚原始轨迹 #1989358 位于昆山周市镇至双凤镇一带，长度约 7.5 公里，官方难度为“专家级”，适合作为短线试车或熟悉路线的原型样例。",
      distanceKm: 7.463,
      durationSeconds: 1773,
      terrainTags: ["低海拔平原", "近环线", "短线试车", "自驾"],
      difficulty: "专家级",
      locationLabel: "昆山周市镇 - 双凤镇",
    },
    routeKeypoints: [
      {
        keypoint_id: "kp_entry",
        kind: "entry",
        name: "新闯路起点",
        lat: 31.434921,
        lng: 121.033981,
        confidence: "high",
        note: "源自六只脚 1989358 起点逆地理编码。",
      },
      {
        keypoint_id: "kp_regroup",
        kind: "regroup",
        name: "双凤镇中段参考点",
        lat: 31.446771,
        lng: 121.025632,
        confidence: "high",
        note: "源自六只脚 1989358 中点逆地理编码。",
      },
      {
        keypoint_id: "kp_risk",
        kind: "risk",
        name: "周市镇风险观察点（原型锚点）",
        lat: 31.440118,
        lng: 121.031954,
        confidence: "medium",
        note: "原型锚点，基于样例轨迹第 50 个点派生。",
      },
      {
        keypoint_id: "kp_retreat",
        kind: "retreat",
        name: "新闯路回撤参考点",
        lat: 31.435435,
        lng: 121.028981,
        confidence: "medium",
        note: "原型锚点，基于样例轨迹 80% 段位派生。",
      },
      {
        keypoint_id: "kp_exit",
        kind: "exit",
        name: "新闯路终点",
        lat: 31.434895,
        lng: 121.034022,
        confidence: "high",
        note: "源自六只脚 1989358 终点逆地理编码。",
      },
    ],
    tripTrack: {
      features: routeLine.map((coordinates, index) =>
        toTrackFeature(
          index,
          coordinates,
          timestamps[index],
          speeds[index],
          elevations[index],
          slopes[index],
          index / Math.max(routeLine.length - 1, 1),
        ),
      ),
    },
  };
}

export async function loadDemoBundle() {
  if (bundleCache) {
    return bundleCache;
  }
  try {
    const response = await fetch("./demo-data.json");
    if (!response.ok) {
      throw new Error(`demo-data fetch failed: ${response.status}`);
    }
    bundleCache = (await response.json()) as T03Bundle;
  } catch {
    bundleCache = buildFallbackBundle();
  }
  return bundleCache;
}

function buildRouteLine(bundle: T03Bundle) {
  return bundle.tripTrack.features.map((feature) => feature.geometry.coordinates);
}

function formatClockLabel(timestamp?: string) {
  if (!timestamp) {
    return "--:--";
  }
  const date = new Date(timestamp);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function haversineMeters(a: [number, number], b: [number, number]) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(b[1] - a[1]);
  const dLng = toRadians(b[0] - a[0]);
  const latA = toRadians(a[1]);
  const latB = toRadians(b[1]);
  const arc =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(latA) * Math.cos(latB);
  const angle = 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
  return earthRadiusMeters * angle;
}

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

function computeBearing(from: [number, number], to: [number, number]) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const toDegrees = (value: number) => (value * 180) / Math.PI;
  const deltaLng = toRadians(to[0] - from[0]);
  const y = Math.sin(deltaLng) * Math.cos(toRadians(to[1]));
  const x =
    Math.cos(toRadians(from[1])) * Math.sin(toRadians(to[1])) -
    Math.sin(toRadians(from[1])) * Math.cos(toRadians(to[1])) * Math.cos(deltaLng);
  return ((toDegrees(Math.atan2(y, x)) + 360) % 360) - 180;
}

function clampIndex(index: number, max: number) {
  return Math.max(0, Math.min(index, max));
}

function pickTrackWindow(routeLine: [number, number][], centerIndex: number, radius: number) {
  const startIndex = clampIndex(centerIndex - radius, routeLine.length - 1);
  const endIndex = clampIndex(centerIndex + radius, routeLine.length - 1);
  return routeLine.slice(startIndex, endIndex + 1);
}

function buildRoutePoints(bundle: T03Bundle) {
  const [entry, regroup, risk, retreat, exit] = bundle.routeKeypoints;
  const middleIndex = Math.floor(bundle.tripTrack.features.length * 0.55);
  const currentFeature = bundle.tripTrack.features[middleIndex] ?? bundle.tripTrack.features[0];
  return {
    startPoint: toPoint(entry.keypoint_id, entry.name, "start", entry.lng, entry.lat),
    alternateStartPoint: toPoint(regroup.keypoint_id, regroup.name, "anchor", regroup.lng, regroup.lat),
    endPoint: toPoint(exit.keypoint_id, exit.name, "end", exit.lng, exit.lat),
    detourPoints: [toPoint(regroup.keypoint_id, regroup.name, "detour", regroup.lng, regroup.lat)],
    returnPoints: [toPoint(retreat.keypoint_id, retreat.name, "return", retreat.lng, retreat.lat)],
    safetyPoints: [toPoint(risk.keypoint_id, risk.name, "safety", risk.lng, risk.lat)],
    anchorPoints: [toPoint(regroup.keypoint_id, regroup.name, "anchor", regroup.lng, regroup.lat)],
    currentPoint: toPoint(
      "current",
      "当前位置",
      "current",
      currentFeature.geometry.coordinates[0],
      currentFeature.geometry.coordinates[1],
    ),
  };
}

function buildTrackMetrics(bundle: T03Bundle): MetricsBundle {
  const routeLine = buildRouteLine(bundle);
  const features = bundle.tripTrack.features;
  const currentIndex = clampIndex(Math.floor(features.length * 0.58), features.length - 1);
  const previousIndex = clampIndex(currentIndex - 1, features.length - 1);
  const currentBearing = computeBearing(routeLine[previousIndex], routeLine[currentIndex]);
  const speedSeries = features.map((feature) => feature.properties.speed ?? 0);
  const elevationSeries = features.map((feature) => feature.properties.elevation ?? 0);
  const slopeSeries = features.map((feature) => feature.properties.slope_or_pitch ?? 0);
  const startTime = formatClockLabel(features[0]?.properties.timestamp);
  const endTime = formatClockLabel(features[features.length - 1]?.properties.timestamp);

  const hardestIndex = slopeSeries.reduce(
    (bestIndex, value, index) => (Math.abs(value) > Math.abs(slopeSeries[bestIndex] ?? 0) ? index : bestIndex),
    0,
  );
  const fastestIndex = speedSeries.reduce(
    (bestIndex, value, index) => (value > (speedSeries[bestIndex] ?? 0) ? index : bestIndex),
    0,
  );

  let slowStart = 0;
  let slowEnd = 0;
  let currentSlowStart = -1;
  speedSeries.forEach((value, index) => {
    if (value <= 8 && currentSlowStart === -1) {
      currentSlowStart = index;
    }
    if ((value > 8 || index === speedSeries.length - 1) && currentSlowStart !== -1) {
      const endIndex = value > 8 ? index - 1 : index;
      if (endIndex - currentSlowStart > slowEnd - slowStart) {
        slowStart = currentSlowStart;
        slowEnd = endIndex;
      }
      currentSlowStart = -1;
    }
  });

  const samples = features.map((feature) => {
    const slope = feature.properties.slope_or_pitch ?? 0;
    const speed = feature.properties.speed ?? 0;
    const risk = Math.min(100, Math.round(Math.abs(slope) * 3 + Math.max(0, 14 - speed) * 2));
    return {
      index: feature.properties.index,
      timeLabel: formatClockLabel(feature.properties.timestamp),
      speed,
      elevation: feature.properties.elevation ?? 0,
      slope,
      risk,
      lng: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
    };
  });

  return {
    routeLine,
    currentIndex,
    currentBearing,
    startTime,
    endTime,
    speedSeries,
    elevationSeries,
    slopeSeries,
    samples,
    hardestIndex,
    fastestIndex,
    slowSpan: {
      startIndex: slowStart,
      endIndex: slowEnd,
    },
  };
}

export function buildRouteScenario(bundle: T03Bundle, mode: "platform" | "imported"): RouteScenario {
  const points = buildRoutePoints(bundle);
  const terrainSummary = bundle.sample.terrainTags.join(" / ");
  return {
    mode,
    modeLabel: mode === "platform" ? "平台路线" : "导入轨迹 / 自定义参考路线",
    routeName: bundle.sample.routeName,
    distanceKm: `${bundle.sample.distanceKm.toFixed(1)} km`,
    etaLabel: durationLabel(bundle.sample.durationSeconds),
    difficulty: bundle.sample.difficulty,
    routeType: mode === "platform" ? "平台标准越野参考路线" : "导入轨迹提炼后的参考路线",
    terrainSummary,
    detailSummaryShort:
      mode === "platform"
        ? "平台已整理：保留原始轨迹、关键点与起终点。"
        : "自动提炼：保留导入轨迹、关键点与起终点。",
    detailSummaryLong:
      mode === "platform"
        ? "平台标准路线说明：基于六只脚样例轨迹整理，当前用于展示完整参考路线、入口位置、关键锚点和离线准备状态，不代表正式导航闭环。"
        : "导入轨迹详细说明：基于同一条六只脚样例轨迹生成，当前以前台摘要形式展示导入结果、关键锚点和离线准备状态，不代表正式轨迹解析服务。",
    recommendedVehicle: "有非铺装经验的高底盘 SUV / 四驱车型",
    buddyAdvice: "建议至少 2 车同行",
    prerequisites: "先确认入口路况、会车点和离线包",
    avoidWhen: "雨后、夜间首次进场、单车无补给",
    startPoint: points.startPoint,
    alternateStartPoint: points.alternateStartPoint,
    endPoint: points.endPoint,
    detourPoints: points.detourPoints,
    returnPoints: points.returnPoints,
    safetyPoints: points.safetyPoints,
    anchorPoints: points.anchorPoints,
    currentPoint: points.currentPoint,
    routeLine: buildRouteLine(bundle),
  };
}

function offsetPoint(
  point: MapPoint,
  lngOffset: number,
  latOffset: number,
  id: string,
  name: string,
  kind: MapPoint["kind"],
) {
  return toPoint(id, name, kind, point.lng + lngOffset, point.lat + latOffset);
}

function computeRouteBounds(routeLine: [number, number][]) {
  const lngValues = routeLine.map(([lng]) => lng);
  const latValues = routeLine.map(([, lat]) => lat);
  const minLng = Math.min(...lngValues);
  const maxLng = Math.max(...lngValues);
  const minLat = Math.min(...latValues);
  const maxLat = Math.max(...latValues);
  return {
    minLng,
    maxLng,
    minLat,
    maxLat,
    centerLat: (minLat + maxLat) / 2,
  };
}

function toKilometers(bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number; centerLat: number }) {
  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos((bounds.centerLat * Math.PI) / 180);
  return {
    widthKm: (bounds.maxLng - bounds.minLng) * kmPerDegLng,
    heightKm: (bounds.maxLat - bounds.minLat) * kmPerDegLat,
  };
}

function formatRangeLabel(widthKm: number, heightKm: number) {
  return `${widthKm.toFixed(1)} km x ${heightKm.toFixed(1)} km`;
}

export function buildExploreScenario(bundle: T03Bundle): ExploreScenario {
  const routePoints = buildRoutePoints(bundle);
  const base = routePoints.startPoint;
  const bounds = computeRouteBounds(buildRouteLine(bundle));
  const defaultLngPadding = 0.004;
  const defaultLatPadding = 0.004;
  const maxLngPadding = 0.0075;
  const maxLatPadding = 0.0075;
  const defaultSize = toKilometers({
    ...bounds,
    minLng: bounds.minLng - defaultLngPadding,
    maxLng: bounds.maxLng + defaultLngPadding,
    minLat: bounds.minLat - defaultLatPadding,
    maxLat: bounds.maxLat + defaultLatPadding,
  });
  const maxSize = toKilometers({
    ...bounds,
    minLng: bounds.minLng - maxLngPadding,
    maxLng: bounds.maxLng + maxLngPadding,
    minLat: bounds.minLat - maxLatPadding,
    maxLat: bounds.maxLat + maxLatPadding,
  });
  return {
    exploreAreaName: `${bundle.sample.locationLabel} 自由探索区`,
    summary: "围绕新闯路起点、双凤镇中段参考点和样例轨迹包络建立自由探索计划。",
    currentStatus: "待确认边界",
    riskHint: "当前阶段仅验证计划与准备闭环，不代表真实越野导航已完成。",
    instructions: "先设起点，再加至少一个安全锚点，最后确认探索范围并下载离线包。",
    startPoint: base,
    alternateStartPoint: offsetPoint(base, 0.0025, 0.0015, "explore-start-alt", "新闯路备用集合点", "start"),
    anchorCandidate: toPoint(
      "anchor-candidate",
      "双凤镇安全锚点候选",
      "safety",
      routePoints.anchorPoints[0].lng,
      routePoints.anchorPoints[0].lat,
    ),
    safetyAnchors: [
      toPoint("safety-1", "周市镇返程安全锚点", "safety", routePoints.returnPoints[0].lng, routePoints.returnPoints[0].lat),
    ],
    manualMarks: [
      toPoint(
        "manual-1",
        "手动标点（mock）",
        "manual",
        routePoints.returnPoints[0].lng + 0.0022,
        routePoints.returnPoints[0].lat + 0.0018,
      ),
    ],
    polygon: [
      [bounds.minLng - defaultLngPadding, bounds.minLat - defaultLatPadding],
      [bounds.maxLng + defaultLngPadding, bounds.minLat - defaultLatPadding],
      [bounds.maxLng + defaultLngPadding, bounds.maxLat + defaultLatPadding],
      [bounds.minLng - defaultLngPadding, bounds.maxLat + defaultLatPadding],
    ],
    maxRangeLabel: `最大建议包络 ${formatRangeLabel(maxSize.widthKm, maxSize.heightKm)}`,
    rangeLabel: `默认探索面 ${formatRangeLabel(defaultSize.widthKm, defaultSize.heightKm)}`,
  };
}

function buildHeaderStatuses(
  offlineState: "not_downloaded" | "downloading" | "downloaded",
  gpsStatus: GpsStatus,
  recordingStatus: RecordingStatus,
  satelliteStatus: SatelliteStatus,
) {
  const offlineValue =
    offlineState === "downloaded" ? "离线就绪" : offlineState === "downloading" ? "下载中" : "离线待补";
  const offlineTone: StatusTone = offlineState === "downloaded" ? "ok" : offlineState === "downloading" ? "warning" : "critical";
  const gpsTone: StatusTone = gpsStatus === "good" ? "ok" : "warning";
  const recordingTone: StatusTone = recordingStatus === "recording" ? "ok" : "warning";
  const satelliteTone: StatusTone = satelliteStatus === "linked" ? "ok" : satelliteStatus === "ready" ? "warning" : "neutral";
  return [
    { label: "离线", value: offlineValue, tone: offlineTone },
    { label: "GPS", value: gpsStatus === "good" ? "正常" : "受限", tone: gpsTone },
    { label: "记录", value: recordingStatus === "recording" ? "记录中" : "已暂停", tone: recordingTone },
    { label: "卫星", value: satelliteStatus === "linked" ? "已连接" : satelliteStatus === "ready" ? "待命" : "占位", tone: satelliteTone },
  ];
}

function buildWarning(mode: PrototypeMode, level: WarningLevel): OffroadWarning {
  if (mode === "explore") {
    if (level === 1) {
      return {
        level,
        title: "探索范围内",
        detail: "当前仍处于已确认探索范围内，保持对安全锚点的感知。",
        suggestion: "底部轻提示，不打断当前探索。",
      };
    }
    if (level === 2) {
      return {
        level,
        title: "接近边界",
        detail: "已接近探索范围边缘，建议减速并确认回撤方向。",
        suggestion: "黄色高亮提示，提醒接近风险。",
      };
    }
    if (level === 3) {
      return {
        level,
        title: "已离开范围",
        detail: "当前位置已超出建议包络，建议立即打开安全抽屉并沿已走轨迹返回。",
        suggestion: "建议回撤到最近安全锚点。",
      };
    }
    return {
      level,
      title: "远离安全锚点",
      detail: "当前位置距离安全锚点过远，建议立即回撤或使用卫星通讯入口。",
      suggestion: "高优先级提示，强调卫星通讯入口。",
    };
  }

  if (level === 1) {
    return {
      level,
      title: "沿参考路线继续前行",
      detail: "当前状态稳定，保持沿参考路线或导入轨迹继续推进。",
      suggestion: "轻提示，不打断操作。",
    };
  }
  if (level === 2) {
    return {
      level,
      title: mode === "platform" ? "接近回撤点" : "接近导入轨迹回撤点",
      detail: "当前已接近回撤点，建议关注接驳线与行进方向。",
      suggestion: "黄条提示，强化注意力。",
    };
  }
  if (level === 3) {
    return {
      level,
      title: mode === "platform" ? "偏离平台路线" : "偏离导入轨迹",
      detail: "当前位置与参考线产生明显偏离，建议打开安全抽屉并选择保守动作。",
      suggestion: "风险提示，建议寻迹返航。",
    };
  }
  return {
    level,
    title: "长时间停滞 / 高优先级风险",
    detail: "已进入高优先级风险状态，建议立即回撤或使用卫星通讯入口。",
    suggestion: "立即回撤或联络。",
  };
}

function getDistanceBetweenPointAndPoint(a: MapPoint, b: MapPoint) {
  return haversineMeters([a.lng, a.lat], [b.lng, b.lat]);
}

export function buildOffroadMapScenario(
  bundle: T03Bundle,
  mode: PrototypeMode,
  options?: {
    offlineState?: "not_downloaded" | "downloading" | "downloaded";
    warningLevel?: WarningLevel;
    gpsStatus?: GpsStatus;
    recordingStatus?: RecordingStatus;
    satelliteStatus?: SatelliteStatus;
  },
): OffroadMapScenario {
  const metrics = buildTrackMetrics(bundle);
  const routeScenario = buildRouteScenario(bundle, mode === "imported" ? "imported" : "platform");
  const exploreScenario = buildExploreScenario(bundle);
  const offlineState = options?.offlineState ?? "downloaded";
  const warningLevel = options?.warningLevel ?? (mode === "explore" ? 2 : mode === "imported" ? 2 : 1);
  const gpsStatus = options?.gpsStatus ?? "good";
  const recordingStatus = options?.recordingStatus ?? "recording";
  const satelliteStatus = options?.satelliteStatus ?? (mode === "platform" ? "ready" : "standby");
  const warning = buildWarning(mode, warningLevel);

  if (mode === "explore") {
    const startPoint = exploreScenario.alternateStartPoint;
    const currentPoint = toPoint(
      "explore-current",
      "当前位置",
      "current",
      metrics.samples[Math.floor(metrics.samples.length * 0.62)]?.lng ?? startPoint.lng,
      metrics.samples[Math.floor(metrics.samples.length * 0.62)]?.lat ?? startPoint.lat,
    );
    const points = [
      startPoint,
      ...exploreScenario.safetyAnchors,
      ...exploreScenario.manualMarks,
      currentPoint,
    ];
    const nearestAnchorMeters = Math.min(
      ...exploreScenario.safetyAnchors.map((anchor) => getDistanceBetweenPointAndPoint(currentPoint, anchor)),
    );
    const startMeters = getDistanceBetweenPointAndPoint(currentPoint, startPoint);
    const exploreHintByLevel = {
      1: "处于探索范围内，继续保持与安全锚点的关系。",
      2: "接近边界，建议先确认回撤方向。",
      3: "已离开建议范围，建议立即回到已走轨迹。",
      4: "远离安全锚点，优先考虑回撤或联络。",
    } as const;
    return {
      mode,
      modeLabel: "自由探索",
      headerStatuses: buildHeaderStatuses(offlineState, gpsStatus, recordingStatus, satelliteStatus),
      referenceLine: [],
      actualTrackLine: metrics.routeLine.slice(0, metrics.currentIndex + 1),
      polygon: exploreScenario.polygon,
      points,
      keyPoints: points.filter((point) => point.kind !== "current"),
      bottomPrimaryLabel: "距离起点",
      bottomPrimaryValue: formatDistance(startMeters),
      bottomSecondaryLabel: "距离最近安全锚点",
      bottomSecondaryValue: formatDistance(nearestAnchorMeters),
      bottomHint: exploreHintByLevel[warningLevel],
      warning,
      currentBearing: metrics.currentBearing,
    };
  }

  const currentPoint = routeScenario.currentPoint;
  const nextKeyPoint = routeScenario.anchorPoints[0];
  const primaryMeters = getDistanceBetweenPointAndPoint(currentPoint, nextKeyPoint);
  const destinationMeters = getDistanceBetweenPointAndPoint(currentPoint, routeScenario.endPoint);
  const points = [
    routeScenario.startPoint,
    routeScenario.endPoint,
    ...routeScenario.detourPoints,
    ...routeScenario.returnPoints,
    ...routeScenario.safetyPoints,
    ...routeScenario.anchorPoints,
    currentPoint,
  ];
  return {
    mode,
    modeLabel: mode === "platform" ? "平台路线" : "导入轨迹 / 自定义参考路线",
    headerStatuses: buildHeaderStatuses(offlineState, gpsStatus, recordingStatus, satelliteStatus),
    referenceLine: routeScenario.routeLine,
    actualTrackLine: metrics.routeLine.slice(0, metrics.currentIndex + 1),
    points,
    keyPoints: points.filter((point) => point.kind !== "current"),
    bottomPrimaryLabel: "距离下一关键点",
    bottomPrimaryValue: formatDistance(primaryMeters),
    bottomSecondaryLabel: "距离终点",
    bottomSecondaryValue: formatDistance(destinationMeters),
    bottomHint: warningLevel === 1 ? "沿参考路线继续前行。" : warning.suggestion,
    warning,
    currentBearing: metrics.currentBearing,
  };
}

export function buildSafetyDrawerScenario(mode: PrototypeMode, warningLevel: WarningLevel): SafetyDrawerScenario {
  const warning = buildWarning(mode, warningLevel);
  if (mode === "explore") {
    return {
      mode,
      currentStatusLabel: warning.title,
      currentStatusSummary: warning.detail,
      conservativeActions: ["沿已走轨迹返回", "回起点", "回最近安全锚点"],
      externalActions: [
        { label: "风险标记入口", note: "记录当前位置风险，保留原型占位。" },
        { label: "发送当前位置（占位）", note: "展示外部联络入口，不接真实服务。" },
        { label: "卫星通讯入口（占位）", note: "与顶部卫星状态一致，仅做原型能力表达。" },
      ],
      satelliteEntryLabel: "打开卫星通讯入口（占位）",
    };
  }
  return {
    mode,
    currentStatusLabel: warning.title,
    currentStatusSummary: warning.detail,
    conservativeActions: ["寻迹返航", "回接驳点", "回终点 / 回撤点"],
    externalActions: [
      { label: "风险标记入口", note: "记录偏离或风险点，便于总结与反馈。" },
      { label: "发送当前位置（占位）", note: "仅表达联络动作，不接真实服务。" },
      { label: "卫星通讯入口（占位）", note: "保持和顶部状态栏同一套语义。" },
    ],
    satelliteEntryLabel: "打开卫星通讯入口（占位）",
  };
}

function sliceSegment(routeLine: [number, number][], centerIndex: number, radius: number) {
  const startIndex = clampIndex(centerIndex - radius, routeLine.length - 1);
  const endIndex = clampIndex(centerIndex + radius, routeLine.length - 1);
  return {
    startIndex,
    endIndex,
    line: routeLine.slice(startIndex, endIndex + 1),
  };
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function speedBand(speed: number) {
  if (speed < 8) {
    return "低速观察";
  }
  if (speed < 18) {
    return "稳态推进";
  }
  return "快速连接";
}

function slopeBand(slope: number) {
  if (slope > 6) {
    return "持续爬升";
  }
  if (slope < -6) {
    return "连续下坡";
  }
  return "路段平缓";
}

function riskBand(risk: number) {
  if (risk < 25) {
    return "姿态稳定";
  }
  if (risk < 50) {
    return "需要注意";
  }
  return "姿态紧张";
}

function feedbackCard(mode: PrototypeMode) {
  if (mode === "platform") {
    return {
      summary: "当前 Trip 可反哺平台 Route，一致性与反馈入口同时保留。",
      actions: [
        { label: "是否与平台 Route 一致", note: "derived 结果，供反馈页继续使用。" },
        { label: "是否提交路线反馈", note: "保留正式反馈入口方向。" },
        { label: "生成分享卡 / 视频 / 3D 回放（占位）", note: "资产入口保留为原型能力。" },
      ],
      footer: {
        save: "保存总结",
        share: "生成分享内容",
        feedback: "提交路线反馈",
      },
    };
  }
  if (mode === "imported") {
    return {
      summary: "当前导入轨迹可保存为自定义路线，也可提交为候选 Route。",
      actions: [
        { label: "是否保存为自定义路线", note: "保留个人路线资产入口。" },
        { label: "是否提交为候选 Route", note: "保留平台回流入口。" },
        { label: "生成分享卡 / 视频 / 3D 回放（占位）", note: "资产能力仍为原型占位。" },
      ],
      footer: {
        save: "保存总结",
        share: "生成分享内容",
        feedback: "保存为候选路线",
      },
    };
  }
  return {
    summary: "当前自由探索可保存为私有探索，并提炼为候选 Route。",
    actions: [
      { label: "是否保存为私有探索", note: "保留个人记录沉淀入口。" },
      { label: "是否提炼为候选 Route", note: "保留候选 Route 反哺入口。" },
      { label: "生成分享卡 / 视频 / 3D 回放（占位）", note: "分享与资产仍为原型占位。" },
    ],
    footer: {
      save: "保存总结",
      share: "生成分享内容",
      feedback: "提炼为候选 Route",
    },
  };
}

export function buildSummaryScenario(
  bundle: T03Bundle,
  mode: PrototypeMode,
  completionStatus: SummaryStatus = "completed",
): SummaryScenario {
  const metrics = buildTrackMetrics(bundle);
  const routePoints = buildRoutePoints(bundle);
  const routeScenario = buildRouteScenario(bundle, mode === "imported" ? "imported" : "platform");
  const exploreScenario = buildExploreScenario(bundle);
  const hardest = sliceSegment(metrics.routeLine, metrics.hardestIndex, 18);
  const fastest = sliceSegment(metrics.routeLine, metrics.fastestIndex, 18);
  const cautious = sliceSegment(
    metrics.routeLine,
    Math.round((metrics.slowSpan.startIndex + metrics.slowSpan.endIndex) / 2),
    20,
  );
  const challengeScore = Math.min(10, (average(metrics.speedSeries) / 4 + average(metrics.slopeSeries.map((value) => Math.abs(value))) / 3));
  const highestClimb = Math.max(...metrics.slopeSeries);
  const deepestDrop = Math.min(...metrics.slopeSeries);
  const highestRiskSample = metrics.samples.reduce((best, sample) => (sample.risk > best.risk ? sample : best), metrics.samples[0]);
  const slowMinutes = Math.max(1, Math.round((metrics.slowSpan.endIndex - metrics.slowSpan.startIndex + 1) * (bundle.sample.durationSeconds / metrics.samples.length) / 60));

  const keySegments: SummarySegment[] = [
    {
      id: "hardest",
      label: "最难一段",
      title: "姿态最紧张坡段",
      summary: `坡度峰值 ${highestClimb.toFixed(1)}° / ${deepestDrop.toFixed(1)}°，需要更稳的通过策略。`,
      chip: "derived",
      note: "由轨迹坡度序列提炼，不代表真实车端姿态标定。",
      startIndex: hardest.startIndex,
      endIndex: hardest.endIndex,
    },
    {
      id: "best",
      label: "最精彩一段",
      title: "节奏最顺的一段",
      summary: `最高速度 ${Math.max(...metrics.speedSeries).toFixed(1)} km/h，适合作为亮点回看。`,
      chip: "derived",
      note: "由轨迹速度序列提炼，不代表真实驾驶评分。",
      startIndex: fastest.startIndex,
      endIndex: fastest.endIndex,
    },
    {
      id: "cautious",
      label: "最需要谨慎的一段",
      title: "长时间低速通过区段",
      summary: `连续低速约 ${slowMinutes} 分钟，建议结合回撤点和安全锚点回看。`,
      chip: "derived/mock",
      note: "基于低速段推演风险，不代表真实打滑识别。",
      startIndex: cautious.startIndex,
      endIndex: cautious.endIndex,
    },
  ];

  const trackPoints = [
    routePoints.startPoint,
    routePoints.endPoint,
    ...routePoints.returnPoints,
    ...routePoints.safetyPoints,
    ...routePoints.anchorPoints,
  ];
  if (mode === "explore") {
    trackPoints.push(...exploreScenario.manualMarks);
  }

  const modeLabel =
    mode === "platform" ? "平台路线" : mode === "imported" ? "导入轨迹 / 自定义参考路线" : "自由探索";
  const statusLabel =
    completionStatus === "completed"
      ? "完成"
      : completionStatus === "aborted"
        ? "中止"
        : "回撤完成";
  const retreatStatus =
    completionStatus === "retreated"
      ? "已沿回撤路径收口"
      : mode === "explore"
        ? "按安全锚点收口"
        : "保留回撤点与反馈入口";

  const feedback = feedbackCard(mode);

  return {
    mode,
    modeLabel,
    routeName: bundle.sample.routeName,
    completionStatus,
    completionLabel: statusLabel,
    totalDistance: `${bundle.sample.distanceKm.toFixed(1)} km`,
    totalDuration: durationLabel(bundle.sample.durationSeconds),
    startTime: metrics.startTime,
    endTime: metrics.endTime,
    retreatStatus,
    portraitTags:
      mode === "explore"
        ? ["自由探索", "安全锚点驱动", "边界意识强"]
        : mode === "imported"
          ? ["导入轨迹", "参考线跟进", "短线试车"]
          : ["平台 Route", "平原环线", "短线试车"],
    portraitSummary:
      mode === "explore"
        ? "本次自由探索以起点-锚点-边界三元结构完成闭环，核心价值在于保守收口。"
        : mode === "imported"
          ? "本次导入轨迹以参考线推进为主，重点价值在于形成可保存的自定义参考路线。"
          : "本次平台 Route 运行稳定，关键价值在于对平台整理路线的验证和反馈。",
    challengeIndex: `挑战指数 ${challengeScore.toFixed(1)} / 10（derived）`,
    keySegments,
    vehicleHighlights: [
      {
        label: "最大爬升 / 下坡",
        value: `${highestClimb.toFixed(1)}° / ${deepestDrop.toFixed(1)}°`,
        detail: "derived from slope_or_pitch",
        source: "derived",
      },
      {
        label: "姿态最紧张时刻",
        value: highestRiskSample.timeLabel,
        detail: `${riskBand(highestRiskSample.risk)}，由坡度与速度合成`,
        source: "derived",
      },
      {
        label: "长时间低速通过区段",
        value: `${slowMinutes} 分钟`,
        detail: "derived from low-speed span",
        source: "derived",
      },
      {
        label: "打滑 / 风险区段",
        value: "1 段（原型推演）",
        detail: "mock inference for prototype only",
        source: "mock",
      },
    ],
    feedbackSummary: feedback.summary,
    feedbackActions: feedback.actions,
    footerActions: feedback.footer,
    actualTrackLine: metrics.routeLine,
    highlightedSegments: {
      hardest: hardest.line,
      best: fastest.line,
      cautious: cautious.line,
    },
    mapPoints: trackPoints,
    trackSamples: metrics.samples,
    timelineEvents: [
      { id: "start", label: "起点", index: 0 },
      { id: "hardest", label: "最难一段", index: hardest.startIndex },
      { id: "best", label: "最精彩一段", index: fastest.startIndex },
      { id: "cautious", label: "谨慎区段", index: cautious.startIndex },
      { id: "retreat", label: "回撤点", index: metrics.samples.length - 1 },
    ],
  };
}

export function buildSensorSummary(sample: SummaryTrackSample) {
  return [
    {
      label: "速度节奏",
      value: speedBand(sample.speed),
      detail: `${sample.speed.toFixed(1)} km/h · derived`,
    },
    {
      label: "海拔 / 坡度",
      value: slopeBand(sample.slope),
      detail: `${sample.elevation.toFixed(0)} m / ${sample.slope.toFixed(1)}° · derived`,
    },
    {
      label: "姿态风险",
      value: riskBand(sample.risk),
      detail: `风险指数 ${sample.risk} / 100 · derived`,
    },
  ];
}

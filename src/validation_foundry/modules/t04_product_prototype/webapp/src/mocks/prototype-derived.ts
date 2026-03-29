import type { MapPoint } from "../components/map-stage";
import type { ExploreScenario, RouteScenario, T03Bundle } from "./sample-data";

export type StatusTone = "ok" | "attention" | "alert" | "placeholder";

export type WarningLevel = 1 | 2 | 3 | 4;

export type LightStatus = {
  label: string;
  value: string;
  tone: StatusTone;
};

export type BottomMetric = {
  label: string;
  value: string;
};

export type WarningState = {
  level: WarningLevel;
  badge: string;
  title: string;
  description: string;
  suggestion: string;
};

export type SafetyAction = {
  id: string;
  label: string;
  detail: string;
};

export type SafetyDrawerScenario = {
  currentStatusLabel: string;
  currentStatusSummary: string;
  conservativeActions: SafetyAction[];
  externalActions: SafetyAction[];
};

export type OffroadMode = "platform" | "imported" | "explore";

export type OffroadMapScenario = {
  mode: OffroadMode;
  modeLabel: string;
  referenceLabel: string;
  currentPositionLabel: string;
  statusBar: LightStatus[];
  referenceLine: [number, number][];
  actualTrackLine: [number, number][];
  highlightLine: [number, number][];
  headingDegrees: number;
  points: MapPoint[];
  polygon?: [number, number][];
  bottomMetrics: [BottomMetric, BottomMetric];
  bottomHint: string;
  warning: WarningState;
  safetyDrawer: SafetyDrawerScenario;
  sourceNote: string;
};

export type SummaryStatus = "完成" | "中止" | "回撤完成";

export type SummarySegment = {
  id: string;
  title: string;
  tag: string;
  description: string;
  evidence: string;
  caution: string;
  sourceNote: string;
  startIndex: number;
  endIndex: number;
  line: [number, number][];
};

export type SummaryFinding = {
  label: string;
  value: string;
  detail: string;
  sourceNote: string;
};

export type TimelineEvent = {
  id: string;
  label: string;
  index: number;
  timeLabel: string;
};

export type SensorStrip = {
  label: string;
  value: string;
  detail: string;
  sourceNote: string;
};

export type FeedbackAction = {
  label: string;
  detail: string;
};

export type TripSummaryScenario = {
  mode: OffroadMode;
  modeLabel: string;
  routeName: string;
  completionStatus: SummaryStatus;
  totalDistance: string;
  totalDuration: string;
  startTimeLabel: string;
  endTimeLabel: string;
  retreatStatus: string;
  overviewNote: string;
  personaTags: string[];
  personaSummary: string;
  challengeBadge: string;
  segments: SummarySegment[];
  findings: SummaryFinding[];
  feedbackTitle: string;
  feedbackSummary: string;
  feedbackActions: FeedbackAction[];
  shareActions: FeedbackAction[];
  actualTrackLine: [number, number][];
  points: MapPoint[];
  highlightSegmentId: string;
  timeline: TimelineEvent[];
  sensorStrips: SensorStrip[];
  sourceNote: string;
  footerActions: [string, string, string];
};

type TrackMetricPoint = {
  index: number;
  lng: number;
  lat: number;
  timestamp: string;
  speed: number;
  elevation: number;
  slope: number;
};

type OffroadOverrides = {
  warning?: WarningState;
};

type SummaryOverrides = {
  completionStatus?: SummaryStatus;
  retreatStatus?: string;
  overviewNote?: string;
  highlightSegmentId?: string;
};

function trackPoints(bundle: T03Bundle): TrackMetricPoint[] {
  return bundle.tripTrack.features.map((feature, index) => ({
    index,
    lng: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
    timestamp: feature.properties?.timestamp ?? `2018-10-26T09:${String(18 + Math.floor(index / 2)).padStart(2, "0")}:00Z`,
    speed: feature.properties?.speed ?? 0,
    elevation: feature.properties?.elevation ?? 0,
    slope: feature.properties?.slope_or_pitch ?? 0,
  }));
}

function formatClock(timestamp: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(new Date(timestamp));
}

function kilometers(value: number) {
  return `${value.toFixed(1)} km`;
}

function meters(value: number) {
  return `${Math.round(value)} m`;
}

function haversineKm(a: [number, number], b: [number, number]) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const root =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const arc = 2 * Math.atan2(Math.sqrt(root), Math.sqrt(1 - root));
  return earthRadiusKm * arc;
}

function bearingBetween(a: [number, number], b: [number, number]) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const toDeg = (value: number) => (value * 180) / Math.PI;
  const lngDelta = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const y = Math.sin(lngDelta) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lngDelta);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function sliceLine(line: [number, number][], startIndex: number, endIndex: number) {
  const safeStart = Math.max(0, startIndex);
  const safeEnd = Math.min(line.length - 1, endIndex);
  return line.slice(safeStart, safeEnd + 1);
}

function toTrackLine(metrics: TrackMetricPoint[]) {
  return metrics.map((point) => [point.lng, point.lat] as [number, number]);
}

function addCurrentPoint(points: MapPoint[], currentPoint: MapPoint) {
  return [...points, currentPoint];
}

function buildStatusBar(mode: OffroadMode): LightStatus[] {
  const modeLabel =
    mode === "platform" ? "平台路线" : mode === "imported" ? "导入轨迹" : "自由探索";
  return [
    { label: "模式", value: modeLabel, tone: "ok" },
    { label: "离线", value: "离线包已就绪", tone: "ok" },
    { label: "GPS", value: "GPS 正常", tone: "ok" },
    { label: "记录", value: "行程记录中", tone: "attention" },
    { label: "卫星通讯", value: "待机占位", tone: "placeholder" },
  ];
}

function warningPalette(level: WarningLevel) {
  if (level === 4) {
    return "高优先级";
  }
  if (level === 3) {
    return "风险提示";
  }
  if (level === 2) {
    return "注意提示";
  }
  return "轻提示";
}

function buildRouteWarning(mode: "platform" | "imported"): WarningState {
  if (mode === "imported") {
    return {
      level: 2,
      badge: warningPalette(2),
      title: "导入轨迹参考偏移",
      description: "当前位置仍可回接参考轨迹，但建议留意回撤点与关键锚点。",
      suggestion: "继续沿自定义参考路线前行，必要时打开安全抽屉。",
    };
  }
  return {
    level: 1,
    badge: warningPalette(1),
    title: "沿平台参考路线继续",
    description: "当前处于平台 Route 参考轨迹附近，轻提示不打断主视图。",
    suggestion: "保持沿参考路线继续前行。",
  };
}

function buildExploreWarning(level: WarningLevel): WarningState {
  if (level === 4) {
    return {
      level,
      badge: warningPalette(level),
      title: "已离开探索范围",
      description: "当前位置已超出确认边界，建议立即回撤或启用卫星通讯入口。",
      suggestion: "优先返回最近安全锚点，再考虑继续探索。",
    };
  }
  if (level === 3) {
    return {
      level,
      badge: warningPalette(level),
      title: "远离安全锚点",
      description: "当前位置距离安全锚点过远，建议打开安全抽屉选择保守动作。",
      suggestion: "优先沿已走轨迹返回或回最近安全锚点。",
    };
  }
  if (level === 2) {
    return {
      level,
      badge: warningPalette(level),
      title: "接近探索范围边界",
      description: "当前位置接近边界线，建议控制继续外扩距离。",
      suggestion: "保持在范围内活动，必要时回到起点侧。",
    };
  }
  return {
    level,
    badge: warningPalette(level),
    title: "处于探索范围内",
    description: "当前位置仍处于确认范围内，可继续进行轻量探索。",
    suggestion: "持续关注安全锚点与返程路径。",
  };
}

function keypointTrackIndex(bundle: T03Bundle, kind: string, fallback: number) {
  return bundle.routeKeypoints.find((point) => point.kind === kind)?.track_index ?? fallback;
}

function referencePoints(points: RouteScenario | ExploreScenario, mode: OffroadMode) {
  if (mode === "explore") {
    const explore = points as ExploreScenario;
    return addCurrentPoint(
      [explore.startPoint, ...explore.safetyAnchors, explore.anchorCandidate],
      {
        id: "explore-current",
        name: "当前位置",
        kind: "current",
        lng: explore.startPoint.lng + 0.006,
        lat: explore.startPoint.lat + 0.004,
      },
    );
  }

  const route = points as RouteScenario;
  return addCurrentPoint(
    [
      route.startPoint,
      route.endPoint,
      ...route.detourPoints,
      ...route.returnPoints,
      ...route.safetyPoints,
      ...route.anchorPoints,
    ],
    route.currentPoint,
  );
}

export function buildOffroadMapScenario(
  bundle: T03Bundle,
  scenario: RouteScenario | ExploreScenario,
  mode: OffroadMode,
  overrides?: OffroadOverrides,
): OffroadMapScenario {
  const metrics = trackPoints(bundle);
  const line = toTrackLine(metrics);
  const currentIndex = Math.min(metrics.length - 1, Math.max(20, Math.floor(metrics.length * 0.58)));
  const current = metrics[currentIndex];
  const previous = metrics[Math.max(0, currentIndex - 2)];
  const currentBearing = bearingBetween([previous.lng, previous.lat], [current.lng, current.lat]);

  if (mode === "explore") {
    const explore = scenario as ExploreScenario;
    const points = referencePoints(explore, mode);
    const startDistance = haversineKm([current.lng, current.lat], [explore.startPoint.lng, explore.startPoint.lat]);
    const anchorDistance = haversineKm(
      [current.lng, current.lat],
      [explore.safetyAnchors[0].lng, explore.safetyAnchors[0].lat],
    );
    const warning = overrides?.warning ?? buildExploreWarning(2);
    const highlightStart = keypointTrackIndex(bundle, "regroup", Math.floor(metrics.length * 0.45));
    const highlightLine = sliceLine(line, highlightStart - 18, highlightStart + 18);
    return {
      mode,
      modeLabel: "自由探索",
      referenceLabel: "现实自身轨迹 + 探索范围",
      currentPositionLabel: `当前位置 · ${formatClock(current.timestamp)}`,
      statusBar: buildStatusBar(mode),
      referenceLine: [],
      actualTrackLine: sliceLine(line, 0, currentIndex),
      highlightLine,
      headingDegrees: currentBearing,
      points,
      polygon: explore.polygon,
      bottomMetrics: [
        { label: "距离起点", value: kilometers(startDistance) },
        { label: "最近安全锚点", value: kilometers(anchorDistance) },
      ],
      bottomHint: warning.level >= 3 ? "建议回撤" : warning.level === 2 ? "接近边界" : "处于探索范围内",
      warning,
      safetyDrawer: {
        currentStatusLabel: warning.title,
        currentStatusSummary: warning.description,
        conservativeActions: [
          { id: "trace-back", label: "沿已走轨迹返回", detail: "保留当前自身轨迹作为最保守回撤路径。" },
          { id: "back-to-start", label: "回起点", detail: "返回确认起点，重新建立探索节奏。" },
          { id: "back-to-anchor", label: "回最近安全锚点", detail: "优先回到安全锚点候选附近。" },
        ],
        externalActions: [
          { id: "mark-risk", label: "风险标记入口", detail: "原型入口，用于标注当前风险事件。" },
          { id: "share-position", label: "发送当前位置（占位）", detail: "保留对外同步位置的入口。" },
          { id: "satellite", label: "卫星通讯入口（占位）", detail: "与顶部状态栏联动，当前不接真实链路。" },
        ],
      },
      sourceNote: "探索范围、风险分级和保守动作均为 derived/mock 原型推演。",
    };
  }

  const route = scenario as RouteScenario;
  const points = referencePoints(route, mode);
  const nextKeypoint = route.anchorPoints[0] ?? route.endPoint;
  const distanceToNext = haversineKm([current.lng, current.lat], [nextKeypoint.lng, nextKeypoint.lat]);
  const distanceToEnd = haversineKm([current.lng, current.lat], [route.endPoint.lng, route.endPoint.lat]);
  const warning = overrides?.warning ?? buildRouteWarning(mode);
  const highlightStart = keypointTrackIndex(bundle, "regroup", Math.floor(metrics.length * 0.48));
  const highlightLine = sliceLine(line, highlightStart - 24, highlightStart + 24);
  return {
    mode,
    modeLabel: mode === "platform" ? "平台路线" : "导入轨迹 / 自定义参考路线",
    referenceLabel: mode === "platform" ? "标准参考路线进行" : "导入轨迹参考进行",
    currentPositionLabel: `当前位置 · ${formatClock(current.timestamp)}`,
    statusBar: buildStatusBar(mode),
    referenceLine: route.routeLine,
    actualTrackLine: sliceLine(line, 0, currentIndex),
    highlightLine,
    headingDegrees: currentBearing,
    points,
    bottomMetrics: [
      { label: "距离下一关键点", value: kilometers(distanceToNext) },
      { label: "距离终点", value: kilometers(distanceToEnd) },
    ],
    bottomHint: warning.level >= 2 ? warning.suggestion : "沿参考路线继续前行",
    warning,
    safetyDrawer: {
      currentStatusLabel: warning.title,
      currentStatusSummary: warning.description,
      conservativeActions: [
        { id: "trace-return", label: "寻迹返航", detail: "沿当前实际轨迹回退到稳定位置。" },
        { id: "to-connector", label: "回接驳点", detail: "优先返回接驳点 / regroup 点重新整队。" },
        {
          id: "to-retreat",
          label: mode === "platform" ? "回终点 / 回撤点" : "回回撤点",
          detail: mode === "platform" ? "优先选择终点或回撤点完成保守收口。" : "优先回到回撤点保持导入轨迹参考关系。",
        },
      ],
      externalActions: [
        { id: "mark-risk", label: "风险标记入口", detail: "原型入口，用于标注风险路段或停滞点。" },
        { id: "share-position", label: "发送当前位置（占位）", detail: "保留位置共享入口，不接真实通讯。" },
        { id: "satellite", label: "卫星通讯入口（占位）", detail: "与顶部状态联动，仅作高可信原型表达。" },
      ],
    },
    sourceNote: "已走轨迹、风险等级和保守动作均为基于 1989358 的 derived/mock 原型表达。",
  };
}

function summarizeRoutePersona(bundle: T03Bundle, mode: OffroadMode) {
  const tags = [...bundle.sample.terrainTags.slice(0, 3)];
  if (mode === "explore") {
    return {
      tags: [...tags, "探索收口"],
      summary: "围绕样例轨迹包络展开自由探索，节奏以边界试探和安全锚点回撤为主。",
      challengeBadge: "挑战指数 B / derived",
    };
  }
  if (mode === "imported") {
    return {
      tags: [...tags, "自定义参考路线"],
      summary: "导入轨迹更强调参考线对照与自定义路径理解，适合复盘导入质量和回撤效率。",
      challengeBadge: "挑战指数 B+ / derived",
    };
  }
  return {
    tags: [...tags, "平台标准 Route"],
    summary: "这是一条短线试车型平台 Route，强项在于关键点清晰、节奏短、适合轻量验证与复盘。",
    challengeBadge: "挑战指数 B / derived",
  };
}

function buildSegments(bundle: T03Bundle, line: [number, number][]) {
  const hardestIndex = keypointTrackIndex(bundle, "risk", 50);
  const scenicIndex = keypointTrackIndex(bundle, "regroup", Math.floor(line.length * 0.5));
  const cautionIndex = keypointTrackIndex(bundle, "retreat", Math.floor(line.length * 0.8));
  return [
    {
      id: "hardest",
      title: "最难一段",
      tag: "derived/mock",
      description: "姿态和坡度波动最明显的一段，适合回看挑战强度。",
      evidence: "基于坡度变化与低速通过片段提炼。",
      caution: "建议复盘这一段的入弯与会车策略。",
      sourceNote: "derived from sample track properties",
      startIndex: Math.max(0, hardestIndex - 18),
      endIndex: Math.min(line.length - 1, hardestIndex + 18),
      line: sliceLine(line, hardestIndex - 18, hardestIndex + 18),
    },
    {
      id: "scenic",
      title: "最精彩一段",
      tag: "derived/mock",
      description: "节奏最连贯、视野最开阔的一段，适合作为分享主片段。",
      evidence: "基于中段参考点与速度节奏稳定区段提炼。",
      caution: "可作为 Route 亮点回看，但不代表平台官方推荐结论。",
      sourceNote: "derived from midpoint and track cadence",
      startIndex: Math.max(0, scenicIndex - 22),
      endIndex: Math.min(line.length - 1, scenicIndex + 22),
      line: sliceLine(line, scenicIndex - 22, scenicIndex + 22),
    },
    {
      id: "caution",
      title: "最需要谨慎的一段",
      tag: "原型锚点 + derived",
      description: "围绕回撤参考点形成的谨慎区段，适合作为回撤与保守动作复盘入口。",
      evidence: "结合回撤原型锚点与低速区段提炼。",
      caution: "此处原型锚点并非事实源原生字段，已显式标注。",
      sourceNote: "prototype anchor + derived",
      startIndex: Math.max(0, cautionIndex - 16),
      endIndex: Math.min(line.length - 1, cautionIndex + 16),
      line: sliceLine(line, cautionIndex - 16, cautionIndex + 16),
    },
  ] satisfies SummarySegment[];
}

export function buildTripSummaryScenario(
  bundle: T03Bundle,
  mode: OffroadMode,
  overrides?: SummaryOverrides,
): TripSummaryScenario {
  const metrics = trackPoints(bundle);
  const line = toTrackLine(metrics);
  const routeScenario = mode === "explore" ? null : null;
  void routeScenario;
  const persona = summarizeRoutePersona(bundle, mode);
  const segments = buildSegments(bundle, line);
  const highestSlope = metrics.reduce((max, point) => (Math.abs(point.slope) > Math.abs(max.slope) ? point : max), metrics[0]);
  const highestElevation = metrics.reduce((max, point) => (point.elevation > max.elevation ? point : max), metrics[0]);
  const slowest = metrics.reduce((min, point) => (point.speed < min.speed ? point : min), metrics[0]);
  const riskPoint = bundle.routeKeypoints.find((point) => point.kind === "risk");
  const retreatPoint = bundle.routeKeypoints.find((point) => point.kind === "retreat");
  const startTimestamp = metrics[0]?.timestamp ?? "2018-10-26T09:18:57Z";
  const endTimestamp = metrics[metrics.length - 1]?.timestamp ?? "2018-10-26T09:48:30Z";
  const completionStatus =
    overrides?.completionStatus ?? (mode === "explore" ? "回撤完成" : "完成");
  const retreatStatus =
    overrides?.retreatStatus ?? (mode === "explore" ? "沿安全锚点回撤完成" : "经过回撤参考点，无需中止");
  const modeLabel =
    mode === "platform" ? "平台路线" : mode === "imported" ? "导入轨迹 / 自定义参考路线" : "自由探索";
  const feedbackTitle =
    mode === "platform"
      ? "Route 反馈与一致性"
      : mode === "imported"
        ? "自定义路线保存与候选提交"
        : "探索沉淀与候选提炼";
  const feedbackSummary =
    mode === "platform"
      ? "本次实际轨迹与平台参考线高度贴合，可回写平台 Route 的反馈意见。"
      : mode === "imported"
        ? "导入轨迹已完成原型摘要，可决定是否保存为自定义路线并申请候选 Route。"
        : "自由探索轨迹可沉淀为私有探索记录，也可提炼为候选 Route。";
  const feedbackActions =
    mode === "platform"
      ? [
          { label: "与平台 Route 一致 96%（derived）", detail: "基于参考线与实际轨迹贴合度的原型推演。" },
          { label: "提交路线反馈", detail: "反馈入口保留，后续可接正式评价链路。" },
        ]
      : mode === "imported"
        ? [
            { label: "保存为自定义路线", detail: "保留导入轨迹的前台语义。" },
            { label: "提交为候选 Route", detail: "作为平台候选路线的原型入口。" },
          ]
        : [
            { label: "保存为私有探索", detail: "保留探索记录供车主本人回看。" },
            { label: "提炼为候选 Route", detail: "基于探索证据形成候选 Route 原型入口。" },
          ];
  const points: MapPoint[] = [
    {
      id: "summary-start",
      name: bundle.routeKeypoints[0]?.name ?? "起点",
      kind: "start",
      lng: bundle.routeKeypoints[0]?.lng ?? line[0][0],
      lat: bundle.routeKeypoints[0]?.lat ?? line[0][1],
    },
    {
      id: "summary-end",
      name: bundle.routeKeypoints[bundle.routeKeypoints.length - 1]?.name ?? "终点",
      kind: "end",
      lng: bundle.routeKeypoints[bundle.routeKeypoints.length - 1]?.lng ?? line[line.length - 1][0],
      lat: bundle.routeKeypoints[bundle.routeKeypoints.length - 1]?.lat ?? line[line.length - 1][1],
    },
    riskPoint
      ? {
          id: riskPoint.keypoint_id,
          name: riskPoint.name,
          kind: "safety",
          lng: riskPoint.lng,
          lat: riskPoint.lat,
        }
      : {
          id: "summary-risk",
          name: "风险区段",
          kind: "safety",
          lng: line[Math.floor(line.length * 0.2)][0],
          lat: line[Math.floor(line.length * 0.2)][1],
        },
    retreatPoint
      ? {
          id: retreatPoint.keypoint_id,
          name: retreatPoint.name,
          kind: "return",
          lng: retreatPoint.lng,
          lat: retreatPoint.lat,
        }
      : {
          id: "summary-retreat",
          name: "回撤点",
          kind: "return",
          lng: line[Math.floor(line.length * 0.8)][0],
          lat: line[Math.floor(line.length * 0.8)][1],
        },
  ];
  const highlightSegmentId = overrides?.highlightSegmentId ?? segments[0].id;
  return {
    mode,
    modeLabel,
    routeName: bundle.sample.routeName,
    completionStatus,
    totalDistance: kilometers(bundle.sample.distanceKm),
    totalDuration: `${Math.round(bundle.sample.durationSeconds / 60)} 分`,
    startTimeLabel: formatClock(startTimestamp),
    endTimeLabel: formatClock(endTimestamp),
    retreatStatus,
    overviewNote:
      overrides?.overviewNote ??
      (mode === "explore" ? "本次以探索边界验证和安全锚点回撤为主。" : "本次完成了从详情、地图到总结的最小闭环。"),
    personaTags: persona.tags,
    personaSummary: persona.summary,
    challengeBadge: persona.challengeBadge,
    segments,
    findings: [
      {
        label: "最大爬升 / 下坡",
        value: `${meters(highestElevation.elevation)} / ${highestSlope.slope.toFixed(1)}°`,
        detail: "以轨迹属性中的 elevation 和 slope_or_pitch 派生，属于 derived/mock 结论表达。",
        sourceNote: "derived/mock",
      },
      {
        label: "姿态最紧张时刻",
        value: `${formatClock(highestSlope.timestamp)} · ${highestSlope.slope.toFixed(1)}°`,
        detail: "用于表达姿态风险时刻，不展示原始连续仪表盘。",
        sourceNote: "derived/mock",
      },
      {
        label: "长时间低速通过区段",
        value: `${formatClock(slowest.timestamp)} · ${slowest.speed.toFixed(1)} km/h`,
        detail: "映射到最难一段或谨慎区段，用于复盘通过策略。",
        sourceNote: "derived/mock",
      },
      {
        label: "打滑 / 风险区段",
        value: riskPoint ? `${riskPoint.name}` : "风险区段候选",
        detail: "当前只做原型推演，显式标注为原型锚点或 derived 结论。",
        sourceNote: "prototype anchor + derived",
      },
    ],
    feedbackTitle,
    feedbackSummary,
    feedbackActions,
    shareActions: [
      { label: "生成分享卡", detail: "生成静态分享资产的原型入口。" },
      { label: "生成视频（占位）", detail: "保留视频能力入口，不接 T03 媒体链路。" },
      { label: "生成 3D 回放（占位）", detail: "保留三维回放入口，不做真实飞行特效。" },
    ],
    actualTrackLine: line,
    points,
    highlightSegmentId,
    timeline: [
      { id: "start", label: "起步", index: 0, timeLabel: formatClock(startTimestamp) },
      { id: "hardest", label: "最难一段", index: segments[0].startIndex, timeLabel: formatClock(metrics[segments[0].startIndex].timestamp) },
      { id: "scenic", label: "精彩段", index: segments[1].startIndex, timeLabel: formatClock(metrics[segments[1].startIndex].timestamp) },
      { id: "caution", label: "谨慎段", index: segments[2].startIndex, timeLabel: formatClock(metrics[segments[2].startIndex].timestamp) },
      { id: "finish", label: "结束", index: metrics.length - 1, timeLabel: formatClock(endTimestamp) },
    ],
    sensorStrips: [
      {
        label: "速度",
        value: `${Math.max(...metrics.map((point) => point.speed)).toFixed(1)} km/h`,
        detail: "用于表达节奏与通过强度，不展示完整原始曲线。",
        sourceNote: "derived/mock",
      },
      {
        label: "海拔 / 坡度",
        value: `${meters(highestElevation.elevation)} / ${highestSlope.slope.toFixed(1)}°`,
        detail: "用最有解释力的极值刻画路段挑战，不堆叠原始数值。",
        sourceNote: "derived/mock",
      },
      {
        label: "姿态风险",
        value: `${Math.abs(highestSlope.slope).toFixed(1)}°`,
        detail: "用单条风险摘要承接姿态、打滑和谨慎段表达。",
        sourceNote: "derived/mock",
      },
    ],
    sourceNote: "关键路段、路线画像和传感器摘要均为基于 1989358 轨迹属性的 derived/mock 原型推演。",
    footerActions:
      mode === "platform"
        ? ["保存总结", "生成分享内容", "提交路线反馈"]
        : mode === "imported"
          ? ["保存总结", "生成分享内容", "保存为候选路线"]
          : ["保存总结", "生成分享内容", "提炼为候选路线"],
  };
}

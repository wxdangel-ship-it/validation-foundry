import type { MapPoint } from "../components/map-stage";
import {
  buildExploreScenario,
  buildOffroadMapScenario,
  buildRouteScenario,
  buildSafetyDrawerScenario,
  buildSummaryScenario,
  type ExploreScenario,
  type RouteScenario,
  type T03Bundle,
} from "../mocks/sample-data";
import type {
  PrototypeContext,
  PrototypeSnapshot,
  PrototypeMode,
  SummaryStatus,
  WarningLevel,
} from "../state/prototype-machine";

const defaultContext: PrototypeContext = {
  mode: "platform",
  startPointName: "新闯路起点",
  routeStartConfirmed: true,
  safetyAnchorCount: 0,
  rangeConfirmed: false,
  rangeLimitExceeded: false,
  highlightedPointId: null,
  warningLevel: 1,
  summaryStatus: "completed",
  gpsStatus: "good",
  recordingStatus: "recording",
  satelliteStatus: "ready",
};

export function createSnapshot(overrides: Partial<PrototypeContext>): PrototypeSnapshot {
  return {
    context: {
      ...defaultContext,
      ...overrides,
    },
  } as PrototypeSnapshot;
}

export function buildRoutePoints(
  scenario: RouteScenario,
  startPointName: string,
  highlightedPointId: string | null = null,
) {
  const startPoint =
    startPointName === scenario.alternateStartPoint.name ? scenario.alternateStartPoint : scenario.startPoint;
  const points = [
    startPoint,
    scenario.endPoint,
    ...scenario.detourPoints,
    ...scenario.returnPoints,
    ...scenario.safetyPoints,
    ...scenario.anchorPoints,
    scenario.currentPoint,
  ];
  return decoratePoints(points, highlightedPointId);
}

export function buildExplorePoints(
  scenario: ExploreScenario,
  startPointName: string,
  startConfirmed: boolean,
  safetyAnchorCount: number,
) {
  const startPoint =
    startConfirmed && startPointName === scenario.alternateStartPoint.name
      ? scenario.alternateStartPoint
      : scenario.startPoint;
  const points: MapPoint[] = [startPoint];
  if (safetyAnchorCount > 0) {
    points.push(...scenario.safetyAnchors.slice(0, 1));
  }
  if (safetyAnchorCount > 1) {
    points.push(scenario.anchorCandidate);
  }
  points.push(...scenario.manualMarks);
  points.push({
    id: "explore-current",
    name: "当前位置",
    kind: "current",
    lng: startPoint.lng + 0.006,
    lat: startPoint.lat + 0.004,
  });
  return points;
}

function decoratePoints(points: MapPoint[], highlightedPointId: string | null) {
  return points.map((point) => ({
    ...point,
    highlighted: point.id === highlightedPointId,
  }));
}

export function createRouteStoryFixture(
  bundle: T03Bundle,
  mode: "platform" | "imported",
  overrides?: Partial<PrototypeContext>,
) {
  const scenario = buildRouteScenario(bundle, mode);
  const snapshot = createSnapshot({
    mode,
    startPointName: scenario.startPoint.name,
    routeStartConfirmed: true,
    satelliteStatus: mode === "platform" ? "ready" : "standby",
    ...overrides,
  });
  const points = buildRoutePoints(scenario, snapshot.context.startPointName, snapshot.context.highlightedPointId);
  return { scenario, snapshot, points };
}

export function createExploreStoryFixture(bundle: T03Bundle, overrides?: Partial<PrototypeContext>) {
  const scenario = buildExploreScenario(bundle);
  const snapshot = createSnapshot({
    mode: "explore",
    startPointName: "未确认起点",
    routeStartConfirmed: false,
    safetyAnchorCount: 0,
    rangeConfirmed: false,
    rangeLimitExceeded: false,
    summaryStatus: "retreated",
    satelliteStatus: "standby",
    ...overrides,
  });
  const points = buildExplorePoints(
    scenario,
    snapshot.context.startPointName,
    snapshot.context.routeStartConfirmed,
    snapshot.context.safetyAnchorCount,
  );
  return { scenario, snapshot, points };
}

export function createOffroadStoryFixture(
  bundle: T03Bundle,
  mode: PrototypeMode,
  options?: {
    warningLevel?: WarningLevel;
    offlineState?: "not_downloaded" | "downloading" | "downloaded";
    gpsStatus?: PrototypeContext["gpsStatus"];
    recordingStatus?: PrototypeContext["recordingStatus"];
    satelliteStatus?: PrototypeContext["satelliteStatus"];
  },
) {
  const scenario = buildOffroadMapScenario(bundle, mode, {
    warningLevel: options?.warningLevel,
    offlineState: options?.offlineState,
    gpsStatus: options?.gpsStatus,
    recordingStatus: options?.recordingStatus,
    satelliteStatus: options?.satelliteStatus,
  });
  const safetyDrawer = buildSafetyDrawerScenario(mode, options?.warningLevel ?? scenario.warning.level);
  return { scenario, safetyDrawer };
}

export function createSummaryStoryFixture(
  bundle: T03Bundle,
  mode: PrototypeMode,
  status: SummaryStatus = "completed",
) {
  return {
    scenario: buildSummaryScenario(bundle, mode, status),
  };
}

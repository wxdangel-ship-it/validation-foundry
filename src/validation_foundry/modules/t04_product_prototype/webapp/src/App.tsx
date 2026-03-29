import { useEffect, useMemo, useRef, useState } from "react";
import { useMachine } from "@xstate/react";
import { PrototypeViewport } from "./components/prototype-frame";
import { DemoLauncherPage } from "./pages/demo_launcher/demo-launcher-page";
import { RouteDetailPage } from "./pages/route_detail/route-detail-page";
import { FreeExplorePlanPage } from "./pages/free_explore_plan/free-explore-plan-page";
import { OffroadMapPage } from "./pages/offroad_map/offroad-map-page";
import { TripSummaryPage } from "./pages/trip_summary/trip-summary-page";
import {
  buildOffroadMapScenario,
  buildExploreScenario,
  buildRouteScenario,
  buildSafetyDrawerScenario,
  buildSummaryScenario,
  loadDemoBundle,
  type ExploreScenario,
  type RouteScenario,
  type T03Bundle,
} from "./mocks/sample-data";
import { enableMocking } from "./mocks/browser";
import {
  requestDownloadDelete,
  requestDownloadStart,
  requestExploreSave,
  requestImportParse,
} from "./mocks/prototype-api";
import {
  getActivePage,
  getDownloadState,
  getMapView,
  getSummaryStatus,
  getWarningLevel,
  isExploreReady,
  isOverlayOpen,
  prototypeMachine,
  type PrototypeMode,
} from "./state/prototype-machine";
import type { MapPoint } from "./components/map-stage";

export default function App({
  initialEntry = "launcher",
  preloadedBundle,
}: {
  initialEntry?: "launcher" | PrototypeMode;
  preloadedBundle?: T03Bundle;
}) {
  const [snapshot, send] = useMachine(prototypeMachine);
  const [bundle, setBundle] = useState<T03Bundle | null>(null);
  const initializedRef = useRef(false);
  const page = getActivePage(snapshot);
  const downloadState = getDownloadState(snapshot);
  const mapView = getMapView(snapshot);
  const overlayOpen = isOverlayOpen(snapshot);
  const warningLevel = getWarningLevel(snapshot);
  const summaryStatus = getSummaryStatus(snapshot);

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      await enableMocking();
      const nextBundle = preloadedBundle ?? (await loadDemoBundle());
      if (active) {
        setBundle(nextBundle);
      }
    }
    void bootstrap();
    return () => {
      active = false;
    };
  }, [preloadedBundle]);

  useEffect(() => {
    if (!bundle || initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    if (initialEntry === "platform") {
      send({ type: "OPEN_PLATFORM" });
    } else if (initialEntry === "imported") {
      void openImported();
    } else if (initialEntry === "explore") {
      send({ type: "OPEN_EXPLORE" });
    }
  }, [bundle, initialEntry, send]);

  const scenarios = useMemo(() => {
    if (!bundle) {
      return null;
    }
    return {
      platform: buildRouteScenario(bundle, "platform"),
      imported: buildRouteScenario(bundle, "imported"),
      explore: buildExploreScenario(bundle),
    };
  }, [bundle]);

  async function openImported() {
    await requestImportParse();
    send({ type: "OPEN_IMPORTED" });
  }

  async function handleDownload() {
    if (downloadState !== "not_downloaded") {
      return;
    }
    await requestDownloadStart();
    send({ type: "START_DOWNLOAD" });
  }

  async function handleDeleteDownload() {
    if (downloadState === "not_downloaded") {
      return;
    }
    await requestDownloadDelete();
    send({ type: "REMOVE_OFFLINE" });
  }

  async function handleExploreMutation(event: "SET_START" | "ADD_ANCHOR" | "CONFIRM_RANGE") {
    await requestExploreSave();
    if (!scenarios) {
      return;
    }
    if (event === "SET_START") {
      send({ type: "SET_EXPLORE_START_POINT", name: scenarios.explore.alternateStartPoint.name });
    } else if (event === "ADD_ANCHOR") {
      send({ type: "ADD_SAFETY_ANCHOR" });
    } else {
      send({ type: "CONFIRM_RANGE" });
    }
  }

  if (!scenarios || !bundle) {
    return (
      <PrototypeViewport className="items-center justify-center">
        <div className="rounded-[28px] border border-white/10 bg-[#091319]/85 px-6 py-6 shadow-dune">
          正在装载六只脚样例与原型状态...
        </div>
      </PrototypeViewport>
    );
  }

  const activeRouteScenario = snapshot.context.mode === "imported" ? scenarios.imported : scenarios.platform;
  const displayedRoutePoints = buildDisplayedRoutePoints(activeRouteScenario, snapshot.context.startPointName, snapshot.context.highlightedPointId);
  const displayedExplore = buildDisplayedExploreState(scenarios.explore, snapshot.context.startPointName, snapshot.context.routeStartConfirmed, snapshot.context.safetyAnchorCount);
  const exploreReady = isExploreReady(snapshot);
  const activeMode = snapshot.context.mode;
  const offroadScenario = buildOffroadMapScenario(bundle, activeMode, {
    warningLevel,
    offlineState: downloadState,
    gpsStatus: snapshot.context.gpsStatus,
    recordingStatus: snapshot.context.recordingStatus,
    satelliteStatus: snapshot.context.satelliteStatus,
  });
  const safetyDrawerScenario = buildSafetyDrawerScenario(activeMode, warningLevel);
  const summaryScenario = buildSummaryScenario(bundle, activeMode, summaryStatus);

  if (page === "launcher") {
    return (
      <DemoLauncherPage
        onOpenPlatform={() => send({ type: "OPEN_PLATFORM" })}
        onOpenImported={() => {
          void openImported();
        }}
        onOpenExplore={() => send({ type: "OPEN_EXPLORE" })}
      />
    );
  }

  if (page === "route_detail") {
    return (
      <RouteDetailPage
        scenario={activeRouteScenario}
        snapshot={snapshot}
        downloadState={downloadState}
        mapView={mapView}
        onToggleMapView={() => send({ type: "TOGGLE_MAP_VIEW" })}
        onDownload={() => {
          void handleDownload();
        }}
        onDeleteDownload={() => {
          void handleDeleteDownload();
        }}
        onGoMap={() => send({ type: "GO_OFFROAD_MAP" })}
        onBack={() => send({ type: "GO_LAUNCHER" })}
        onEnterExplore={() => send({ type: "ENTER_FREE_EXPLORE" })}
        onSetStartPoint={() =>
          send({
            type: "SET_ROUTE_START_POINT",
            name: activeRouteScenario.alternateStartPoint.name,
          })
        }
        onHighlightPoint={(pointId) => send({ type: "HIGHLIGHT_POINT", pointId })}
        points={displayedRoutePoints}
      />
    );
  }

  if (page === "explore_plan") {
    return (
      <FreeExplorePlanPage
        scenario={scenarios.explore}
        snapshot={snapshot}
        downloadState={downloadState}
        mapView={mapView}
        isExploreReady={exploreReady}
        onToggleMapView={() => send({ type: "TOGGLE_MAP_VIEW" })}
        onDownload={() => {
          void handleDownload();
        }}
        onDeleteDownload={() => {
          void handleDeleteDownload();
        }}
        onGoMap={() => send({ type: "GO_OFFROAD_MAP" })}
        onBack={() => send({ type: "GO_LAUNCHER" })}
        onSetStartPoint={() => {
          void handleExploreMutation("SET_START");
        }}
        onAddSafetyAnchor={() => {
          void handleExploreMutation("ADD_ANCHOR");
        }}
        onConfirmRange={() => {
          void handleExploreMutation("CONFIRM_RANGE");
        }}
        points={displayedExplore.points}
      />
    );
  }

  if (page === "offroad_map") {
    return (
      <OffroadMapPage
        scenario={offroadScenario}
        safetyDrawer={safetyDrawerScenario}
        mapView={mapView}
        overlayOpen={overlayOpen}
        onToggleMapView={() => send({ type: "TOGGLE_MAP_VIEW" })}
        onOpenSafetyDrawer={() => send({ type: "OPEN_SAFETY_DRAWER" })}
        onCloseSafetyDrawer={() => send({ type: "CLOSE_SAFETY_DRAWER" })}
        onEndTrip={() => send({ type: "GO_TRIP_SUMMARY" })}
        onBack={() => send({ type: "BACK_TO_ROUTE_DETAIL" })}
      />
    );
  }

  return (
    <TripSummaryPage
      scenario={summaryScenario}
      onBackToMap={() => send({ type: "GO_OFFROAD_MAP" })}
    />
  );
}

function buildDisplayedRoutePoints(
  scenario: RouteScenario,
  startPointName: string,
  highlightedPointId: string | null,
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

function buildDisplayedExploreState(
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
  points.push({
    id: "explore-current",
    name: "当前位置",
    kind: "current",
    lng: startPoint.lng + 0.006,
    lat: startPoint.lat + 0.004,
  });
  return {
    points,
  };
}

function decoratePoints(points: MapPoint[], highlightedPointId: string | null) {
  return points.map((point) => ({
    ...point,
    highlighted: point.id === highlightedPointId,
  }));
}

import type { Meta, StoryObj } from "@storybook/react-vite";
import { FreeExplorePlanPage } from "../pages/free_explore_plan/free-explore-plan-page";
import { OffroadMapPage } from "../pages/offroad_map/offroad-map-page";
import { RouteDetailPage } from "../pages/route_detail/route-detail-page";
import { TripSummaryPage } from "../pages/trip_summary/trip-summary-page";
import { loadDemoBundle } from "../mocks/sample-data";
import {
  createExploreStoryFixture,
  createOffroadStoryFixture,
  createRouteStoryFixture,
  createSummaryStoryFixture,
} from "./story-fixtures";

const meta = {
  title: "T04/States",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "状态级 stories。用于验证下载状态、地图普通态/3D 态、四级警示、安全抽屉开合，以及 P3 Ready Gate 和 P5 完成状态。",
      },
    },
  },
  loaders: [
    async () => ({
      bundle: await loadDemoBundle(),
    }),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function renderRouteDownloadState(
  bundle: Awaited<ReturnType<typeof loadDemoBundle>>,
  downloadState: "not_downloaded" | "downloading" | "downloaded",
) {
  const { scenario, snapshot, points } = createRouteStoryFixture(bundle, "platform");
  return (
    <RouteDetailPage
      scenario={scenario}
      snapshot={snapshot}
      downloadState={downloadState}
      mapView="map_2d"
      onToggleMapView={() => undefined}
      onDownload={() => undefined}
      onDeleteDownload={() => undefined}
      onGoMap={() => undefined}
      onBack={() => undefined}
      onEnterExplore={() => undefined}
      onSetStartPoint={() => undefined}
      onHighlightPoint={() => undefined}
      points={points}
    />
  );
}

function renderMapState(
  bundle: Awaited<ReturnType<typeof loadDemoBundle>>,
  options: {
    mode: "platform" | "imported" | "explore";
    mapView: "map_2d" | "map_3d";
    warningLevel: 1 | 2 | 3 | 4;
    overlayOpen?: boolean;
  },
) {
  const { scenario, safetyDrawer } = createOffroadStoryFixture(bundle, options.mode, {
    warningLevel: options.warningLevel,
    offlineState: "downloaded",
    satelliteStatus: options.warningLevel === 4 ? "ready" : "standby",
  });
  return (
    <OffroadMapPage
      scenario={scenario}
      safetyDrawer={safetyDrawer}
      mapView={options.mapView}
      overlayOpen={options.overlayOpen ?? false}
      onToggleMapView={() => undefined}
      onOpenSafetyDrawer={() => undefined}
      onCloseSafetyDrawer={() => undefined}
      onEndTrip={() => undefined}
      onBack={() => undefined}
    />
  );
}

export const DownloadNotDownloaded: Story = {
  name: "下载状态.未下载",
  render: (_, { loaded }) => renderRouteDownloadState(loaded.bundle, "not_downloaded"),
};

export const DownloadDownloading: Story = {
  name: "下载状态.下载中",
  render: (_, { loaded }) => renderRouteDownloadState(loaded.bundle, "downloading"),
};

export const DownloadDownloaded: Story = {
  name: "下载状态.下载完成",
  render: (_, { loaded }) => renderRouteDownloadState(loaded.bundle, "downloaded"),
};

export const MapState2D: Story = {
  name: "地图状态.普通态",
  render: (_, { loaded }) => renderMapState(loaded.bundle, { mode: "platform", mapView: "map_2d", warningLevel: 1 }),
};

export const MapState3D: Story = {
  name: "地图状态.3D态",
  render: (_, { loaded }) => renderMapState(loaded.bundle, { mode: "platform", mapView: "map_3d", warningLevel: 1 }),
};

export const WarningLevel1: Story = {
  name: "警示状态.Level1",
  render: (_, { loaded }) => renderMapState(loaded.bundle, { mode: "platform", mapView: "map_2d", warningLevel: 1 }),
};

export const WarningLevel2: Story = {
  name: "警示状态.Level2",
  render: (_, { loaded }) => renderMapState(loaded.bundle, { mode: "platform", mapView: "map_2d", warningLevel: 2 }),
};

export const WarningLevel3: Story = {
  name: "警示状态.Level3",
  render: (_, { loaded }) => renderMapState(loaded.bundle, { mode: "imported", mapView: "map_2d", warningLevel: 3 }),
};

export const WarningLevel4: Story = {
  name: "警示状态.Level4",
  render: (_, { loaded }) => renderMapState(loaded.bundle, { mode: "explore", mapView: "map_2d", warningLevel: 4 }),
};

export const SafetyDrawerClosed: Story = {
  name: "安全抽屉.关闭",
  render: (_, { loaded }) => renderMapState(loaded.bundle, { mode: "explore", mapView: "map_2d", warningLevel: 2 }),
};

export const SafetyDrawerOpen: Story = {
  name: "安全抽屉.打开",
  render: (_, { loaded }) => renderMapState(loaded.bundle, {
    mode: "explore",
    mapView: "map_2d",
    warningLevel: 4,
    overlayOpen: true,
  }),
};

export const SummaryCompleted: Story = {
  name: "总结页.完成",
  render: (_, { loaded }) => {
    const { scenario } = createSummaryStoryFixture(loaded.bundle, "platform", "completed");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  },
};

export const SummaryAborted: Story = {
  name: "总结页.中止",
  render: (_, { loaded }) => {
    const { scenario } = createSummaryStoryFixture(loaded.bundle, "imported", "aborted");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  },
};

export const SummaryRetreated: Story = {
  name: "总结页.回撤完成",
  render: (_, { loaded }) => {
    const { scenario } = createSummaryStoryFixture(loaded.bundle, "explore", "retreated");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  },
};

export const ExploreReadyGateBlocked: Story = {
  name: "P3 ReadyGate.Blocked",
  render: (_, { loaded }) => {
    const { scenario, snapshot, points } = createExploreStoryFixture(loaded.bundle);
    return (
      <FreeExplorePlanPage
        scenario={scenario}
        snapshot={snapshot}
        downloadState="not_downloaded"
        mapView="map_2d"
        isExploreReady={false}
        onToggleMapView={() => undefined}
        onDownload={() => undefined}
        onDeleteDownload={() => undefined}
        onGoMap={() => undefined}
        onBack={() => undefined}
        onSetStartPoint={() => undefined}
        onAddSafetyAnchor={() => undefined}
        onConfirmRange={() => undefined}
        points={points}
      />
    );
  },
};

export const ExploreReadyGateReady: Story = {
  name: "P3 ReadyGate.Ready",
  render: (_, { loaded }) => {
    const { scenario, snapshot, points } = createExploreStoryFixture(loaded.bundle, {
      startPointName: "新闯路备用集合点",
      routeStartConfirmed: true,
      safetyAnchorCount: 1,
      rangeConfirmed: true,
    });
    return (
      <FreeExplorePlanPage
        scenario={scenario}
        snapshot={snapshot}
        downloadState="downloaded"
        mapView="map_2d"
        isExploreReady
        onToggleMapView={() => undefined}
        onDownload={() => undefined}
        onDeleteDownload={() => undefined}
        onGoMap={() => undefined}
        onBack={() => undefined}
        onSetStartPoint={() => undefined}
        onAddSafetyAnchor={() => undefined}
        onConfirmRange={() => undefined}
        points={points}
      />
    );
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import App from "../App";
import { OffroadMapPage } from "../pages/offroad_map/offroad-map-page";
import { TripSummaryPage } from "../pages/trip_summary/trip-summary-page";
import { loadDemoBundle } from "../mocks/sample-data";
import {
  createOffroadStoryFixture,
  createSummaryStoryFixture,
} from "./story-fixtures";

const meta = {
  title: "T04/Pages",
  component: App,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "页面级原型 stories。覆盖 P0 Demo Launcher、P2/P3 出发前页面、P4 三模式地图页、P4-overlay 安全抽屉，以及 P5 三模式总结页。",
      },
    },
  },
  loaders: [
    async () => ({
      bundle: await loadDemoBundle(),
    }),
  ],
} satisfies Meta<typeof App>;

export default meta;

type Story = StoryObj<typeof meta>;

function renderMapStory(
  bundle: Awaited<ReturnType<typeof loadDemoBundle>>,
  mode: "platform" | "imported" | "explore",
  warningLevel: 1 | 2 | 3 | 4,
  overlayOpen = false,
) {
  const { scenario, safetyDrawer } = createOffroadStoryFixture(bundle, mode, {
    warningLevel,
    offlineState: "downloaded",
    satelliteStatus: mode === "platform" ? "ready" : "standby",
  });
  return (
    <OffroadMapPage
      scenario={scenario}
      safetyDrawer={safetyDrawer}
      mapView="map_2d"
      overlayOpen={overlayOpen}
      onToggleMapView={() => undefined}
      onOpenSafetyDrawer={() => undefined}
      onCloseSafetyDrawer={() => undefined}
      onEndTrip={() => undefined}
      onBack={() => undefined}
    />
  );
}

export const P0DemoLauncher: Story = {
  name: "P0 Demo Launcher",
  render: (_, { loaded }) => <App initialEntry="launcher" preloadedBundle={loaded.bundle} />,
};

export const P2RouteDetailPlatformRoute: Story = {
  name: "P2 RouteDetail.PlatformRoute",
  render: (_, { loaded }) => <App initialEntry="platform" preloadedBundle={loaded.bundle} />,
};

export const P2RouteDetailImportedTrack: Story = {
  name: "P2 RouteDetail.ImportedTrack",
  render: (_, { loaded }) => <App initialEntry="imported" preloadedBundle={loaded.bundle} />,
};

export const P3FreeExplorePlan: Story = {
  name: "P3 FreeExplorePlan",
  render: (_, { loaded }) => <App initialEntry="explore" preloadedBundle={loaded.bundle} />,
};

export const P4OffroadMapPlatformRoute: Story = {
  name: "P4 OffroadMap.PlatformRoute",
  render: (_, { loaded }) => renderMapStory(loaded.bundle, "platform", 1),
};

export const P4OffroadMapImportedTrack: Story = {
  name: "P4 OffroadMap.ImportedTrack",
  render: (_, { loaded }) => renderMapStory(loaded.bundle, "imported", 2),
};

export const P4OffroadMapFreeExplore: Story = {
  name: "P4 OffroadMap.FreeExplore",
  render: (_, { loaded }) => renderMapStory(loaded.bundle, "explore", 2),
};

export const P4OverlaySafetyDrawerPlatformRoute: Story = {
  name: "P4-overlay SafetyDrawer.PlatformRoute",
  render: (_, { loaded }) => renderMapStory(loaded.bundle, "platform", 3, true),
};

export const P4OverlaySafetyDrawerFreeExplore: Story = {
  name: "P4-overlay SafetyDrawer.FreeExplore",
  render: (_, { loaded }) => renderMapStory(loaded.bundle, "explore", 4, true),
};

export const P5SummaryPlatformRoute: Story = {
  name: "P5 Summary.PlatformRoute",
  render: (_, { loaded }) => {
    const { scenario } = createSummaryStoryFixture(loaded.bundle, "platform", "completed");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  },
};

export const P5SummaryImportedTrack: Story = {
  name: "P5 Summary.ImportedTrack",
  render: (_, { loaded }) => {
    const { scenario } = createSummaryStoryFixture(loaded.bundle, "imported", "completed");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  },
};

export const P5SummaryFreeExplore: Story = {
  name: "P5 Summary.FreeExplore",
  render: (_, { loaded }) => {
    const { scenario } = createSummaryStoryFixture(loaded.bundle, "explore", "retreated");
    return <TripSummaryPage scenario={scenario} onBackToMap={() => undefined} />;
  },
};

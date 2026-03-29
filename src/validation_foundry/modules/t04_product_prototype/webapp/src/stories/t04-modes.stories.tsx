import type { Meta, StoryObj } from "@storybook/react-vite";
import { OffroadMapPage } from "../pages/offroad_map/offroad-map-page";
import { loadDemoBundle } from "../mocks/sample-data";
import { createOffroadStoryFixture } from "./story-fixtures";

const meta = {
  title: "T04/Modes",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "模式级 stories。用于横向比较平台 Route、导入轨迹和自由探索在 P4 地图主战场上的信息结构与状态差异。",
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

function renderModeStory(
  bundle: Awaited<ReturnType<typeof loadDemoBundle>>,
  mode: "platform" | "imported" | "explore",
  warningLevel: 1 | 2,
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
      overlayOpen={false}
      onToggleMapView={() => undefined}
      onOpenSafetyDrawer={() => undefined}
      onCloseSafetyDrawer={() => undefined}
      onEndTrip={() => undefined}
      onBack={() => undefined}
    />
  );
}

export const PlatformRouteMode: Story = {
  name: "Platform Route Mode",
  render: (_, { loaded }) => renderModeStory(loaded.bundle, "platform", 1),
};

export const ImportedTrackMode: Story = {
  name: "Imported Track Mode",
  render: (_, { loaded }) => renderModeStory(loaded.bundle, "imported", 2),
};

export const FreeExploreMode: Story = {
  name: "Free Explore Mode",
  render: (_, { loaded }) => renderModeStory(loaded.bundle, "explore", 2),
};

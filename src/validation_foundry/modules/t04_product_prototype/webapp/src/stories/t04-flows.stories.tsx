import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "@storybook/test";
import App from "../App";
import { loadDemoBundle, type T03Bundle } from "../mocks/sample-data";

type FlowEntry = "platform" | "imported" | "explore";
type AutoplayStatus = "idle" | "running" | "done" | "error";

const meta = {
  title: "T04/Flows",
  component: App,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "标准流程自动演示 stories。Flow A/B/C 都从 Demo Launcher 起跑，并自动推进到地图页、安全抽屉或总结页，用于验证原型流程是否持续可演示。",
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

function findEnabledButton(root: HTMLElement, label: string) {
  return [...root.querySelectorAll("button")].find(
    (node) => node.textContent?.includes(label) && !node.hasAttribute("disabled"),
  ) as HTMLButtonElement | undefined;
}

async function waitForEnabledButton(root: HTMLElement, label: string) {
  await waitFor(() => {
    expect(findEnabledButton(root, label)).toBeTruthy();
  }, { timeout: 45000 });
  return findEnabledButton(root, label);
}

async function clickButton(root: HTMLElement, label: string) {
  const button = await waitForEnabledButton(root, label);
  if (!button) {
    throw new Error(`button not found: ${label}`);
  }
  button.click();
}

async function waitForPage(root: HTMLElement, pageId: string) {
  await waitFor(() => {
    expect(root.querySelector(`[data-page-id="${pageId}"]`)).not.toBeNull();
  }, { timeout: 45000 });
}

async function waitForOverlay(root: HTMLElement, overlayId: string) {
  await waitFor(() => {
    expect(root.querySelector(`[data-overlay-id="${overlayId}"]`)).not.toBeNull();
  }, { timeout: 45000 });
}

async function runFlowAutoplay(entry: FlowEntry, root: HTMLElement) {
  await waitForPage(root, "launcher");

  if (entry === "platform") {
    await clickButton(root, "进入平台 Route 样例");
    await waitForPage(root, "route-detail");
    await clickButton(root, "一键下载");
    await clickButton(root, "导航至起点");
    await waitForPage(root, "offroad-map");
    await clickButton(root, "结束 Trip");
    await waitForPage(root, "trip-summary");
    return;
  }

  if (entry === "imported") {
    await clickButton(root, "进入导入轨迹样例");
    await waitForPage(root, "route-detail");
    await clickButton(root, "一键下载");
    await clickButton(root, "导航至起点");
    await waitForPage(root, "offroad-map");
    await clickButton(root, "结束 Trip");
    await waitForPage(root, "trip-summary");
    return;
  }

  await clickButton(root, "进入自由探索样例");
  await waitForPage(root, "free-explore-plan");
  await clickButton(root, "设起点");
  await clickButton(root, "边界工具");
  await clickButton(root, "添加锚点");
  await clickButton(root, "确认范围");
  await clickButton(root, "一键下载");
  await clickButton(root, "导航至起点");
  await waitForPage(root, "offroad-map");
  await clickButton(root, "安全入口");
  await waitForOverlay(root, "safety-drawer");
  await clickButton(root, "关闭抽屉");
  await clickButton(root, "结束 Trip");
  await waitForPage(root, "trip-summary");
}

function AutoplayStory({
  entry,
  bundle,
}: {
  entry: FlowEntry;
  bundle: T03Bundle;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  const [status, setStatus] = useState<AutoplayStatus>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    let cancelled = false;

    async function start() {
      setStatus("running");
      try {
        const root = hostRef.current;
        if (!root) {
          throw new Error("autoplay root missing");
        }
        await waitFor(() => {
          expect(root.querySelector('[data-prototype-viewport="tablet"]')).not.toBeNull();
        }, { timeout: 45000 });
        await runFlowAutoplay(entry, root);
        if (!cancelled) {
          setStatus("done");
        }
      } catch (nextError) {
        if (!cancelled) {
          const message = nextError instanceof Error ? nextError.message : String(nextError);
          setStatus("error");
          setError(message);
          console.error(`[t04-story-autoplay:${entry}]`, nextError);
        }
      }
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, [entry]);

  return (
    <div
      ref={hostRef}
      data-autoplay-entry={entry}
      data-autoplay-status={status}
      data-autoplay-error={error}
    >
      <App initialEntry="launcher" preloadedBundle={bundle} />
    </div>
  );
}

async function waitForStoryAutoplay({ canvasElement }: { canvasElement: HTMLElement }) {
  await waitFor(() => {
    const host = canvasElement.querySelector("[data-autoplay-entry]");
    const status = host?.getAttribute("data-autoplay-status");
    const error = host?.getAttribute("data-autoplay-error");
    expect(error).toBe("");
    expect(status).toBe("done");
  }, { timeout: 60000 });
}

export const FlowAPlatformRoute: Story = {
  name: "Flow A Platform Route",
  render: (_, { loaded }) => <AutoplayStory entry="platform" bundle={loaded.bundle} />,
  play: waitForStoryAutoplay,
};

export const FlowBImportedTrack: Story = {
  name: "Flow B Imported Track",
  render: (_, { loaded }) => <AutoplayStory entry="imported" bundle={loaded.bundle} />,
  play: waitForStoryAutoplay,
};

export const FlowCFreeExplore: Story = {
  name: "Flow C Free Explore",
  render: (_, { loaded }) => <AutoplayStory entry="explore" bundle={loaded.bundle} />,
  play: waitForStoryAutoplay,
};

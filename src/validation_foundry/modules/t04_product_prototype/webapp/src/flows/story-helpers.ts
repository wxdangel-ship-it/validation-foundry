import { expect, waitFor, within } from "@storybook/test";

type CanvasApi = ReturnType<typeof within>;

async function clickEnabledButton(canvas: CanvasApi, name: string) {
  await waitFor(() => {
    const button = canvas.queryByRole("button", { name });
    expect(button).not.toBeNull();
    expect(button).not.toHaveAttribute("disabled");
  });
  const button = canvas.getByRole("button", { name });
  button.click();
}

async function waitForPage(canvas: CanvasApi, pageId: string) {
  await waitFor(() => {
    const page = canvasElementFrom(canvas).querySelector(`[data-page-id="${pageId}"]`);
    expect(page).not.toBeNull();
  }, { timeout: 15000 });
}

async function waitForOverlay(canvas: CanvasApi, overlayId: string) {
  await waitFor(() => {
    const overlay = canvasElementFrom(canvas).querySelector(`[data-overlay-id="${overlayId}"]`);
    expect(overlay).not.toBeNull();
  }, { timeout: 15000 });
}

function canvasElementFrom(canvas: CanvasApi) {
  return (canvas as unknown as { container: HTMLElement }).container ?? document.body;
}

export async function playPlatformFlow({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement);
  await waitForPage(canvas, "route-detail");
  await clickEnabledButton(canvas, "一键下载");
  await clickEnabledButton(canvas, "导航至起点");
  await waitForPage(canvas, "offroad-map");
  await clickEnabledButton(canvas, "结束 Trip");
  await waitForPage(canvas, "trip-summary");
}

export async function playImportedFlow({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement);
  await waitForPage(canvas, "route-detail");
  await clickEnabledButton(canvas, "一键下载");
  await clickEnabledButton(canvas, "导航至起点");
  await waitForPage(canvas, "offroad-map");
  await clickEnabledButton(canvas, "结束 Trip");
  await waitForPage(canvas, "trip-summary");
}

export async function playExploreFlow({ canvasElement }: { canvasElement: HTMLElement }) {
  const canvas = within(canvasElement);
  await waitForPage(canvas, "free-explore-plan");
  await clickEnabledButton(canvas, "设起点");
  await clickEnabledButton(canvas, "边界工具");
  await clickEnabledButton(canvas, "添加锚点");
  await clickEnabledButton(canvas, "确认范围");
  await clickEnabledButton(canvas, "一键下载");
  await clickEnabledButton(canvas, "导航至起点");
  await waitForPage(canvas, "offroad-map");
  await clickEnabledButton(canvas, "安全入口");
  await waitForOverlay(canvas, "safety-drawer");
  await clickEnabledButton(canvas, "关闭抽屉");
  await clickEnabledButton(canvas, "结束 Trip");
  await waitForPage(canvas, "trip-summary");
}

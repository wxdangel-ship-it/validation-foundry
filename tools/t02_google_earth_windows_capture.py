from __future__ import annotations

import argparse
import math
import shutil
import subprocess
import time
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path

import mss
import mss.tools
import pyautogui
import win32con
import win32gui
from pywinauto import Desktop
from pywinauto.keyboard import send_keys


GOOGLE_EARTH_EXE = Path(r"C:\Program Files\Google\Google Earth Pro\client\googleearth.exe")
MAIN_WINDOW_TITLE = "Google Earth Pro"
CRASH_DIALOG_TITLE = "检测到 Google 地球崩溃"
STARTUP_PROMPT_TITLE = "启动提示"


@dataclass(frozen=True)
class CaptureRect:
    left: int
    top: int
    width: int
    height: int

    @property
    def center_x(self) -> int:
        return self.left + self.width // 2

    @property
    def safe_y(self) -> int:
        return self.top + min(40, max(16, self.height // 12))


@dataclass(frozen=True)
class ScheduledAction:
    at_sec: float
    keys: str


def launch_google_earth(kml_path: Path) -> subprocess.Popen[str]:
    if not GOOGLE_EARTH_EXE.exists():
        raise RuntimeError(f"Google Earth executable not found: {GOOGLE_EARTH_EXE}")
    return subprocess.Popen([str(GOOGLE_EARTH_EXE), str(kml_path)])


def kill_existing_google_earth() -> None:
    subprocess.run(["taskkill", "/IM", "googleearth.exe", "/F"], check=False, capture_output=True, text=True)


def ui_windows():
    return Desktop(backend="uia").windows()


def wait_for_main_window(timeout_sec: float = 45.0):
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        for window in ui_windows():
            if window.window_text() == MAIN_WINDOW_TITLE:
                return window
        time.sleep(0.5)
    raise RuntimeError("Timed out waiting for Google Earth Pro main window")


def handle_crash_dialog(timeout_sec: float = 20.0) -> None:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        for window in ui_windows():
            if CRASH_DIALOG_TITLE in window.window_text():
                for control in window.descendants():
                    if control.element_info.control_type == "Button" and control.window_text().startswith("继续"):
                        control.click_input()
                        time.sleep(1.5)
                        return
        time.sleep(0.5)


def activate_window(window) -> None:
    hwnd = window.handle
    win32gui.ShowWindow(hwnd, win32con.SW_MAXIMIZE)
    time.sleep(0.2)
    win32gui.SetForegroundWindow(hwnd)
    time.sleep(0.5)


def find_startup_prompt(window):
    for control in window.descendants():
        if control.window_text() == STARTUP_PROMPT_TITLE and control.element_info.control_type == "Window":
            return control
    return None


def close_startup_prompt(timeout_sec: float = 15.0) -> None:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        window = wait_for_main_window(timeout_sec=5.0)
        prompt = find_startup_prompt(window)
        if prompt is None:
            return

        clicked = False
        for control in prompt.descendants():
            if control.element_info.control_type == "Button" and control.window_text().startswith("关闭"):
                control.click_input()
                clicked = True
                time.sleep(1.5)
                break
        if not clicked:
            time.sleep(0.5)
            continue

        window = wait_for_main_window(timeout_sec=5.0)
        if find_startup_prompt(window) is None:
            return

    raise RuntimeError("Could not dismiss Google Earth startup prompt")


def click_tree_item(window, item_text: str) -> None:
    for control in window.descendants():
        if control.element_info.control_type == "TreeItem" and control.window_text() == item_text:
            control.click_input(double=False)
            time.sleep(0.8)
            return
    raise RuntimeError(f"Tree item not found: {item_text}")


def find_map_rect(window) -> CaptureRect:
    panes: list[CaptureRect] = []
    for control in window.descendants():
        if control.element_info.control_type != "Pane":
            continue
        rect = control.rectangle()
        if rect.left < 160 or rect.top < 60:
            continue
        width = rect.right - rect.left
        height = rect.bottom - rect.top
        if width < 800 or height < 450:
            continue
        panes.append(CaptureRect(left=rect.left, top=rect.top, width=width, height=height))

    if not panes:
        raise RuntimeError("Could not resolve Google Earth map pane")

    panes.sort(key=lambda rect: rect.width * rect.height, reverse=True)
    return panes[0]


def park_mouse(map_rect: CaptureRect) -> None:
    pyautogui.moveTo(map_rect.center_x, map_rect.safe_y, duration=0.1)


def parse_point_count(kml_path: Path) -> int:
    root = ET.parse(kml_path).getroot()
    ns = {
        "kml": "http://www.opengis.net/kml/2.2",
    }
    count = 0
    for placemark in root.findall(".//kml:Placemark", ns):
        name = placemark.findtext("kml:name", default="", namespaces=ns).strip()
        if name.isdigit():
            count += 1
    if count < 2:
        raise RuntimeError(f"Expected numbered placemarks in KML: {kml_path}")
    return count


def save_region_png(path: Path, region: CaptureRect) -> None:
    with mss.mss() as sct:
        shot = sct.grab(
            {
                "left": region.left,
                "top": region.top,
                "width": region.width,
                "height": region.height,
            }
        )
        mss.tools.to_png(shot.rgb, shot.size, output=str(path))


def capture_frames(
    frames_dir: Path,
    region: CaptureRect,
    fps: int,
    total_duration_sec: float,
    actions: list[ScheduledAction],
) -> None:
    interval = 1.0 / fps
    total_frames = max(1, math.ceil(total_duration_sec * fps))

    with mss.mss() as sct:
        monitor = {
            "left": region.left,
            "top": region.top,
            "width": region.width,
            "height": region.height,
        }
        start = time.perf_counter()
        next_tick = start
        action_idx = 0

        for frame_idx in range(total_frames):
            now = time.perf_counter()
            elapsed = now - start
            while action_idx < len(actions) and elapsed >= actions[action_idx].at_sec:
                send_keys(actions[action_idx].keys)
                park_mouse(region)
                action_idx += 1
                now = time.perf_counter()
                elapsed = now - start

            frame_path = frames_dir / f"frame_{frame_idx:05d}.png"
            shot = sct.grab(monitor)
            mss.tools.to_png(shot.rgb, shot.size, output=str(frame_path))

            next_tick += interval
            sleep_for = next_tick - time.perf_counter()
            if sleep_for > 0:
                time.sleep(sleep_for)


def build_actions(point_count: int, overview_hold_sec: float, first_fly_sec: float, step_interval_sec: float) -> list[ScheduledAction]:
    actions = [ScheduledAction(at_sec=overview_hold_sec, keys="{ENTER}")]
    next_time = overview_hold_sec + first_fly_sec
    for _ in range(2, point_count + 1):
        actions.append(ScheduledAction(at_sec=next_time, keys="{DOWN}{ENTER}"))
        next_time += step_interval_sec
    return actions


def graceful_close(window) -> None:
    try:
        activate_window(window)
        send_keys("%{F4}")
        time.sleep(1.0)
    except Exception:
        pass


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kml", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--fps", type=int, default=10)
    parser.add_argument("--overview-hold-sec", type=float, default=1.2)
    parser.add_argument("--first-fly-sec", type=float, default=2.7)
    parser.add_argument("--step-interval-sec", type=float, default=1.25)
    parser.add_argument("--ending-hold-sec", type=float, default=2.0)
    parser.add_argument("--frame-route-wait-sec", type=float, default=3.5)
    parser.add_argument("--kill-existing", action="store_true")
    args = parser.parse_args()

    kml_path = Path(args.kml)
    out_dir = Path(args.out_dir)
    frames_dir = out_dir / "frames"
    if frames_dir.exists():
        shutil.rmtree(frames_dir)
    frames_dir.mkdir(parents=True, exist_ok=True)

    pyautogui.FAILSAFE = False

    if args.kill_existing:
        kill_existing_google_earth()
        time.sleep(1.0)

    point_count = parse_point_count(kml_path)
    proc = launch_google_earth(kml_path)
    handle_crash_dialog()
    window = wait_for_main_window()
    activate_window(window)
    close_startup_prompt()
    window = wait_for_main_window()
    activate_window(window)

    click_tree_item(window, kml_path.stem.replace("_tour", "") + "_track")
    send_keys("{ENTER}")
    time.sleep(args.frame_route_wait_sec)

    click_tree_item(window, "001")
    map_rect = find_map_rect(window)
    park_mouse(map_rect)

    (out_dir / "capture_rect.txt").write_text(
        f"{map_rect.left},{map_rect.top},{map_rect.width},{map_rect.height}\n",
        encoding="utf-8",
    )
    save_region_png(out_dir / "preview_before_record.png", map_rect)

    actions = build_actions(
        point_count=point_count,
        overview_hold_sec=args.overview_hold_sec,
        first_fly_sec=args.first_fly_sec,
        step_interval_sec=args.step_interval_sec,
    )
    total_duration_sec = actions[-1].at_sec + args.step_interval_sec + args.ending_hold_sec
    capture_frames(
        frames_dir=frames_dir,
        region=map_rect,
        fps=args.fps,
        total_duration_sec=total_duration_sec,
        actions=actions,
    )
    save_region_png(out_dir / "preview_after_record.png", map_rect)

    try:
        graceful_close(window)
    finally:
        try:
            proc.terminate()
        except Exception:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

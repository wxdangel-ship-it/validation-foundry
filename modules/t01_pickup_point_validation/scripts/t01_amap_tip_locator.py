from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2
import numpy as np


DEFAULT_REFERENCE_IMAGE = (
    "outputs/_legacy_import/20260328_t01_thread_restart/"
    "20260327_t01_amap_batch_golden10/GS01/amap_taxi.png"
)

BLUE_PICKUP_VARIANTS: dict[str, dict[str, float]] = {
    "school_northwest_side": {
        "x_min": 520.0,
        "x_max": 660.0,
        "y_min": 520.0,
        "y_max": 760.0,
        "prefer_x": 556.0,
    },
    "school_northwest_gate": {
        "x_min": 520.0,
        "x_max": 660.0,
        "y_min": 520.0,
        "y_max": 760.0,
        "prefer_x": 558.0,
    },
    "qingyouyuan_w4_lianjia": {
        "x_min": 440.0,
        "x_max": 580.0,
        "y_min": 680.0,
        "y_max": 840.0,
        "prefer_x": 505.0,
    },
    "generic_taxi_pickup": {
        "x_min": 440.0,
        "x_max": 660.0,
        "y_min": 520.0,
        "y_max": 820.0,
        "prefer_x": 556.0,
    },
}

GREEN_START_VARIANTS: dict[str, dict[str, float]] = {
    "local_route_pickup": {
        "x_min": 60.0,
        "x_max": 360.0,
        "y_min": 500.0,
        "y_max": 980.0,
        "area_min": 900.0,
        "area_max": 5000.0,
        "aspect_min": 0.45,
        "aspect_max": 1.45,
        "fill_min": 0.42,
    },
    "routeplan_pickup_right": {
        "x_min": 760.0,
        "x_max": 920.0,
        "y_min": 980.0,
        "y_max": 1220.0,
        "area_min": 1800.0,
        "area_max": 4200.0,
        "aspect_min": 0.65,
        "aspect_max": 1.2,
        "fill_min": 0.45,
    },
}


def parse_xyxy(raw: str) -> tuple[int, int, int, int]:
    parts = [int(part.strip()) for part in raw.split(",")]
    if len(parts) != 4:
        raise ValueError(f"xyxy requires 4 integers, got: {raw!r}")
    x1, y1, x2, y2 = parts
    if x2 <= x1 or y2 <= y1:
        raise ValueError(f"xyxy must define a positive area, got: {raw!r}")
    return x1, y1, x2, y2


def parse_xy(raw: str) -> tuple[float, float]:
    parts = [float(part.strip()) for part in raw.split(",")]
    if len(parts) != 2:
        raise ValueError(f"xy requires 2 numbers, got: {raw!r}")
    return parts[0], parts[1]


def load_image(path: str | Path) -> np.ndarray:
    image = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"failed to read image: {path}")
    return image


def match_taxi_my_location(
    image: np.ndarray,
    reference_image: np.ndarray,
    template_xyxy: tuple[int, int, int, int],
    tip_offset_xy: tuple[float, float],
    search_xyxy: tuple[int, int, int, int],
) -> dict[str, object]:
    tx1, ty1, tx2, ty2 = template_xyxy
    sx1, sy1, sx2, sy2 = search_xyxy
    template = reference_image[ty1:ty2, tx1:tx2]
    roi = image[sy1:sy2, sx1:sx2]
    result = cv2.matchTemplate(roi, template, cv2.TM_CCOEFF_NORMED)
    _, max_score, _, max_loc = cv2.minMaxLoc(result)
    top_left_x = sx1 + max_loc[0]
    top_left_y = sy1 + max_loc[1]
    tip_x = top_left_x + tip_offset_xy[0]
    tip_y = top_left_y + tip_offset_xy[1]
    return {
        "status": "FOUND",
        "method": "template_match",
        "score": float(max_score),
        "tip_x": float(tip_x),
        "tip_y": float(tip_y),
        "bbox": [int(top_left_x), int(top_left_y), int(top_left_x + template.shape[1]), int(top_left_y + template.shape[0])],
        "details": {
            "template_xyxy": [tx1, ty1, tx2, ty2],
            "search_xyxy": [sx1, sy1, sx2, sy2],
            "tip_offset_xy": [tip_offset_xy[0], tip_offset_xy[1]],
        },
    }


def red_mask(image: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    low_1 = cv2.inRange(hsv, (0, 70, 70), (12, 255, 255))
    low_2 = cv2.inRange(hsv, (170, 70, 70), (180, 255, 255))
    return low_1 | low_2


def blue_mask(image: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    return cv2.inRange(hsv, (90, 90, 90), (135, 255, 255))


def green_mask(image: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    return cv2.inRange(hsv, (35, 80, 80), (95, 255, 255))


def classify_taxi_page_variant(texts: list[str]) -> str:
    joined = "\n".join(texts)
    if "清友园(西4门)-链家旁" in joined:
        return "qingyouyuan_w4_lianjia"
    if "北京市和平街第一中学小学部清友园校区(西北门)西北侧" in joined:
        return "school_northwest_side"
    if "北京市和平街第一中学小学部清友园校区(西北门)" in joined:
        return "school_northwest_gate"
    return "generic_taxi_pickup"


def detect_blue_pickup_pin(image: np.ndarray, page_variant: str = "generic_taxi_pickup") -> dict[str, object]:
    mask = blue_mask(image)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, 8)
    variant_cfg = BLUE_PICKUP_VARIANTS.get(page_variant, BLUE_PICKUP_VARIANTS["generic_taxi_pickup"])

    candidates: list[dict[str, float | int]] = []
    for idx in range(1, num_labels):
        x, y, w, h, area = stats[idx]
        if area < 150:
            continue
        if not (variant_cfg["y_min"] <= y <= variant_cfg["y_max"]):
            continue
        if not (variant_cfg["x_min"] <= x <= variant_cfg["x_max"]):
            continue
        cx, cy = centroids[idx]
        candidates.append(
            {
                "id": idx,
                "x": int(x),
                "y": int(y),
                "w": int(w),
                "h": int(h),
                "area": int(area),
                "cx": float(cx),
                "cy": float(cy),
                "bottom": int(y + h),
            }
        )

    if not candidates:
        return {
            "status": "NOT_FOUND",
            "method": "blue_pickup_pin_bottom_tip",
            "score": 0.0,
            "reason": "no_candidate_component",
        }

    candidates.sort(
        key=lambda item: (
            int(item["bottom"]),
            -abs(float(item["cx"]) - variant_cfg["prefer_x"]),
            -int(item["area"]),
        ),
        reverse=True,
    )
    best = candidates[0]
    group_mask = labels == int(best["id"])
    ys, xs = np.where(group_mask)
    tip_y = int(ys.max())
    tip_xs = xs[ys == tip_y]
    tip_x = float(tip_xs.mean())
    return {
        "status": "FOUND",
        "method": "blue_pickup_pin_bottom_tip",
        "score": float(best["area"]),
        "tip_x": tip_x,
        "tip_y": float(tip_y),
        "bbox": [int(best["x"]), int(best["y"]), int(best["x"] + best["w"]), int(best["y"] + best["h"])],
        "details": {
            "component": best,
            "candidate_count": len(candidates),
            "page_variant": page_variant,
        },
    }


def detect_green_start_pickup(image: np.ndarray, page_variant: str = "local_route_pickup") -> dict[str, object]:
    mask = green_mask(image)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, 8)
    variant_cfg = GREEN_START_VARIANTS.get(page_variant, GREEN_START_VARIANTS["local_route_pickup"])

    candidates: list[dict[str, float | int]] = []
    for idx in range(1, num_labels):
        x, y, w, h, area = stats[idx]
        if area < variant_cfg["area_min"] or area > variant_cfg["area_max"]:
            continue
        if x < variant_cfg["x_min"] or x > variant_cfg["x_max"]:
            continue
        if y < variant_cfg["y_min"] or y > variant_cfg["y_max"]:
            continue
        if h <= 0:
            continue
        aspect = float(w / h)
        if aspect < variant_cfg["aspect_min"] or aspect > variant_cfg["aspect_max"]:
            continue
        fill_ratio = float(area / max(w * h, 1))
        if fill_ratio < variant_cfg["fill_min"]:
            continue
        cx, cy = centroids[idx]
        candidates.append(
            {
                "id": idx,
                "x": int(x),
                "y": int(y),
                "w": int(w),
                "h": int(h),
                "area": int(area),
                "cx": float(cx),
                "cy": float(cy),
                "aspect": aspect,
                "fill_ratio": fill_ratio,
            }
        )

    if not candidates:
        return {
            "status": "NOT_FOUND",
            "method": "green_start_pickup_bottom_tip",
            "score": 0.0,
            "reason": "no_candidate_component",
        }

    candidates.sort(
        key=lambda item: (
            int(item["area"]),
            -abs(float(item["aspect"]) - 0.85),
            -float(item["fill_ratio"]),
        ),
        reverse=True,
    )
    best = candidates[0]
    group_mask = labels == int(best["id"])
    ys, xs = np.where(group_mask)
    tip_y = int(ys.max())
    tip_xs = xs[ys == tip_y]
    tip_x = float(tip_xs.mean())
    return {
        "status": "FOUND",
        "method": "green_start_pickup_bottom_tip",
        "score": float(best["area"]),
        "tip_x": tip_x,
        "tip_y": float(tip_y),
        "bbox": [int(best["x"]), int(best["y"]), int(best["x"] + best["w"]), int(best["y"] + best["h"])],
        "details": {
            "component": best,
            "candidate_count": len(candidates),
            "page_variant": page_variant,
        },
    }


def detect_red_pin(image: np.ndarray, y_max: int = 1500) -> dict[str, object]:
    mask = red_mask(image)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, 8)

    components: list[dict[str, float | int]] = []
    body: dict[str, float | int] | None = None
    for idx in range(1, num_labels):
        x, y, w, h, area = stats[idx]
        if area < 50 or y > y_max:
            continue
        cx, cy = centroids[idx]
        component = {
            "id": idx,
            "x": int(x),
            "y": int(y),
            "w": int(w),
            "h": int(h),
            "area": int(area),
            "cx": float(cx),
            "cy": float(cy),
        }
        components.append(component)
        if area >= 300 and (body is None or int(area) > int(body["area"])):
            body = component

    if body is None:
        return {
            "status": "NOT_FOUND",
            "method": "red_pin_component_merge",
            "score": 0.0,
            "reason": "no_body_component",
        }

    member_ids = [int(body["id"])]
    body_x = int(body["x"])
    body_y = int(body["y"])
    body_w = int(body["w"])
    body_h = int(body["h"])
    body_cx = float(body["cx"])
    for component in components:
        if int(component["id"]) == int(body["id"]):
            continue
        if int(component["area"]) > 500:
            continue
        if int(component["y"]) < body_y + body_h - 5 or int(component["y"]) > body_y + body_h + 70:
            continue
        if abs(float(component["cx"]) - body_cx) > body_w * 0.22:
            continue
        if int(component["w"]) > body_w * 0.35:
            continue
        member_ids.append(int(component["id"]))

    group_mask = np.isin(labels, member_ids)
    ys, xs = np.where(group_mask)
    if ys.size == 0:
        return {
            "status": "NOT_FOUND",
            "method": "red_pin_component_merge",
            "score": 0.0,
            "reason": "empty_group",
        }

    tip_y = int(ys.max())
    tip_x = float(body_cx)
    return {
        "status": "FOUND",
        "method": "red_pin_component_merge",
        "score": float(body["area"]),
        "tip_x": tip_x,
        "tip_y": float(tip_y),
        "bbox": [body_x, body_y, body_x + body_w, body_y + body_h],
        "details": {
            "body_component": body,
            "member_ids": member_ids,
        },
    }


def annotate(image: np.ndarray, result: dict[str, object]) -> np.ndarray:
    annotated = image.copy()
    bbox = result.get("bbox")
    if isinstance(bbox, list) and len(bbox) == 4:
        x1, y1, x2, y2 = [int(round(value)) for value in bbox]
        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 255), 2)
    if result.get("status") == "FOUND":
        tip_x = int(round(float(result["tip_x"])))
        tip_y = int(round(float(result["tip_y"])))
        cv2.drawMarker(
            annotated,
            (tip_x, tip_y),
            (0, 255, 0),
            markerType=cv2.MARKER_CROSS,
            markerSize=28,
            thickness=2,
        )
        cv2.putText(
            annotated,
            f"tip=({tip_x},{tip_y})",
            (max(10, tip_x - 90), max(20, tip_y - 10)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )
    return annotated


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Locate pickup tip pixels in AMap screenshots.")
    parser.add_argument("image", help="target screenshot path")
    parser.add_argument(
        "--profile",
        choices=("taxi_my_location", "red_pin", "blue_pickup_pin", "green_start_pickup"),
        required=True,
        help="detection profile",
    )
    parser.add_argument(
        "--reference-image",
        default=DEFAULT_REFERENCE_IMAGE,
        help="reference screenshot for taxi_my_location template matching",
    )
    parser.add_argument(
        "--template-xyxy",
        default="380,500,630,720",
        help="template crop on reference image, x1,y1,x2,y2",
    )
    parser.add_argument(
        "--search-xyxy",
        default="250,350,850,950",
        help="search ROI on target image, x1,y1,x2,y2",
    )
    parser.add_argument(
        "--tip-offset-xy",
        default="159,181",
        help="tip offset from template top-left, dx,dy",
    )
    parser.add_argument(
        "--page-variant",
        default="generic_taxi_pickup",
        choices=tuple(sorted(set(BLUE_PICKUP_VARIANTS.keys()) | set(GREEN_START_VARIANTS.keys()))),
        help="variant hint for blue_pickup_pin / green_start_pickup profile",
    )
    parser.add_argument("--out-json", help="write result JSON to this path")
    parser.add_argument("--annotated-out", help="write annotated image to this path")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    image = load_image(args.image)

    if args.profile == "taxi_my_location":
        reference_image = load_image(args.reference_image)
        result = match_taxi_my_location(
            image=image,
            reference_image=reference_image,
            template_xyxy=parse_xyxy(args.template_xyxy),
            tip_offset_xy=parse_xy(args.tip_offset_xy),
            search_xyxy=parse_xyxy(args.search_xyxy),
        )
    elif args.profile == "red_pin":
        result = detect_red_pin(image)
    elif args.profile == "green_start_pickup":
        result = detect_green_start_pickup(image, page_variant=args.page_variant)
    else:
        result = detect_blue_pickup_pin(image, page_variant=args.page_variant)

    result["image"] = str(Path(args.image))
    result["profile"] = args.profile
    if args.profile in {"blue_pickup_pin", "green_start_pickup"}:
        result["page_variant"] = args.page_variant

    if args.out_json:
        out_path = Path(args.out_json)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))

    if args.annotated_out:
        annotated_path = Path(args.annotated_out)
        annotated_path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(annotated_path), annotate(image, result))

    return 0 if result.get("status") == "FOUND" else 1


if __name__ == "__main__":
    raise SystemExit(main())

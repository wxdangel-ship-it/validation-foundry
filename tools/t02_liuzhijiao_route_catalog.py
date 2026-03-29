from __future__ import annotations

import argparse
import csv
import json
import math
import re
import shutil
import time
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup


GPX_NS = {"gpx": "http://www.topografix.com/GPX/1/1"}
SIXFOOT_BASE_URL = "https://www.foooooot.com/trip/{route_number}/"
USER_AGENT = "Mozilla/5.0 Codex ValidationFoundry"
NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
PROVINCE_PREFIXES = (
    "内蒙古",
    "北京",
    "天津",
    "河北",
    "山西",
    "辽宁",
    "吉林",
    "黑龙江",
    "上海",
    "江苏",
    "浙江",
    "安徽",
    "福建",
    "江西",
    "山东",
    "河南",
    "湖北",
    "湖南",
    "广东",
    "广西",
    "海南",
    "重庆",
    "四川",
    "贵州",
    "云南",
    "西藏",
    "陕西",
    "甘肃",
    "青海",
    "宁夏",
    "新疆",
)


@dataclass
class TrackPoint:
    lon: float
    lat: float
    ele_m: float | None
    time_utc: datetime | None
    speed_kmh: float | None


@dataclass
class GeometrySummary:
    point_count: int
    length_km: float
    start_end_distance_km: float
    route_form: str
    start_time_utc: str | None
    end_time_utc: str | None
    duration_hours: float | None
    elevation_min_m: float | None
    elevation_max_m: float | None
    elevation_gain_m: float
    elevation_loss_m: float
    average_speed_kmh_derived: float | None
    average_recorded_speed_kmh: float | None
    maximum_recorded_speed_kmh: float | None
    bbox_wgs84: dict[str, float]
    start_wgs84: dict[str, float]
    midpoint_wgs84: dict[str, float]
    end_wgs84: dict[str, float]


def parse_iso8601(value: str | None) -> datetime | None:
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def parse_float(value: str | None) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def local_name(tag: str) -> str:
    if "}" in tag:
        return tag.rsplit("}", 1)[1]
    return tag


def haversine_m(a: tuple[float, float], b: tuple[float, float]) -> float:
    lon1, lat1 = map(math.radians, a)
    lon2, lat2 = map(math.radians, b)
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 6371000.0 * 2 * math.asin(math.sqrt(h))


def load_track_points(gpx_path: Path) -> list[TrackPoint]:
    root = ET.parse(gpx_path).getroot()
    points: list[TrackPoint] = []
    for trkpt in root.findall(".//gpx:trkpt", GPX_NS):
        ele_text = trkpt.findtext("gpx:ele", default=None, namespaces=GPX_NS)
        time_text = trkpt.findtext("gpx:time", default=None, namespaces=GPX_NS)
        speed_text = None
        for node in trkpt.iter():
            if local_name(node.tag) == "speed" and node.text:
                speed_text = node.text.strip()
                break
        speed_value = parse_float(speed_text)
        points.append(
            TrackPoint(
                lon=float(trkpt.attrib["lon"]),
                lat=float(trkpt.attrib["lat"]),
                ele_m=parse_float(ele_text),
                time_utc=parse_iso8601(time_text),
                speed_kmh=speed_value * 3.6 if speed_value is not None else None,
            )
        )
    if len(points) < 2:
        raise RuntimeError(f"GPX has too few points: {gpx_path}")
    return points


def classify_route_form(length_km: float, start_end_distance_km: float) -> str:
    if start_end_distance_km <= 0.8 or (length_km > 0 and start_end_distance_km / length_km <= 0.12):
        return "环线或近环线"
    if length_km > 0 and start_end_distance_km / length_km <= 0.35:
        return "折返或回环穿越"
    return "点到点穿越"


def compute_geometry_summary(points: list[TrackPoint]) -> GeometrySummary:
    coords = [(point.lon, point.lat) for point in points]
    total_m = 0.0
    elevation_gain_m = 0.0
    elevation_loss_m = 0.0
    speeds: list[float] = []
    elevations: list[float] = []

    for idx in range(1, len(points)):
        prev = points[idx - 1]
        curr = points[idx]
        total_m += haversine_m((prev.lon, prev.lat), (curr.lon, curr.lat))
        if prev.ele_m is not None and curr.ele_m is not None:
            delta = curr.ele_m - prev.ele_m
            if delta > 0:
                elevation_gain_m += delta
            elif delta < 0:
                elevation_loss_m += -delta

    for point in points:
        if point.speed_kmh is not None:
            speeds.append(point.speed_kmh)
        if point.ele_m is not None:
            elevations.append(point.ele_m)

    start = points[0]
    midpoint = points[len(points) // 2]
    end = points[-1]
    length_km = total_m / 1000.0
    start_end_distance_km = haversine_m((start.lon, start.lat), (end.lon, end.lat)) / 1000.0
    start_time = start.time_utc
    end_time = end.time_utc
    duration_hours = None
    if start_time and end_time and end_time > start_time:
        duration_hours = (end_time - start_time).total_seconds() / 3600.0

    avg_speed_derived = None
    if duration_hours and duration_hours > 0:
        avg_speed_derived = length_km / duration_hours

    avg_recorded_speed = sum(speeds) / len(speeds) if speeds else None
    max_recorded_speed = max(speeds) if speeds else None
    lons = [point.lon for point in points]
    lats = [point.lat for point in points]

    return GeometrySummary(
        point_count=len(points),
        length_km=round(length_km, 3),
        start_end_distance_km=round(start_end_distance_km, 3),
        route_form=classify_route_form(length_km, start_end_distance_km),
        start_time_utc=start_time.isoformat() if start_time else None,
        end_time_utc=end_time.isoformat() if end_time else None,
        duration_hours=round(duration_hours, 3) if duration_hours is not None else None,
        elevation_min_m=round(min(elevations), 2) if elevations else None,
        elevation_max_m=round(max(elevations), 2) if elevations else None,
        elevation_gain_m=round(elevation_gain_m, 1),
        elevation_loss_m=round(elevation_loss_m, 1),
        average_speed_kmh_derived=round(avg_speed_derived, 2) if avg_speed_derived is not None else None,
        average_recorded_speed_kmh=round(avg_recorded_speed, 2) if avg_recorded_speed is not None else None,
        maximum_recorded_speed_kmh=round(max_recorded_speed, 2) if max_recorded_speed is not None else None,
        bbox_wgs84={
            "min_lon": round(min(lons), 8),
            "min_lat": round(min(lats), 8),
            "max_lon": round(max(lons), 8),
            "max_lat": round(max(lats), 8),
        },
        start_wgs84={"lon": round(start.lon, 8), "lat": round(start.lat, 8)},
        midpoint_wgs84={"lon": round(midpoint.lon, 8), "lat": round(midpoint.lat, 8)},
        end_wgs84={"lon": round(end.lon, 8), "lat": round(end.lat, 8)},
    )


def fetch_sixfoot_page(route_number: str, session: requests.Session) -> dict[str, Any]:
    url = SIXFOOT_BASE_URL.format(route_number=route_number)
    response = session.get(url, timeout=30)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "lxml")

    title_node = soup.select_one("h1.title")
    description_node = soup.select_one("div.trip_box_description")
    trip_boxes = soup.select("div.trip_box")
    summary_text = ""
    if len(trip_boxes) >= 2:
        summary_text = " ".join(trip_boxes[1].get_text(" ", strip=True).split())

    title = title_node.get_text(strip=True) if title_node else route_number
    description = ""
    if description_node:
        description = " ".join(description_node.get_text(" ", strip=True).split())

    meta: dict[str, Any] = {
        "source_page_url": url,
        "title": title,
        "official_description": description or None,
        "official_summary_text": summary_text,
    }

    patterns = {
        "author": r"^(?P<value>.+?)\s+0\s*/\s*5\s*\(",
        "depart_local": r"于\s*(?P<value>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\s*出发",
        "official_duration_text": r"出发,历时\s*(?P<value>.+?)\s+(?=(?:内蒙古|北京|天津|河北|山西|辽宁|吉林|黑龙江|上海|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|广西|海南|重庆|四川|贵州|云南|西藏|陕西|甘肃|青海|宁夏|新疆))",
        "distance_km": r"全程\s*(?P<value>-?\d+(?:\.\d+)?)\s*公里",
        "difficulty": r"难度级别：\s*(?P<value>\S+)",
        "ascent_m": r"累计上升\s*：\s*(?P<value>-?\d+(?:\.\d+)?)米",
        "descent_m": r"累计下降：\s*(?P<value>-?\d+(?:\.\d+)?)米",
        "min_elevation_m": r"海拔最低：\s*(?P<value>-?\d+(?:\.\d+)?)\s*米",
        "max_elevation_m": r"最高：\s*(?P<value>-?\d+(?:\.\d+)?)\s*米",
        "max_speed_kmh": r"最高速度：\s*(?P<value>-?\d+(?:\.\d+)?)公里每小时",
        "intensity": r"路线强度：\s*(?P<value>-?\d+(?:\.\d+)?)",
        "editor_hint": r"小编提示：\s*(?P<value>.+?)\s*(?:无|$)",
        "downloads_count": r"下载.*?<span class=\"pr5\">(?P<value>\d+)</span>",
        "favorites_count": r"收藏</a>\s*<span class=\"pr5\">(?P<value>\d+)</span>",
        "browse_count": r"<label class=\"browse_count\">浏览</label>\s*<span class=\"pr5\">(?P<value>\d+)</span>",
        "device_name": r"title=\"([^\"]+)\"",
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, response.text if key.endswith("_count") or key == "device_name" else summary_text, re.S)
        if not match:
            continue
        if key == "device_name":
            if "手机客户端软件" in match.group(1):
                meta["device_name"] = match.group(1)
        else:
            meta[key] = " ".join(match.group("value").split())

    duration_text = meta.get("official_duration_text")
    if duration_text and duration_text in summary_text:
        trailing = summary_text.split(duration_text, 1)[1].strip()
        admin_match = re.search(
            r"^(?P<start>.+?)\s*-\s*(?P<end>.+?)\s+(?P<activity>自驾车|徒步|骑行|观光旅游|摄影|越野|摩托车|山地骑行|公路骑行|跑步|滑雪|航海|滑翔伞|寻宝|Gps作画|其他)\s*，",
            trailing,
            re.S,
        )
        if admin_match:
            meta["official_start_admin"] = " ".join(admin_match.group("start").split())
            meta["official_end_admin"] = " ".join(admin_match.group("end").split())
            meta["activity_type"] = admin_match.group("activity")

    if meta.get("editor_hint") == "":
        meta["editor_hint"] = None
    return meta


def reverse_geocode(session: requests.Session, lat: float, lon: float, request_pause_sec: float) -> dict[str, Any] | None:
    params = {
        "lat": lat,
        "lon": lon,
        "format": "jsonv2",
        "zoom": 16,
        "addressdetails": 1,
        "accept-language": "zh-CN",
    }
    try:
        response = session.get(NOMINATIM_REVERSE_URL, params=params, timeout=30)
        response.raise_for_status()
        time.sleep(request_pause_sec)
        data = response.json()
        return {
            "display_name": data.get("display_name"),
            "category": data.get("category"),
            "type": data.get("type"),
            "address": data.get("address", {}),
            "licence": data.get("licence"),
        }
    except Exception:
        return None


def first_location_label(geocode: dict[str, Any] | None) -> str | None:
    if not geocode:
        return None
    address = geocode.get("address", {})
    for key in ["road", "village", "town", "suburb", "hamlet", "city", "county", "state"]:
        value = address.get(key)
        if value:
            return value
    return geocode.get("display_name")


def user_area_label(geocode: dict[str, Any] | None) -> str | None:
    if not geocode:
        return None
    address = geocode.get("address", {})
    for key in ["hamlet", "village", "town", "suburb", "city", "county", "state"]:
        value = address.get(key)
        if value:
            return value
    return geocode.get("display_name")


def terrain_class(summary: GeometrySummary) -> str:
    min_ele = summary.elevation_min_m or 0.0
    max_ele = summary.elevation_max_m or 0.0
    relief = max_ele - min_ele
    if max_ele < 20:
        return "低海拔平原或滨海地带"
    if relief < 50:
        return "平原到缓丘地带"
    if relief < 200:
        return "丘陵和山前台地"
    if relief < 500:
        return "低山丘陵地带"
    return "山地或高落差地带"


def distance_class(length_km: float) -> str:
    if length_km < 10:
        return "短线试车或熟悉路线"
    if length_km < 30:
        return "半日越野穿越"
    if length_km < 80:
        return "一日越野穿越"
    return "长距离联程穿越"


def route_role_text(length_km: float, route_form: str) -> str:
    if length_km >= 120:
        return "更像一条需要完整时间窗口和补给规划的长距离联程路线"
    if route_form == "环线或近环线":
        return "更像一条适合试车、带队熟路或半日往返的闭环路线"
    if route_form == "点到点穿越":
        return "更像一条需要提前安排回程或接驳的点到点穿越线"
    return "更像一条兼顾探索和回撤灵活性的回环路线"


def vehicle_suggestion(difficulty: str, relief_m: float, length_km: float, intensity_text: str | None) -> str:
    intensity = parse_float(intensity_text)
    if difficulty == "专家级" and relief_m < 250 and length_km < 20:
        return "虽然里程不长，但官方把它标成专家级，通常更考验通过性、线路判断和局部复杂路况处置；更建议有经验的高底盘 SUV 或四驱车辆前往。"
    if difficulty in {"专家级", "难"} or relief_m >= 500 or (intensity is not None and intensity >= 5) or length_km >= 120:
        return "更适合有长途或山地经验的高通过性 SUV / 四驱车辆，驾驶员需要有连续爬坡、长下坡和复杂岔路判断经验。"
    if relief_m >= 180 or length_km >= 30:
        return "更适合高底盘 SUV 或具备一定通过性的四驱车辆，首次前往建议结伴同行，不建议把它当作纯铺装休闲线。"
    return "整体更偏轻越野或乡道穿越，适合高底盘 SUV、四驱城市 SUV 或熟悉非铺装路面的驾驶者。"


def risk_tips(geometry: GeometrySummary, difficulty: str, route_form: str, intensity_text: str | None) -> list[str]:
    tips = ["雨后、落叶季或连续降温后，路面附着力和可见度可能明显变差，出发前应先确认路况。"]
    relief_m = (geometry.elevation_max_m or 0.0) - (geometry.elevation_min_m or 0.0)
    if route_form == "点到点穿越":
        tips.append("这条线不是闭环，回程和补给需要提前设计，不适合临时起意直接上路。")
    if geometry.length_km >= 80:
        tips.append("总里程较长，建议把加油、充电、午餐和掉头点一起规划，不要把全部行程压到日落后。")
    if relief_m >= 300:
        tips.append("爬升和下坡都比较明显，连续弯坡路段要特别关注刹车温度、轮胎状态和会车空间。")
    if difficulty in {"难", "专家级"}:
        tips.append(f"六只脚官方难度标注为“{difficulty}”，更适合已经有非铺装经验的驾驶者。")
    if difficulty == "专家级" and relief_m < 250 and geometry.length_km < 20:
        tips.append("这类短线高难度更可能是局部泥地、窄路、沟坎或岔路判断带来的难度，不要因为里程短就降低准备标准。")
    intensity = parse_float(intensity_text)
    if intensity is not None and intensity >= 8:
        tips.append(f"官方路线强度达到 {intensity_text}，应按高强度穿越线准备时间、人员和车辆冗余。")
    return tips


def generated_description(
    route_number: str,
    geometry: GeometrySummary,
    source_meta: dict[str, Any],
    start_geo: dict[str, Any] | None,
    mid_geo: dict[str, Any] | None,
    end_geo: dict[str, Any] | None,
) -> str:
    start_label = user_area_label(start_geo) or source_meta.get("official_start_admin") or "起点区域"
    mid_label = user_area_label(mid_geo)
    end_label = user_area_label(end_geo) or source_meta.get("official_end_admin") or "终点区域"
    terrain = terrain_class(geometry)
    length_class = distance_class(geometry.length_km)
    difficulty = source_meta.get("difficulty", "未知")
    activity = source_meta.get("activity_type", "自驾车")
    intensity = source_meta.get("intensity")
    relief_m = (geometry.elevation_max_m or 0.0) - (geometry.elevation_min_m or 0.0)
    role_text = route_role_text(geometry.length_km, geometry.route_form)
    vehicle_text = vehicle_suggestion(difficulty, relief_m, geometry.length_km, intensity)
    tips = risk_tips(geometry, difficulty, geometry.route_form, intensity)

    context_bits = [bit for bit in [start_label, mid_label, end_label] if bit]
    unique_context_bits: list[str] = []
    for bit in context_bits:
        if bit not in unique_context_bits:
            unique_context_bits.append(bit)

    highlight_lines = [
        f"路线主体位于“{' - '.join(unique_context_bits[:3])}”一带。" if unique_context_bits else "路线主要位于官方标注区域附近。",
        f"轨迹全长约 {geometry.length_km:.1f} 公里，官方难度为“{difficulty}”，路线形态属于“{geometry.route_form}”。",
        f"海拔约 {int((geometry.elevation_min_m or 0))} 至 {int((geometry.elevation_max_m or 0))} 米，累计爬升约 {int(geometry.elevation_gain_m)} 米，整体地形可归为{terrain}。",
    ]
    if geometry.length_km >= 80:
        highlight_lines.append("这类长距离线路更看重节奏控制和全程补给，不适合临时缩短准备时间。")
    elif relief_m >= 300:
        highlight_lines.append("虽然总里程不一定特别长，但落差明显，实际驾驶负荷会高于平原轻越野线路。")
    else:
        highlight_lines.append("如果天气稳定、路况正常，这类线路通常适合作为半日到一日的体验型穿越。")

    plan_lines = [
        f"建议把它当作“{length_class}”来规划，{role_text}",
        vehicle_text,
    ]
    if geometry.duration_hours is not None:
        plan_lines.append(
            f"按轨迹记录，原始行程历时约 {geometry.duration_hours:.1f} 小时；实际出行时还应额外预留拍照、探路和会车等待时间。"
        )

    return (
        f"# {route_number} 路线路书说明\n\n"
        f"## 一句话看懂\n"
        f"这是一条从{start_label}延伸到{end_label}的{activity}路线，长度约 {geometry.length_km:.1f} 公里，"
        f"整体属于{terrain}环境下的“{geometry.route_form}”，官方难度为“{difficulty}”。\n\n"
        f"## 路线看点\n"
        + "".join(f"- {line}\n" for line in highlight_lines)
        + "\n"
        f"## 适合谁去\n"
        + "".join(f"- {line}\n" for line in plan_lines)
        + "\n"
        f"## 基本信息\n"
        f"- 官方标题：{source_meta.get('title') or route_number}\n"
        f"- 官方起终点：{source_meta.get('official_start_admin') or start_label} -> {source_meta.get('official_end_admin') or end_label}\n"
        f"- GPX 统计里程：{geometry.length_km:.1f} 公里\n"
        f"- 起终点直线距离：{geometry.start_end_distance_km:.1f} 公里\n"
        f"- 海拔范围：{int((geometry.elevation_min_m or 0))} - {int((geometry.elevation_max_m or 0))} 米\n"
        f"- 累计爬升 / 下降：{int(geometry.elevation_gain_m)} 米 / {int(geometry.elevation_loss_m)} 米\n"
        f"- 官方路线强度：{intensity or '未知'}\n"
        f"- 历史记录时间：{source_meta.get('depart_local') or '未知'}\n\n"
        f"## 出行提醒\n"
        + "".join(f"- {line}\n" for line in tips)
        + "\n"
        f"## 说明来源\n"
        f"- 六只脚原始说明：{source_meta.get('official_description') or '无'}\n"
        f"- 官方来源页：{source_meta.get('source_page_url')}\n"
        f"- 当前路书说明为基于六只脚摘要、GPX 几何统计和 OpenStreetMap 逆地理编码生成的用户导向整理版。\n"
    )


def build_geojson(route_number: str, points: list[TrackPoint], geometry: GeometrySummary, metadata: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "route_number": route_number,
                    "title": metadata.get("title"),
                    "source_identifier": metadata.get("source_identifier"),
                    "activity_type": metadata.get("activity_type"),
                    "difficulty": metadata.get("difficulty"),
                    "length_km": geometry.length_km,
                    "route_form": geometry.route_form,
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[point.lon, point.lat, point.ele_m or 0.0] for point in points],
                },
            }
        ],
    }


def write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-gpx-dir", required=True)
    parser.add_argument("--export-log", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--nominatim-pause-sec", type=float, default=1.0)
    args = parser.parse_args()

    input_gpx_dir = Path(args.input_gpx_dir)
    export_log_path = Path(args.export_log)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    export_entries = json.loads(export_log_path.read_text(encoding="utf-8"))
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    overview_rows: list[dict[str, Any]] = []

    for entry in export_entries:
        route_number = str(entry["filename"]).replace(".gpx", "")
        route_dir = output_dir / route_number
        route_dir.mkdir(parents=True, exist_ok=True)
        gpx_path = input_gpx_dir / f"{route_number}.gpx"
        if not gpx_path.exists():
            continue

        points = load_track_points(gpx_path)
        geometry = compute_geometry_summary(points)
        source_meta = fetch_sixfoot_page(route_number, session)
        source_meta["route_number"] = route_number
        source_meta["route_id"] = entry["route_id"]
        source_meta["source_identifier"] = entry["source_identifier"]
        source_meta["source_platform"] = "六只脚"
        source_meta["source_platform_homepage"] = "https://www.foooooot.com/"
        source_meta["source_gpx_creator"] = "SixFoot - http://www.foooooot.com/"

        start_geo = reverse_geocode(session, geometry.start_wgs84["lat"], geometry.start_wgs84["lon"], args.nominatim_pause_sec)
        mid_geo = reverse_geocode(session, geometry.midpoint_wgs84["lat"], geometry.midpoint_wgs84["lon"], args.nominatim_pause_sec)
        end_geo = reverse_geocode(session, geometry.end_wgs84["lat"], geometry.end_wgs84["lon"], args.nominatim_pause_sec)

        metadata_payload = {
            **source_meta,
            "geometry_stats_excerpt": asdict(geometry),
            "map_context": {
                "start_reverse_geocode": start_geo,
                "midpoint_reverse_geocode": mid_geo,
                "end_reverse_geocode": end_geo,
            },
        }
        description_md = generated_description(route_number, geometry, source_meta, start_geo, mid_geo, end_geo)
        geojson_payload = build_geojson(route_number, points, geometry, source_meta)

        shutil.copy2(gpx_path, route_dir / f"{route_number}_geometry.gpx")
        write_json(route_dir / f"{route_number}_geometry.geojson", geojson_payload)
        write_json(route_dir / f"{route_number}_geometry_summary.json", asdict(geometry))
        write_json(route_dir / f"{route_number}_metadata.json", metadata_payload)
        (route_dir / f"{route_number}_description.md").write_text(description_md, encoding="utf-8")

        overview_rows.append(
            {
                "route_number": route_number,
                "title": source_meta.get("title"),
                "author": source_meta.get("author"),
                "activity_type": source_meta.get("activity_type"),
                "difficulty": source_meta.get("difficulty"),
                "length_km": geometry.length_km,
                "route_form": geometry.route_form,
                "official_start_admin": source_meta.get("official_start_admin"),
                "official_end_admin": source_meta.get("official_end_admin"),
                "source_page_url": source_meta.get("source_page_url"),
            }
        )

    write_json(output_dir / "routes_index.json", overview_rows)
    with (output_dir / "routes_overview.csv").open("w", encoding="utf-8", newline="") as fp:
        writer = csv.DictWriter(
            fp,
            fieldnames=[
                "route_number",
                "title",
                "author",
                "activity_type",
                "difficulty",
                "length_km",
                "route_form",
                "official_start_admin",
                "official_end_admin",
                "source_page_url",
            ],
        )
        writer.writeheader()
        writer.writerows(overview_rows)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

from __future__ import annotations

import argparse
import math
import xml.etree.ElementTree as ET
from pathlib import Path


KML_NS = "http://www.opengis.net/kml/2.2"
GX_NS = "http://www.google.com/kml/ext/2.2"
ET.register_namespace("", KML_NS)
ET.register_namespace("gx", GX_NS)


def parse_track_points(gpx_path: Path) -> list[tuple[float, float]]:
    root = ET.parse(gpx_path).getroot()
    ns = {"gpx": root.tag.split("}")[0].strip("{")}
    points: list[tuple[float, float]] = []
    for trkpt in root.findall(".//gpx:trkpt", ns):
        lat = float(trkpt.attrib["lat"])
        lon = float(trkpt.attrib["lon"])
        points.append((lon, lat))
    if len(points) < 2:
        raise RuntimeError(f"GPX has too few points: {gpx_path}")
    return points


def haversine_m(a: tuple[float, float], b: tuple[float, float]) -> float:
    lon1, lat1 = map(math.radians, a)
    lon2, lat2 = map(math.radians, b)
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 6371000.0 * 2 * math.asin(math.sqrt(h))


def sample_evenly(points: list[tuple[float, float]], sample_count: int) -> list[tuple[int, tuple[float, float]]]:
    cumulative = [0.0]
    for i in range(1, len(points)):
        cumulative.append(cumulative[-1] + haversine_m(points[i - 1], points[i]))
    total = cumulative[-1]
    if total <= 0:
        raise RuntimeError("Track length is zero")
    if sample_count <= 2:
        return [(0, points[0]), (len(points) - 1, points[-1])]

    targets = [total * i / (sample_count - 1) for i in range(sample_count)]
    out: list[tuple[int, tuple[float, float]]] = []
    cursor = 0
    for target in targets:
        while cursor + 1 < len(cumulative) and cumulative[cursor + 1] < target:
            cursor += 1
        out.append((cursor, points[cursor]))
    return out


def heading_deg(prev_pt: tuple[float, float], next_pt: tuple[float, float]) -> float:
    lon1, lat1 = map(math.radians, prev_pt)
    lon2, lat2 = map(math.radians, next_pt)
    dlon = lon2 - lon1
    x = math.sin(dlon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    bearing = math.degrees(math.atan2(x, y))
    return (bearing + 360.0) % 360.0


def build_kml(
    route_id: str,
    points: list[tuple[float, float]],
    sample_count: int,
    tilt: float,
    rng: float,
    altitude: float,
    start_duration_sec: float,
    step_duration_sec: float,
) -> ET.ElementTree:
    sampled = sample_evenly(points, sample_count)

    kml = ET.Element(f"{{{KML_NS}}}kml")
    document = ET.SubElement(kml, f"{{{KML_NS}}}Document")
    ET.SubElement(document, f"{{{KML_NS}}}name").text = f"{route_id}_google_earth_flythrough"
    ET.SubElement(document, f"{{{KML_NS}}}open").text = "1"

    hidden_style = ET.SubElement(document, f"{{{KML_NS}}}Style", {"id": "hidden-point"})
    icon_style = ET.SubElement(hidden_style, f"{{{KML_NS}}}IconStyle")
    ET.SubElement(icon_style, f"{{{KML_NS}}}scale").text = "0"
    label_style = ET.SubElement(hidden_style, f"{{{KML_NS}}}LabelStyle")
    ET.SubElement(label_style, f"{{{KML_NS}}}scale").text = "0"

    line_style = ET.SubElement(document, f"{{{KML_NS}}}Style", {"id": "route-line"})
    line_line_style = ET.SubElement(line_style, f"{{{KML_NS}}}LineStyle")
    ET.SubElement(line_line_style, f"{{{KML_NS}}}color").text = "ff00d7ff"
    ET.SubElement(line_line_style, f"{{{KML_NS}}}width").text = "5"

    tour_folder = ET.SubElement(document, f"{{{KML_NS}}}Folder")
    ET.SubElement(tour_folder, f"{{{KML_NS}}}name").text = route_id
    ET.SubElement(tour_folder, f"{{{KML_NS}}}open").text = "1"

    route_placemark = ET.SubElement(tour_folder, f"{{{KML_NS}}}Placemark")
    ET.SubElement(route_placemark, f"{{{KML_NS}}}name").text = f"{route_id}_track"
    ET.SubElement(route_placemark, f"{{{KML_NS}}}styleUrl").text = "#route-line"
    line_string = ET.SubElement(route_placemark, f"{{{KML_NS}}}LineString")
    ET.SubElement(line_string, f"{{{KML_NS}}}tessellate").text = "1"
    ET.SubElement(line_string, f"{{{KML_NS}}}altitudeMode").text = "clampToGround"
    ET.SubElement(line_string, f"{{{KML_NS}}}coordinates").text = " ".join(
        f"{lon:.8f},{lat:.8f},0" for lon, lat in points
    )

    for idx, (point_idx, point) in enumerate(sampled, start=1):
        prev_idx = max(0, point_idx - 4)
        next_idx = min(len(points) - 1, point_idx + 4)
        prev_pt = points[prev_idx]
        next_pt = points[next_idx]
        heading = heading_deg(prev_pt, next_pt)

        placemark = ET.SubElement(tour_folder, f"{{{KML_NS}}}Placemark")
        ET.SubElement(placemark, f"{{{KML_NS}}}name").text = f"{idx:03d}"
        ET.SubElement(placemark, f"{{{KML_NS}}}styleUrl").text = "#hidden-point"

        look_at = ET.SubElement(placemark, f"{{{KML_NS}}}LookAt")
        ET.SubElement(look_at, f"{{{KML_NS}}}longitude").text = f"{point[0]:.8f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}latitude").text = f"{point[1]:.8f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}altitude").text = f"{altitude:.1f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}heading").text = f"{heading:.2f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}tilt").text = f"{tilt:.1f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}range").text = f"{rng:.1f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}altitudeMode").text = "relativeToGround"

        point_node = ET.SubElement(placemark, f"{{{KML_NS}}}Point")
        ET.SubElement(point_node, f"{{{KML_NS}}}coordinates").text = f"{point[0]:.8f},{point[1]:.8f},0"

    tour = ET.SubElement(document, f"{{{GX_NS}}}Tour")
    ET.SubElement(tour, f"{{{KML_NS}}}name").text = f"{route_id}_tour"
    playlist = ET.SubElement(tour, f"{{{GX_NS}}}Playlist")

    for idx, (point_idx, point) in enumerate(sampled):
        prev_idx = max(0, point_idx - 4)
        next_idx = min(len(points) - 1, point_idx + 4)
        prev_pt = points[prev_idx]
        next_pt = points[next_idx]
        heading = heading_deg(prev_pt, next_pt)

        fly_to = ET.SubElement(playlist, f"{{{GX_NS}}}FlyTo")
        duration = start_duration_sec if idx == 0 else step_duration_sec
        ET.SubElement(fly_to, f"{{{GX_NS}}}duration").text = f"{duration:.2f}"
        ET.SubElement(fly_to, f"{{{GX_NS}}}flyToMode").text = "smooth" if idx else "bounce"

        look_at = ET.SubElement(fly_to, f"{{{KML_NS}}}LookAt")
        ET.SubElement(look_at, f"{{{KML_NS}}}longitude").text = f"{point[0]:.8f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}latitude").text = f"{point[1]:.8f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}altitude").text = f"{altitude:.1f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}heading").text = f"{heading:.2f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}tilt").text = f"{tilt:.1f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}range").text = f"{rng:.1f}"
        ET.SubElement(look_at, f"{{{KML_NS}}}altitudeMode").text = "relativeToGround"

    return ET.ElementTree(kml)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--gpx", required=True)
    parser.add_argument("--route-id", required=True)
    parser.add_argument("--out-kml", required=True)
    parser.add_argument("--sample-count", type=int, default=42)
    parser.add_argument("--tilt", type=float, default=78.0)
    parser.add_argument("--range-m", type=float, default=900.0)
    parser.add_argument("--altitude-m", type=float, default=120.0)
    parser.add_argument("--start-duration-sec", type=float, default=2.2)
    parser.add_argument("--step-duration-sec", type=float, default=0.7)
    args = parser.parse_args()

    gpx_path = Path(args.gpx)
    out_kml = Path(args.out_kml)
    out_kml.parent.mkdir(parents=True, exist_ok=True)

    points = parse_track_points(gpx_path)
    tree = build_kml(
        route_id=args.route_id,
        points=points,
        sample_count=args.sample_count,
        tilt=args.tilt,
        rng=args.range_m,
        altitude=args.altitude_m,
        start_duration_sec=args.start_duration_sec,
        step_duration_sec=args.step_duration_sec,
    )
    tree.write(out_kml, encoding="utf-8", xml_declaration=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

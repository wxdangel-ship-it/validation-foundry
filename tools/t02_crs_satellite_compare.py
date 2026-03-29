from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from qgis.core import (
    QgsApplication,
    QgsCoordinateReferenceSystem,
    QgsCoordinateTransform,
    QgsFeature,
    QgsGeometry,
    QgsLineString,
    QgsMapRendererParallelJob,
    QgsMapSettings,
    QgsMultiLineString,
    QgsPointXY,
    QgsProject,
    QgsRasterLayer,
    QgsRectangle,
    QgsSingleSymbolRenderer,
    QgsSymbol,
    QgsVectorLayer,
    QgsVectorLayerSimpleLabeling,
    QgsPalLayerSettings,
    QgsTextFormat,
    QgsDistanceArea,
)
from qgis.PyQt.QtCore import QSize, Qt
from qgis.PyQt.QtGui import QColor


GOOGLE_SATELLITE = (
    "type=xyz&url=https://mt1.google.com/vt/lyrs=s%26x={x}%26y={y}%26z={z}&zmin=0&zmax=20"
)
GAODE_SATELLITE = (
    "type=xyz&url=https://webst04.is.autonavi.com/appmaptile?style=6%26x={x}%26y={y}%26z={z}&zmin=0&zmax=18"
)


@dataclass
class Sample:
    route_id: str
    gpx_path: Path


def out_of_china(lon: float, lat: float) -> bool:
    return not (73.66 < lon < 135.05 and 3.86 < lat < 53.55)


def transform_lat(x: float, y: float) -> float:
    ret = (
        -100.0
        + 2.0 * x
        + 3.0 * y
        + 0.2 * y * y
        + 0.1 * x * y
        + 0.2 * math.sqrt(abs(x))
    )
    ret += (20.0 * math.sin(6.0 * x * math.pi) + 20.0 * math.sin(2.0 * x * math.pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(y * math.pi) + 40.0 * math.sin(y / 3.0 * math.pi)) * 2.0 / 3.0
    ret += (160.0 * math.sin(y / 12.0 * math.pi) + 320 * math.sin(y * math.pi / 30.0)) * 2.0 / 3.0
    return ret


def transform_lon(x: float, y: float) -> float:
    ret = (
        300.0
        + x
        + 2.0 * y
        + 0.1 * x * x
        + 0.1 * x * y
        + 0.1 * math.sqrt(abs(x))
    )
    ret += (20.0 * math.sin(6.0 * x * math.pi) + 20.0 * math.sin(2.0 * x * math.pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(x * math.pi) + 40.0 * math.sin(x / 3.0 * math.pi)) * 2.0 / 3.0
    ret += (150.0 * math.sin(x / 12.0 * math.pi) + 300.0 * math.sin(x / 30.0 * math.pi)) * 2.0 / 3.0
    return ret


def wgs84_to_gcj02(lon: float, lat: float) -> tuple[float, float]:
    if out_of_china(lon, lat):
        return lon, lat

    a = 6378245.0
    ee = 0.00669342162296594323
    dlat = transform_lat(lon - 105.0, lat - 35.0)
    dlon = transform_lon(lon - 105.0, lat - 35.0)
    radlat = lat / 180.0 * math.pi
    magic = math.sin(radlat)
    magic = 1 - ee * magic * magic
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * math.pi)
    dlon = (dlon * 180.0) / (a / sqrtmagic * math.cos(radlat) * math.pi)
    mg_lat = lat + dlat
    mg_lon = lon + dlon
    return mg_lon, mg_lat


def first_track_layer(gpx_path: Path) -> QgsVectorLayer:
    layer = QgsVectorLayer(f"{gpx_path}|layername=tracks", gpx_path.stem, "ogr")
    if not layer.isValid():
        raise RuntimeError(f"Invalid GPX layer: {gpx_path}")
    return layer


def clone_to_gcj_layer(source_layer: QgsVectorLayer, route_id: str) -> tuple[QgsVectorLayer, list[float]]:
    target = QgsVectorLayer("MultiLineString?crs=EPSG:4326", f"{route_id}_gcj02", "memory")
    provider = target.dataProvider()

    da = QgsDistanceArea()
    da.setSourceCrs(QgsCoordinateReferenceSystem("EPSG:4326"), QgsProject.instance().transformContext())
    da.setEllipsoid("WGS84")
    shifts: list[float] = []

    for feature in source_layer.getFeatures():
        geom = feature.geometry()
        if geom.isMultipart():
            multi = geom.constGet()
            out_multi = QgsMultiLineString()
            for part in multi:
                out_multi.addGeometry(_transform_line(part, da, shifts))
            out_geom = QgsGeometry(out_multi)
        else:
            line = geom.constGet()
            out_geom = QgsGeometry(_transform_line(line, da, shifts))

        new_feature = QgsFeature(target.fields())
        new_feature.setGeometry(out_geom)
        provider.addFeature(new_feature)

    target.updateExtents()
    return target, shifts


def _transform_line(line: QgsLineString, da: QgsDistanceArea, shifts: list[float]) -> QgsLineString:
    points = []
    for vertex in line.vertices():
        lon, lat = vertex.x(), vertex.y()
        gcj_lon, gcj_lat = wgs84_to_gcj02(lon, lat)
        points.append(QgsPointXY(gcj_lon, gcj_lat))
        shifts.append(da.measureLine(QgsPointXY(lon, lat), QgsPointXY(gcj_lon, gcj_lat)))
    return QgsLineString(points)


def line_midpoint(layer: QgsVectorLayer) -> QgsPointXY:
    feature = next(layer.getFeatures())
    geom = feature.geometry()
    pt = geom.interpolate(geom.length() / 2.0).asPoint()
    return QgsPointXY(pt.x(), pt.y())


def projected_paths(
    layer: QgsVectorLayer,
    extent: QgsRectangle | None = None,
    image_size: tuple[int, int] | None = None,
) -> list[list[tuple[float, float]]]:
    src = QgsCoordinateReferenceSystem("EPSG:4326")
    dst = QgsCoordinateReferenceSystem("EPSG:3857")
    transform = QgsCoordinateTransform(src, dst, QgsProject.instance())
    out: list[list[tuple[float, float]]] = []

    for feature in layer.getFeatures():
        geom = feature.geometry()
        if geom.isMultipart():
            multi = geom.constGet()
            lines = [part for part in multi]
        else:
            lines = [geom.constGet()]

        for line in lines:
            points: list[tuple[float, float]] = []
            for vertex in line.vertices():
                pt = transform.transform(QgsPointXY(vertex.x(), vertex.y()))
                if extent is not None and image_size is not None:
                    x = ((pt.x() - extent.xMinimum()) / extent.width()) * (image_size[0] - 1)
                    y = ((extent.yMaximum() - pt.y()) / extent.height()) * (image_size[1] - 1)
                    points.append((x, y))
                else:
                    points.append((pt.x(), pt.y()))
            if len(points) >= 2:
                out.append(points)

    return out


def local_extent(layer: QgsVectorLayer, min_margin_m: float = 700.0, min_span_m: float = 1800.0) -> QgsRectangle:
    paths = projected_paths(layer)
    xs = [x for path in paths for x, _ in path]
    ys = [y for path in paths for _, y in path]
    if not xs or not ys:
        raise RuntimeError(f"Cannot compute extent for layer {layer.name()}")

    min_x = min(xs)
    max_x = max(xs)
    min_y = min(ys)
    max_y = max(ys)
    cx = (min_x + max_x) / 2.0
    cy = (min_y + max_y) / 2.0
    span = max(max_x - min_x, max_y - min_y, min_span_m)
    half_size = span / 2.0 + min_margin_m
    return QgsRectangle(cx - half_size, cy - half_size, cx + half_size, cy + half_size)


def style_line(layer: QgsVectorLayer, color: str, width_mm: float) -> None:
    symbol = QgsSymbol.defaultSymbol(layer.geometryType())
    symbol.setColor(QColor(color))
    symbol.setWidth(width_mm)
    layer.setRenderer(QgsSingleSymbolRenderer(symbol))


def add_label(layer: QgsVectorLayer, text: str) -> None:
    settings = QgsPalLayerSettings()
    settings.fieldName = f"'{text}'"
    settings.isExpression = True
    fmt = QgsTextFormat()
    fmt.setColor(QColor("white"))
    fmt.setSize(11)
    settings.setFormat(fmt)
    settings.enabled = True
    layer.setLabelsEnabled(True)
    layer.setLabeling(QgsVectorLayerSimpleLabeling(settings))


def xyz_layer(url: str, name: str) -> QgsRasterLayer:
    layer = QgsRasterLayer(url, name, "wms")
    if not layer.isValid():
        raise RuntimeError(f"Invalid raster layer: {name}")
    return layer


def render_map(
    layers: list,
    extent: QgsRectangle,
    out_path: Path,
    title: str,
    overlay_layer: QgsVectorLayer | None = None,
    overlay_color: tuple[int, int, int, int] = (255, 45, 85, 255),
) -> None:
    settings = QgsMapSettings()
    settings.setBackgroundColor(QColor("black"))
    settings.setDestinationCrs(QgsCoordinateReferenceSystem("EPSG:3857"))
    settings.setLayers(layers)
    settings.setExtent(extent)
    settings.setOutputSize(QSize(1200, 1200))

    job = QgsMapRendererParallelJob(settings)
    job.start()
    job.waitForFinished()
    image = job.renderedImage()
    image.save(str(out_path), "PNG")
    if overlay_layer is not None:
        draw_track_overlay(out_path, overlay_layer, extent, overlay_color)
    add_title(out_path, title)


def draw_track_overlay(
    image_path: Path,
    layer: QgsVectorLayer,
    extent: QgsRectangle,
    color: tuple[int, int, int, int],
) -> None:
    image = Image.open(image_path).convert("RGBA")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    paths = projected_paths(layer, extent=extent, image_size=image.size)
    for path in paths:
        # Triple stroke keeps the route legible against mixed satellite textures.
        draw.line(path, fill=(0, 0, 0, 220), width=18, joint="curve")
        draw.line(path, fill=(255, 255, 255, 220), width=12, joint="curve")
        draw.line(path, fill=color, width=7, joint="curve")

    Image.alpha_composite(image, overlay).save(image_path)


def add_title(image_path: Path, title: str) -> None:
    image = Image.open(image_path).convert("RGBA")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    font = ImageFont.load_default()
    draw.rectangle((20, 20, image.size[0] - 20, 70), fill=(0, 0, 0, 160))
    draw.text((40, 38), title, fill=(255, 255, 255, 255), font=font)
    merged = Image.alpha_composite(image, overlay)
    merged.save(image_path)


def stitch_triptych(images: list[Path], out_path: Path) -> None:
    opened = [Image.open(path).convert("RGB") for path in images]
    width = sum(img.width for img in opened)
    height = max(img.height for img in opened)
    canvas = Image.new("RGB", (width, height), color=(20, 20, 20))
    x = 0
    for img in opened:
        canvas.paste(img, (x, 0))
        x += img.width
    canvas.save(out_path)


def quantiles(values: list[float]) -> dict[str, float]:
    sorted_values = sorted(values)
    if not sorted_values:
        return {"min": 0.0, "median": 0.0, "p95": 0.0, "max": 0.0}
    n = len(sorted_values)
    def q(p: float) -> float:
        idx = min(n - 1, max(0, int(round((n - 1) * p))))
        return sorted_values[idx]
    return {
        "min": sorted_values[0],
        "median": q(0.5),
        "p95": q(0.95),
        "max": sorted_values[-1],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--gpx-dir", required=True)
    parser.add_argument("--route-ids", nargs="+", required=True)
    parser.add_argument("--out-dir", required=True)
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    qgs = QgsApplication([], False)
    qgs.initQgis()

    try:
        google = xyz_layer(GOOGLE_SATELLITE, "google_satellite")
        gaode = xyz_layer(GAODE_SATELLITE, "gaode_satellite")
        project = QgsProject.instance()
        project.addMapLayer(google, False)
        project.addMapLayer(gaode, False)

        report: dict[str, object] = {
            "tool": "t02_crs_satellite_compare",
            "project_crs": "EPSG:3857",
            "gpx_declared_crs": "EPSG:4326",
            "samples": [],
        }

        for route_id in args.route_ids:
            gpx_path = Path(args.gpx_dir) / f"{route_id.split('_')[-1]}.gpx"
            source = first_track_layer(gpx_path)
            gcj_layer, shifts = clone_to_gcj_layer(source, route_id)
            project.addMapLayer(source, False)
            project.addMapLayer(gcj_layer, False)

            style_line(source, "#ff2d55", 1.2)
            style_line(gcj_layer, "#00e5ff", 1.2)

            extent = local_extent(source)
            route_dir = out_dir / route_id
            route_dir.mkdir(parents=True, exist_ok=True)

            google_raw = route_dir / "google_raw_wgs84.png"
            gaode_raw = route_dir / "gaode_raw_wgs84.png"
            gaode_gcj = route_dir / "gaode_gcj02_shifted.png"
            triptych = route_dir / "comparison_triptych.png"

            render_map(
                [google],
                extent,
                google_raw,
                f"{route_id} | Google Satellite + raw GPX (WGS84)",
                overlay_layer=source,
                overlay_color=(255, 45, 85, 255),
            )
            render_map(
                [gaode],
                extent,
                gaode_raw,
                f"{route_id} | Gaode Satellite + raw GPX (WGS84)",
                overlay_layer=source,
                overlay_color=(255, 45, 85, 255),
            )
            render_map(
                [gaode],
                extent,
                gaode_gcj,
                f"{route_id} | Gaode Satellite + shifted GPX (GCJ-02)",
                overlay_layer=gcj_layer,
                overlay_color=(0, 229, 255, 255),
            )
            stitch_triptych([google_raw, gaode_raw, gaode_gcj], triptych)

            stats = quantiles(shifts)
            report["samples"].append(
                {
                    "route_id": route_id,
                    "gpx_path": str(gpx_path.resolve()),
                    "shift_stats_m": stats,
                    "images": {
                        "google_raw_wgs84": str(google_raw.resolve()),
                        "gaode_raw_wgs84": str(gaode_raw.resolve()),
                        "gaode_gcj02_shifted": str(gaode_gcj.resolve()),
                        "comparison_triptych": str(triptych.resolve()),
                    },
                    "assessment": {
                        "gpx_native_crs": "EPSG:4326",
                        "expected_best_match": [
                            "Google Satellite + raw GPX (WGS84)",
                            "Gaode Satellite + shifted GPX (GCJ-02)",
                        ],
                        "expected_mismatch": "Gaode Satellite + raw GPX (WGS84)",
                    },
                }
            )

        report_path = out_dir / "report.json"
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"report": str(report_path.resolve())}, ensure_ascii=False))
        return 0
    finally:
        qgs.exitQgis()


if __name__ == "__main__":
    raise SystemExit(main())

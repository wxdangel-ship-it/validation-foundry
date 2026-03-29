import { useEffect, useMemo, useRef } from "react";
import maplibregl, { type LngLatBoundsLike, type Map as MapLibreMap } from "maplibre-gl";
import * as Cesium from "cesium";
import { Badge } from "./ui/badge";

export type MapPoint = {
  id: string;
  name: string;
  kind: "start" | "end" | "safety" | "detour" | "return" | "anchor" | "current" | "manual";
  lng: number;
  lat: number;
  highlighted?: boolean;
};

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Esri World Imagery",
      maxzoom: 18,
    },
  },
  layers: [
    {
      id: "satellite",
      type: "raster",
      source: "satellite",
    },
  ],
} as const;

const EMPTY_COLLECTION = {
  type: "FeatureCollection",
  features: [],
} as const;

function focusBounds(point: MapPoint) {
  const lngDelta = 0.005;
  const latDelta = 0.0038;
  return [
    [point.lng - lngDelta, point.lat - latDelta],
    [point.lng + lngDelta, point.lat + latDelta],
  ] satisfies LngLatBoundsLike;
}

function computeBounds(
  referenceLine: [number, number][],
  actualLine: [number, number][],
  highlightLine: [number, number][],
  points: MapPoint[],
  polygon: [number, number][] | undefined,
  focusMode: "all" | "start" | "current",
) {
  if (focusMode === "start") {
    const startPoint = points.find((point) => point.kind === "start") ?? points[0];
    if (startPoint) {
      return focusBounds(startPoint);
    }
  }

  if (focusMode === "current") {
    const currentPoint = points.find((point) => point.kind === "current") ?? points[0];
    if (currentPoint) {
      return focusBounds(currentPoint);
    }
  }

  const coords = [
    ...referenceLine,
    ...actualLine,
    ...highlightLine,
    ...points.map((point) => [point.lng, point.lat] as [number, number]),
  ];
  if (polygon) {
    coords.push(...polygon);
  }
  if (!coords.length) {
    return [
      [120.0, 30.0],
      [121.0, 31.0],
    ] satisfies LngLatBoundsLike;
  }
  const lngs = coords.map((coord) => coord[0]);
  const lats = coords.map((coord) => coord[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ] satisfies LngLatBoundsLike;
}

function pointFeatures(points: MapPoint[]) {
  return {
    type: "FeatureCollection" as const,
    features: points.map((point) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [point.lng, point.lat],
      },
      properties: {
        label: point.name,
        kind: point.kind,
        highlighted: point.highlighted ? 1 : 0,
      },
    })),
  };
}

function lineCollection(line: [number, number][]) {
  if (line.length < 2) {
    return EMPTY_COLLECTION;
  }
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: line,
        },
        properties: {},
      },
    ],
  };
}

function polygonFeature(polygon: [number, number][]) {
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Polygon" as const,
          coordinates: [[...polygon, polygon[0]]],
        },
        properties: {},
      },
    ],
  };
}

function headingFeature(points: MapPoint[], bearing: number) {
  const currentPoint = points.find((point) => point.kind === "current");
  if (!currentPoint) {
    return EMPTY_COLLECTION;
  }
  const length = 0.0011;
  const radians = (bearing * Math.PI) / 180;
  const headingPoint: [number, number] = [
    currentPoint.lng + Math.sin(radians) * length,
    currentPoint.lat + Math.cos(radians) * length,
  ];
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [currentPoint.lng, currentPoint.lat],
            headingPoint,
          ],
        },
        properties: {},
      },
    ],
  };
}

function updateGeoJsonSource(map: MapLibreMap, id: string, data: unknown) {
  const source = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
  if (source) {
    source.setData(data as never);
  }
}

export function MapStage({
  view,
  routeLine,
  referenceLine,
  actualLine = [],
  highlightLine = [],
  points,
  polygon,
  focusMode = "all",
  bearing = 0,
}: {
  view: "map_2d" | "map_3d";
  routeLine?: [number, number][];
  referenceLine?: [number, number][];
  actualLine?: [number, number][];
  highlightLine?: [number, number][];
  points: MapPoint[];
  polygon?: [number, number][];
  focusMode?: "all" | "start" | "current";
  bearing?: number;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const resolvedReferenceLine = referenceLine ?? routeLine ?? [];
  const bounds = useMemo(
    () => computeBounds(resolvedReferenceLine, actualLine, highlightLine, points, polygon, focusMode),
    [actualLine, focusMode, highlightLine, points, polygon, resolvedReferenceLine],
  );

  function markReady(value: boolean) {
    if (rootRef.current) {
      rootRef.current.dataset.mapReady = value ? "true" : "false";
    }
  }

  useEffect(() => {
    if (view === "map_3d") {
      markReady(true);
      return;
    }
    markReady(false);
  }, [view]);

  useEffect(() => {
    if (view !== "map_2d" || !containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_STYLE,
      attributionControl: false,
      cooperativeGestures: true,
      pitch: 0,
      bearing,
      fadeDuration: 0,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("reference", { type: "geojson", data: lineCollection(resolvedReferenceLine) });
      map.addSource("actual", { type: "geojson", data: lineCollection(actualLine) });
      map.addSource("highlight", { type: "geojson", data: lineCollection(highlightLine) });
      map.addSource("heading", { type: "geojson", data: headingFeature(points, bearing) });
      map.addSource("points", { type: "geojson", data: pointFeatures(points) });
      map.addSource("range", {
        type: "geojson",
        data: polygon ? polygonFeature(polygon) : EMPTY_COLLECTION,
      });

      map.addLayer({
        id: "range-fill",
        type: "fill",
        source: "range",
        paint: {
          "fill-color": "#7ac9d7",
          "fill-opacity": 0.15,
        },
      });
      map.addLayer({
        id: "range-outline",
        type: "line",
        source: "range",
        paint: {
          "line-color": "#a8e5ef",
          "line-width": 2,
          "line-opacity": 0.85,
        },
      });
      map.addLayer({
        id: "reference-line-shadow",
        type: "line",
        source: "reference",
        paint: {
          "line-color": "#081218",
          "line-width": 10,
          "line-opacity": 0.6,
        },
      });
      map.addLayer({
        id: "reference-line",
        type: "line",
        source: "reference",
        paint: {
          "line-color": "#ff995e",
          "line-width": 3.5,
          "line-opacity": 0.95,
          "line-dasharray": [1.4, 1.2],
        },
      });
      map.addLayer({
        id: "actual-line-shadow",
        type: "line",
        source: "actual",
        paint: {
          "line-color": "#081218",
          "line-width": 8,
          "line-opacity": 0.65,
        },
      });
      map.addLayer({
        id: "actual-line",
        type: "line",
        source: "actual",
        paint: {
          "line-color": "#8be0dd",
          "line-width": 4.5,
          "line-opacity": 0.96,
        },
      });
      map.addLayer({
        id: "highlight-line",
        type: "line",
        source: "highlight",
        paint: {
          "line-color": "#f7d57d",
          "line-width": 6,
          "line-opacity": 1,
        },
      });
      map.addLayer({
        id: "heading-line",
        type: "line",
        source: "heading",
        paint: {
          "line-color": "#ffffff",
          "line-width": 2,
          "line-opacity": 0.95,
        },
      });
      map.addLayer({
        id: "points-core",
        type: "circle",
        source: "points",
        paint: {
          "circle-color": [
            "match",
            ["get", "kind"],
            "current",
            "#9ad08a",
            "start",
            "#f9efdb",
            "end",
            "#ff995e",
            "safety",
            "#9ddbe3",
            "return",
            "#f4bf92",
            "detour",
            "#efb09b",
            "manual",
            "#dcb9ff",
            "#e4ece7",
          ],
          "circle-stroke-color": "#081218",
          "circle-stroke-width": 2,
          "circle-radius": [
            "case",
            ["==", ["get", "highlighted"], 1],
            12,
            ["==", ["get", "kind"], "current"],
            8,
            ["==", ["get", "kind"], "manual"],
            7,
            6,
          ],
        },
      });

      map.fitBounds(bounds, { padding: 72, duration: 0 });
      if (bearing !== 0) {
        map.rotateTo(bearing, { duration: 0 });
      }
      map.once("idle", () => markReady(true));
    });

    return () => {
      markReady(false);
      map.remove();
      mapRef.current = null;
    };
  }, [actualLine, bearing, bounds, highlightLine, points, polygon, resolvedReferenceLine, view]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || view !== "map_2d" || !map.isStyleLoaded()) {
      return;
    }

    markReady(false);
    updateGeoJsonSource(map, "reference", lineCollection(resolvedReferenceLine));
    updateGeoJsonSource(map, "actual", lineCollection(actualLine));
    updateGeoJsonSource(map, "highlight", lineCollection(highlightLine));
    updateGeoJsonSource(map, "heading", headingFeature(points, bearing));
    updateGeoJsonSource(map, "points", pointFeatures(points));
    updateGeoJsonSource(map, "range", polygon ? polygonFeature(polygon) : EMPTY_COLLECTION);
    map.fitBounds(bounds, { padding: 72, duration: 300 });
    map.rotateTo(bearing, { duration: 300 });
    map.once("idle", () => markReady(true));
  }, [actualLine, bearing, bounds, highlightLine, points, polygon, resolvedReferenceLine, view]);

  if (view === "map_3d") {
    const center = points.find((point) => point.kind === "current") ?? points[0] ?? { lng: 121.03, lat: 31.43 };
    const camera = Cesium.Cartesian3.fromDegrees(center.lng, center.lat, 2400);

    return (
      <div
        ref={rootRef}
        data-map-ready="true"
        className="relative h-full overflow-hidden rounded-[30px] bg-[#081218]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,153,94,0.26),transparent_24%),radial-gradient(circle_at_78%_20%,rgba(122,201,215,0.18),transparent_24%),linear-gradient(180deg,#071218_0%,#0d1720_52%,#081218_100%)]" />
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute left-5 top-5 z-10">
          <Badge className="bg-[#10232d]/88 text-[#d4ebf3]">3D 视角占位</Badge>
        </div>
        <div className="absolute bottom-5 left-5 z-10 rounded-[20px] border border-white/10 bg-[#081218]/75 px-4 py-3 text-sm text-steel backdrop-blur">
          参考线、已走轨迹与高亮路段在 3D 态继续保留，但本轮仅展示空间感与相机高度。
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-[28px] border border-white/10 bg-[#091218]/72 px-6 py-5 text-center backdrop-blur">
            <div className="text-sm font-semibold text-white">Cesium 3D 预览</div>
            <div className="mt-2 text-xs tracking-[0.16em] text-steel">
              {camera.z.toFixed(0)}m CAMERA
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      data-map-ready="false"
      className="relative h-full overflow-hidden rounded-[30px] bg-[#081218]"
    >
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}

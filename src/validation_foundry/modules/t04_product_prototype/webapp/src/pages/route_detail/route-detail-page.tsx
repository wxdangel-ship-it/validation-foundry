import type React from "react";
import { useMemo, useState } from "react";
import { Compass, Crosshair, Download, Layers3, RotateCcw, Trash2 } from "lucide-react";
import type { MapPoint } from "../../components/map-stage";
import { MapStage } from "../../components/map-stage";
import {
  CompactStatusRow,
  DualCtaFooter,
  FloatingMapStatus,
  SectionDivider,
  TopBackButton,
  TwoPanePrototype,
} from "../../components/prototype-frame";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import type { RouteScenario } from "../../mocks/sample-data";
import type { PrototypeSnapshot } from "../../state/prototype-machine";

export function RouteDetailPage({
  scenario,
  snapshot,
  downloadState,
  mapView,
  onToggleMapView,
  onDownload,
  onDeleteDownload,
  onGoMap,
  onBack,
  onEnterExplore,
  onSetStartPoint,
  onHighlightPoint,
  points,
}: {
  scenario: RouteScenario;
  snapshot: PrototypeSnapshot;
  downloadState: "not_downloaded" | "downloading" | "downloaded";
  mapView: "map_2d" | "map_3d";
  onToggleMapView: () => void;
  onDownload: () => void;
  onDeleteDownload: () => void;
  onGoMap: () => void;
  onBack: () => void;
  onEnterExplore: () => void;
  onSetStartPoint: () => void;
  onHighlightPoint: (pointId: string | null) => void;
  points: MapPoint[];
}) {
  const isDownloaded = downloadState === "downloaded";
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [focusMode, setFocusMode] = useState<"all" | "current">("all");
  const [compassMode, setCompassMode] = useState<"north" | "angled">("north");
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [layers, setLayers] = useState({
    route: true,
    endpoints: true,
    safety: true,
    anchor: true,
  });
  const downloadBadgeLabel =
    downloadState === "not_downloaded"
      ? "未下载"
      : downloadState === "downloading"
        ? "下载中"
        : "下载完成";
  const visiblePoints = useMemo(
    () =>
      points.filter((point) => {
        if (point.kind === "current") {
          return true;
        }
        if ((point.kind === "start" || point.kind === "end") && layers.endpoints) {
          return true;
        }
        if ((point.kind === "safety" || point.kind === "return" || point.kind === "detour") && layers.safety) {
          return true;
        }
        if (point.kind === "anchor" && layers.anchor) {
          return true;
        }
        return false;
      }),
    [layers.anchor, layers.endpoints, layers.safety, points],
  );
  const visibleRouteLine = layers.route ? scenario.routeLine : [];
  const layerSummary = [
    layers.route ? "参考路线" : null,
    layers.endpoints ? "起终点" : null,
    layers.safety ? "安全 / 回撤" : null,
    layers.anchor ? "关键锚点" : null,
  ].filter(Boolean) as string[];

  return (
    <TwoPanePrototype
      header={
        <div data-page-id="route-detail">
          <TopBackButton label="返回" className="mb-4" onClick={onBack} />
          <h1 className="min-w-0 overflow-hidden text-[28px] font-semibold leading-tight tracking-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {scenario.routeName}
          </h1>
        </div>
      }
      pageLabel="越野路线详情"
      title={scenario.routeName}
      weakActionLabel="没有合适路线？进入自由探索模式"
      onWeakAction={onEnterExplore}
      left={
        <>
          <Card>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <MetricBlock label="长度" value={scenario.distanceKm} />
                <MetricBlock label="预计时间" value={scenario.etaLabel} />
                <MetricBlock label="难度" value={scenario.difficulty} />
                <MetricBlock label="地形" value="平原环线" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <CompactStatusRow label="地形 / 玩法" value={scenario.terrainSummary} />
              <CompactStatusRow
                label="模式语义"
                value={scenario.mode === "platform" ? "平台整理路线" : "导入后的自定义参考路线"}
              />
              <SectionDivider>
                {detailExpanded ? scenario.detailSummaryLong : scenario.detailSummaryShort}
              </SectionDivider>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="px-0 text-sand hover:bg-transparent"
                onClick={() => setDetailExpanded((current) => !current)}
              >
                {detailExpanded ? "收起详细说明" : "展开详细说明"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <CompactStatusRow label="推荐车型" value={scenario.recommendedVehicle} />
              <CompactStatusRow label="结伴建议" value={scenario.buddyAdvice} />
              <CompactStatusRow label="适用前提" value={scenario.prerequisites} />
              <CompactStatusRow label="不建议条件" value={scenario.avoidWhen} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <div className="text-2xl font-semibold text-white">{snapshot.context.startPointName}</div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={onSetStartPoint}>
                  用地图改起点
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onHighlightPoint(points[0]?.id ?? null)}
                >
                  高亮起点
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white">离线包</div>
                <Badge className="bg-white/12">{downloadBadgeLabel}</Badge>
              </div>
              <SectionDivider>
                {isDownloaded ? "离线包已准备完成。" : "离线包完成后即可导航至起点。"}
              </SectionDivider>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" size="sm" onClick={onDownload} disabled={downloadState !== "not_downloaded"}>
                  <Download className="mr-2 h-4 w-4" />
                  一键下载
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={onDeleteDownload}
                  disabled={downloadState === "not_downloaded"}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除离线包
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      }
      footer={
        <DualCtaFooter
          primaryLabel="导航至起点"
          secondaryLabel="进入越野地图页"
          onPrimary={onGoMap}
          onSecondary={onGoMap}
          primaryDisabled={!isDownloaded}
        />
      }
      right={
        <div className="relative h-full">
          <div className="absolute left-5 top-5 z-20">
            <Badge className="bg-white/10 text-white">{scenario.modeLabel}</Badge>
          </div>
          <div className="absolute right-5 top-5 z-20 flex flex-col gap-2">
            <MapSideButton
              icon={<span className="text-[11px] font-semibold">2D/3D</span>}
              label={mapView === "map_2d" ? "切换 3D" : "切换 2D"}
              active={mapView === "map_3d"}
              onClick={onToggleMapView}
            />
            <MapSideButton
              icon={<Crosshair className="h-4 w-4" />}
              label="定位"
              active={focusMode === "current"}
              onClick={() => setFocusMode("current")}
            />
            <MapSideButton
              icon={<RotateCcw className="h-4 w-4" />}
              label="恢复路线"
              active={focusMode === "all"}
              onClick={() => setFocusMode("all")}
            />
            <MapSideButton
              icon={<Compass className="h-4 w-4" />}
              label="指北针"
              active={compassMode === "north"}
              onClick={() => setCompassMode((current) => (current === "north" ? "angled" : "north"))}
            />
            <MapSideButton
              icon={<Layers3 className="h-4 w-4" />}
              label="图层"
              active={layerPanelOpen}
              onClick={() => setLayerPanelOpen((current) => !current)}
            />
          </div>
          {layerPanelOpen ? (
            <div className="absolute right-[120px] top-[170px] z-20 w-[220px] rounded-[24px] border border-white/10 bg-[#081218]/90 p-4 backdrop-blur">
              <div className="text-sm font-semibold text-white">关键图层</div>
              <div className="mt-3 space-y-2">
                <LayerToggle
                  label="参考路线"
                  active={layers.route}
                  onClick={() => setLayers((current) => ({ ...current, route: !current.route }))}
                />
                <LayerToggle
                  label="起终点"
                  active={layers.endpoints}
                  onClick={() => setLayers((current) => ({ ...current, endpoints: !current.endpoints }))}
                />
                <LayerToggle
                  label="安全 / 回撤"
                  active={layers.safety}
                  onClick={() => setLayers((current) => ({ ...current, safety: !current.safety }))}
                />
                <LayerToggle
                  label="关键锚点"
                  active={layers.anchor}
                  onClick={() => setLayers((current) => ({ ...current, anchor: !current.anchor }))}
                />
              </div>
            </div>
          ) : null}
          <div className="absolute bottom-5 right-5 z-20 w-[240px] rounded-[22px] border border-white/10 bg-[#081218]/84 px-4 py-3 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-steel">地图视图</div>
            <div className="mt-2 text-sm font-medium text-white">{layerSummary.join(" · ") || "仅保留当前位置"}</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-steel">
              <div>关键点 {visiblePoints.length} 个</div>
              <div className="text-right">{focusMode === "all" ? "全路线" : "当前位置聚焦"}</div>
            </div>
          </div>
          <FloatingMapStatus>起点：{snapshot.context.startPointName}</FloatingMapStatus>
          <MapStage
            view={mapView}
            routeLine={visibleRouteLine}
            points={visiblePoints}
            focusMode={focusMode}
            bearing={compassMode === "north" ? 0 : -18}
          />
        </div>
      }
    />
  );
}

function MetricBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 p-3.5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-steel">{label}</div>
      <div className="mt-1.5 text-[26px] font-semibold leading-none text-white">{value}</div>
    </div>
  );
}

function MapSideButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "ghost"}
      className="h-10 min-w-[104px] justify-start rounded-[18px] border border-white/10 bg-[#081218]/88 px-3 text-white backdrop-blur"
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Button>
  );
}

function LayerToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-white/5 px-3 py-3 text-sm text-white transition hover:bg-white/10"
      onClick={onClick}
    >
      <span>{label}</span>
      <Badge className={active ? "bg-[#153341] text-[#d4ebf3]" : "bg-white/8 text-steel"}>
        {active ? "显示" : "隐藏"}
      </Badge>
    </button>
  );
}

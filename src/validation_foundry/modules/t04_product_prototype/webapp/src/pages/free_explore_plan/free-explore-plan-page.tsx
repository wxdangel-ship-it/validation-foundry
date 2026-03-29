import type React from "react";
import { useState } from "react";
import { AlertTriangle, Compass, Download, Flag, Layers3, RotateCcw, Trash2 } from "lucide-react";
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
import type { ExploreScenario } from "../../mocks/sample-data";
import type { PrototypeSnapshot } from "../../state/prototype-machine";

export function FreeExplorePlanPage({
  scenario,
  snapshot,
  downloadState,
  mapView,
  isExploreReady,
  onToggleMapView,
  onDownload,
  onDeleteDownload,
  onGoMap,
  onBack,
  onSetStartPoint,
  onAddSafetyAnchor,
  onConfirmRange,
  points,
}: {
  scenario: ExploreScenario;
  snapshot: PrototypeSnapshot;
  downloadState: "not_downloaded" | "downloading" | "downloaded";
  mapView: "map_2d" | "map_3d";
  isExploreReady: boolean;
  onToggleMapView: () => void;
  onDownload: () => void;
  onDeleteDownload: () => void;
  onGoMap: () => void;
  onBack: () => void;
  onSetStartPoint: () => void;
  onAddSafetyAnchor: () => void;
  onConfirmRange: () => void;
  points: MapPoint[];
}) {
  const resetView = () => undefined;
  const [toolPanelOpen, setToolPanelOpen] = useState(false);
  const [compassMode, setCompassMode] = useState<"north" | "angled">("north");
  const boundaryReady =
    snapshot.context.routeStartConfirmed &&
    snapshot.context.safetyAnchorCount > 0 &&
    snapshot.context.rangeConfirmed &&
    !snapshot.context.rangeLimitExceeded;
  const downloadBadgeLabel =
    downloadState === "not_downloaded"
      ? "未下载"
      : downloadState === "downloading"
        ? "下载中"
        : "下载完成";

  return (
    <TwoPanePrototype
      header={
        <div data-page-id="free-explore-plan">
          <TopBackButton label="返回" className="mb-4" onClick={onBack} />
          <h1 className="min-w-0 overflow-hidden text-[28px] font-semibold leading-tight tracking-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {scenario.exploreAreaName}
          </h1>
        </div>
      }
      pageLabel="自由探索计划"
      title={scenario.exploreAreaName}
      left={
        <>
          <Card>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <MetricBlock label="当前状态" value={scenario.currentStatus} />
                <MetricBlock label="安全锚点" value={`${snapshot.context.safetyAnchorCount} 个`} />
                <MetricBlock label="探索范围" value={snapshot.context.rangeConfirmed ? "已确认" : "待确认"} />
                <MetricBlock label="离线包" value={downloadBadgeLabel} />
              </div>
              <SectionDivider>{scenario.summary}</SectionDivider>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <CompactStatusRow label="当前状态" value={scenario.currentStatus} />
              <CompactStatusRow label="风险提示" value={scenario.riskHint} />
              <CompactStatusRow label="使用方式" value={scenario.instructions} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <CompactStatusRow label="当前起点" value={snapshot.context.startPointName} />
              <CompactStatusRow label="已设置安全锚点" value={`${snapshot.context.safetyAnchorCount} 个`} />
              <CompactStatusRow label="当前探索范围" value={snapshot.context.rangeConfirmed ? scenario.rangeLabel : "待确认"} />
              <CompactStatusRow label="最大范围限制" value={scenario.maxRangeLabel} />
              <SectionDivider>起点、安全锚点和探索范围都通过右侧地图设置。</SectionDivider>
              {snapshot.context.rangeLimitExceeded ? (
                <div className="flex items-start gap-3 rounded-[22px] border border-[#6b413d] bg-[#2f1817] px-4 py-3 text-sm text-[#ffc0b2]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  当前探索范围超出限制，需收回到建议包络后才能开始探索。
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white">离线包</div>
                <Badge className="bg-white/12">{downloadBadgeLabel}</Badge>
              </div>
              <SectionDivider>
                {boundaryReady ? "探索边界已确认，可准备离线包。" : "先在右侧地图中确认起点、锚点和探索范围。"}
              </SectionDivider>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" size="sm" onClick={onDownload} disabled={!boundaryReady || downloadState !== "not_downloaded"}>
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
          primaryDisabled={!isExploreReady}
        />
      }
      right={
        <div className="relative h-full">
          <div className="absolute right-5 top-5 z-20 flex flex-col gap-2">
            <MapToolButton
              icon={<span className="text-[11px] font-semibold">2D/3D</span>}
              label={mapView === "map_2d" ? "切换 3D" : "切换 2D"}
              active={mapView === "map_3d"}
              onClick={onToggleMapView}
            />
            <MapToolButton
              icon={<Flag className="h-4 w-4" />}
              label="设起点"
              onClick={onSetStartPoint}
            />
            <MapToolButton
              icon={<Layers3 className="h-4 w-4" />}
              label="边界工具"
              active={toolPanelOpen}
              onClick={() => setToolPanelOpen((current) => !current)}
            />
            <MapToolButton
              icon={<RotateCcw className="h-4 w-4" />}
              label="恢复视图"
              onClick={resetView}
            />
            <MapToolButton
              icon={<Compass className="h-4 w-4" />}
              label="指北针"
              active={compassMode === "north"}
              onClick={() => setCompassMode((current) => (current === "north" ? "angled" : "north"))}
            />
          </div>
          {toolPanelOpen ? (
            <div className="absolute right-[120px] top-[96px] z-20 w-[220px] rounded-[24px] border border-white/10 bg-[#081218]/90 p-4 backdrop-blur">
              <div className="text-sm font-semibold text-white">探索工具</div>
              <div className="mt-3 space-y-2">
                <InlineToolButton label="设起点" onClick={onSetStartPoint} />
                <InlineToolButton label="添加锚点" onClick={onAddSafetyAnchor} />
                <InlineToolButton label="确认范围" onClick={onConfirmRange} />
              </div>
            </div>
          ) : null}
          <FloatingMapStatus>
            起点 {snapshot.context.startPointName} · 锚点 {snapshot.context.safetyAnchorCount} 个
          </FloatingMapStatus>
          <MapStage
            view={mapView}
            routeLine={[]}
            points={points}
            polygon={scenario.polygon}
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

function MapToolButton({
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

function InlineToolButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-white/5 px-3 py-3 text-sm text-white transition hover:bg-white/10"
      onClick={onClick}
    >
      <span>{label}</span>
      <span className="text-xs text-steel">执行</span>
    </button>
  );
}

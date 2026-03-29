import type React from "react";
import { useState } from "react";
import { Crosshair, Layers3, ShieldAlert, Sparkles, Waypoints } from "lucide-react";
import { MapStage } from "../../components/map-stage";
import { PageModeBadge, PrototypeViewport, TopBackButton } from "../../components/prototype-frame";
import type { OffroadMapScenario, OffroadStatusToken, SafetyDrawerScenario } from "../../mocks/sample-data";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { SafetyDrawer } from "../../overlays/safety_drawer/safety-drawer";

export function OffroadMapPage({
  scenario,
  safetyDrawer,
  mapView,
  overlayOpen,
  onToggleMapView,
  onOpenSafetyDrawer,
  onCloseSafetyDrawer,
  onEndTrip,
  onBack,
}: {
  scenario: OffroadMapScenario;
  safetyDrawer: SafetyDrawerScenario;
  mapView: "map_2d" | "map_3d";
  overlayOpen: boolean;
  onToggleMapView: () => void;
  onOpenSafetyDrawer: () => void;
  onCloseSafetyDrawer: () => void;
  onEndTrip: () => void;
  onBack: () => void;
}) {
  const [keyPointsVisible, setKeyPointsVisible] = useState(true);
  const [focusMode, setFocusMode] = useState<"all" | "current">("current");
  const visiblePoints = keyPointsVisible
    ? scenario.points
    : scenario.points.filter((point) => point.kind === "current" || point.kind === "start" || point.kind === "safety");
  const statusAccent = warningToneClasses[scenario.warning.level];

  return (
    <PrototypeViewport className="p-3">
      <div
        data-page-id="offroad-map"
        data-warning-level={scenario.warning.level}
        className="relative flex h-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#071218]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#081218]/88 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <TopBackButton label="返回" onClick={onBack} />
            <PageModeBadge>{scenario.modeLabel}</PageModeBadge>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {scenario.headerStatuses.map((status) => (
              <StatusChip key={status.label} status={status} />
            ))}
          </div>
        </div>

        <div className="relative flex-1">
          <div className="absolute right-5 top-5 z-20 flex flex-col gap-2">
            <MapActionButton
              icon={<Crosshair className="h-4 w-4" />}
              label="回到当前位置"
              onClick={() => setFocusMode("current")}
            />
            <MapActionButton
              icon={<Sparkles className="h-4 w-4" />}
              label={mapView === "map_2d" ? "切换 3D" : "切换普通态"}
              active={mapView === "map_3d"}
              onClick={onToggleMapView}
            />
            <MapActionButton
              icon={<Layers3 className="h-4 w-4" />}
              label={keyPointsVisible ? "关闭关键点" : "显示关键点"}
              active={keyPointsVisible}
              onClick={() => setKeyPointsVisible((current) => !current)}
            />
            <MapActionButton
              icon={<ShieldAlert className="h-4 w-4" />}
              label="安全入口"
              active={overlayOpen}
              onClick={onOpenSafetyDrawer}
            />
            <MapActionButton
              icon={<Waypoints className="h-4 w-4" />}
              label="结束 Trip"
              onClick={onEndTrip}
            />
          </div>

          <MapStage
            view={mapView}
            referenceLine={scenario.referenceLine}
            actualLine={scenario.actualTrackLine}
            points={visiblePoints}
            polygon={scenario.polygon}
            focusMode={focusMode}
            bearing={scenario.currentBearing}
          />

          <div className="absolute inset-x-5 bottom-20 z-20">
            <div className={`rounded-[24px] border px-4 py-3 backdrop-blur ${statusAccent}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em]">Level {scenario.warning.level}</div>
                  <div className="mt-1 text-sm font-semibold">{scenario.warning.title}</div>
                </div>
                <Badge className="border-white/10 bg-white/10 text-white">警示体系</Badge>
              </div>
              <div className="mt-2 text-sm leading-6">{scenario.warning.detail}</div>
            </div>
          </div>

          <div className="absolute inset-x-5 bottom-5 z-20">
            <div className="grid gap-3 rounded-[24px] border border-white/10 bg-[#081218]/86 px-4 py-4 backdrop-blur lg:grid-cols-[0.55fr_0.45fr_1fr]">
              <InfoMetric label={scenario.bottomPrimaryLabel} value={scenario.bottomPrimaryValue} />
              <InfoMetric label={scenario.bottomSecondaryLabel} value={scenario.bottomSecondaryValue} />
              <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-steel">当前提示</div>
                <div className="mt-2 text-sm font-medium text-white">{scenario.bottomHint}</div>
              </div>
            </div>
          </div>

          {overlayOpen ? <SafetyDrawer scenario={safetyDrawer} onClose={onCloseSafetyDrawer} /> : null}
        </div>
      </div>
    </PrototypeViewport>
  );
}

function StatusChip({
  status,
}: {
  status: OffroadStatusToken;
}) {
  const toneClasses: Record<OffroadStatusToken["tone"], string> = {
    neutral: "border-white/10 bg-white/6 text-steel",
    ok: "border-[#28554c] bg-[#112a25] text-[#bfe8d5]",
    warning: "border-[#654c20] bg-[#2f2410] text-[#f4d28a]",
    critical: "border-[#6d3d36] bg-[#301815] text-[#ffc0b2]",
  };

  return (
    <div className={`rounded-full border px-3 py-2 text-xs ${toneClasses[status.tone]}`}>
      <span className="mr-2 uppercase tracking-[0.18em]">{status.label}</span>
      <span className="font-semibold">{status.value}</span>
    </div>
  );
}

function MapActionButton({
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
      className="h-10 min-w-[128px] justify-start rounded-[18px] border border-white/10 bg-[#081218]/88 px-3 text-white backdrop-blur"
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Button>
  );
}

function InfoMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-steel">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

const warningToneClasses: Record<number, string> = {
  1: "border-[#284952] bg-[#102028]/92 text-[#d4ebf3]",
  2: "border-[#654c20] bg-[#2f2410]/92 text-[#f4d28a]",
  3: "border-[#744735] bg-[#341d16]/92 text-[#ffc5b3]",
  4: "border-[#8a3d35] bg-[#3e1514]/94 text-[#ffd1c7]",
};

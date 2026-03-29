import type React from "react";
import { AlertTriangle, RadioTower, Route, Shield, Waypoints } from "lucide-react";
import type { SafetyDrawerScenario } from "../../mocks/sample-data";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export function SafetyDrawer({
  scenario,
  onClose,
}: {
  scenario: SafetyDrawerScenario;
  onClose: () => void;
}) {
  return (
    <div
      data-overlay-id="safety-drawer"
      className="absolute inset-x-4 bottom-4 z-30 rounded-[30px] border border-white/10 bg-[#0f171d]/95 p-5 shadow-dune backdrop-blur"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge className="bg-white/12 text-white">安全抽屉</Badge>
          <h3 className="text-2xl font-semibold text-white">保守动作与外部联络</h3>
          <p className="max-w-3xl text-sm leading-7 text-steel">
            这里承载当前风险状态、保守动作和外部联络入口；地图背景保持可见，不引入真实返航策略与通讯逻辑。
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          关闭抽屉
        </Button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.1fr_1fr]">
        <DrawerSection
          icon={<AlertTriangle className="h-4 w-4" />}
          title="当前风险状态"
          description="当前状态标签 + 一句说明"
        >
          <div className="rounded-[22px] border border-[#62443a] bg-[#2d1916] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-[#ffc6b9]">
              {scenario.currentStatusLabel}
            </div>
            <div className="mt-2 text-sm leading-6 text-white">{scenario.currentStatusSummary}</div>
          </div>
        </DrawerSection>

        <DrawerSection
          icon={<Route className="h-4 w-4" />}
          title="保守动作区"
          description={
            scenario.mode === "explore"
              ? "自由探索模式：沿已走轨迹 / 回起点 / 回最近安全锚点"
              : "平台 Route / 导入轨迹模式：寻迹返航 / 回接驳点 / 回终点或回撤点"
          }
        >
          <div className="grid gap-3">
            {scenario.conservativeActions.map((action) => (
              <ActionCard key={action} label={action} />
            ))}
          </div>
        </DrawerSection>

        <DrawerSection
          icon={<Waypoints className="h-4 w-4" />}
          title="外部联络与标记区"
          description="风险标记、发送当前位置、卫星通讯入口都在这里集中展示。"
        >
          <div className="space-y-3">
            {scenario.externalActions.map((action) => (
              <Card key={action.label} className="rounded-[22px] bg-white/5">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    {action.label.includes("卫星") ? <RadioTower className="h-4 w-4 text-sand" /> : <Shield className="h-4 w-4 text-sand" />}
                    {action.label}
                  </div>
                  <p className="text-sm leading-6 text-steel">{action.note}</p>
                </CardContent>
              </Card>
            ))}
            <Button type="button" className="w-full">
              {scenario.satelliteEntryLabel}
            </Button>
          </div>
        </DrawerSection>
      </div>
    </div>
  );
}

function DrawerSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-white/4">
      <CardContent className="space-y-4 p-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-sand">
            {icon}
            {title}
          </div>
          <p className="mt-2 text-sm leading-6 text-steel">{description}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function ActionCard({
  label,
}: {
  label: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white">{label}</div>
        <Badge className="bg-[#153341] text-[#d4ebf3]">保守动作</Badge>
      </div>
      <div className="mt-2 text-sm leading-6 text-steel">
        仅做原型入口，不展开真实返航或撤离策略细节。
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { ArrowRight, Clock3, Layers3, Save, Share2 } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { MapStage } from "../../components/map-stage";
import { TopBackButton, TwoPanePrototype } from "../../components/prototype-frame";
import { buildSensorSummary, type SummaryScenario } from "../../mocks/sample-data";

export function TripSummaryPage({
  scenario,
  onBackToMap,
}: {
  scenario: SummaryScenario;
  onBackToMap: () => void;
}) {
  const [mapView, setMapView] = useState<"map_2d" | "map_3d">("map_2d");
  const [activeSegmentId, setActiveSegmentId] = useState(scenario.keySegments[0]?.id ?? "");
  const [timelineIndex, setTimelineIndex] = useState(scenario.timelineEvents[0]?.index ?? 0);

  const activeSegment = useMemo(
    () => scenario.keySegments.find((segment) => segment.id === activeSegmentId) ?? scenario.keySegments[0],
    [activeSegmentId, scenario.keySegments],
  );
  const activeTrackSample = scenario.trackSamples[Math.min(timelineIndex, scenario.trackSamples.length - 1)] ?? scenario.trackSamples[0];
  const sensorSummary = activeTrackSample ? buildSensorSummary(activeTrackSample) : [];
  const highlightedLine = activeSegment ? scenario.highlightedSegments[activeSegment.id] ?? [] : [];

  return (
    <TwoPanePrototype
      header={
        <div data-page-id="trip-summary">
          <TopBackButton label="返回" className="mb-4" onClick={onBackToMap} />
          <h1 className="min-w-0 overflow-hidden text-[28px] font-semibold leading-tight tracking-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {scenario.routeName}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="border-[#295060] bg-[#10232d] text-[#d4ebf3]">{scenario.modeLabel}</Badge>
            <Badge className={summaryBadgeClassName(scenario.completionStatus)}>{scenario.completionLabel}</Badge>
            <Badge className="bg-white/8 text-steel">{scenario.challengeIndex}</Badge>
          </div>
        </div>
      }
      pageLabel="越野总结页"
      title={scenario.routeName}
      left={
        <>
          <Card>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <MetricBlock label="当前模式" value={scenario.modeLabel} />
                <MetricBlock label="完成状态" value={scenario.completionLabel} />
                <MetricBlock label="总里程" value={scenario.totalDistance} />
                <MetricBlock label="总时长" value={scenario.totalDuration} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricBlock label="开始时间" value={scenario.startTime} />
                <MetricBlock label="结束时间" value={scenario.endTime} />
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-steel">
                回撤情况：<span className="font-medium text-white">{scenario.retreatStatus}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {scenario.portraitTags.map((tag) => (
                  <Badge key={tag} className="bg-white/8 text-steel">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-steel">
                {scenario.portraitSummary}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              {scenario.keySegments.map((segment) => (
                <button
                  key={segment.id}
                  type="button"
                  className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                    activeSegment?.id === segment.id
                      ? "border-[#4f6b58] bg-[#11221b]"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  }`}
                  onClick={() => {
                    setActiveSegmentId(segment.id);
                    setTimelineIndex(segment.startIndex);
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{segment.label}</div>
                    <Badge className="bg-white/8 text-steel">{segment.chip}</Badge>
                  </div>
                  <div className="mt-2 text-sm font-medium text-sand">{segment.title}</div>
                  <div className="mt-2 text-sm leading-6 text-steel">{segment.summary}</div>
                  <div className="mt-2 text-xs leading-5 text-steel">{segment.note}</div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              {scenario.vehicleHighlights.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-steel">{item.label}</div>
                    <Badge className="bg-white/8 text-steel">{item.source}</Badge>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                  <div className="mt-2 text-sm leading-6 text-steel">{item.detail}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <div className="text-sm leading-7 text-steel">{scenario.feedbackSummary}</div>
              <div className="rounded-[22px] border border-dashed border-[#295060] bg-[#10232d]/72 px-4 py-3 text-xs leading-6 text-[#d4ebf3]">
                深度总结入口：后续可扩展到风险回放、关键帧回看、素材导出和候选 Route 审核，但本轮只做原型入口。
              </div>
              <ActionList actions={scenario.feedbackActions} />
            </CardContent>
          </Card>
        </>
      }
      footer={
        <div className="grid grid-cols-3 gap-3">
          <Button type="button">
            <Save className="mr-2 h-4 w-4" />
            {scenario.footerActions.save}
          </Button>
          <Button type="button" variant="secondary">
            <Share2 className="mr-2 h-4 w-4" />
            {scenario.footerActions.share}
          </Button>
          <Button type="button" variant="secondary">
            <ArrowRight className="mr-2 h-4 w-4" />
            {scenario.footerActions.feedback}
          </Button>
        </div>
      }
      right={
        <div className="flex h-full flex-col bg-[#071218]">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-steel">地图回放与动态证据</div>
              <div className="mt-2 text-sm text-steel">
                当前高亮：<span className="font-semibold text-white">{activeSegment?.title ?? "总览"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => setMapView((current) => (current === "map_2d" ? "map_3d" : "map_2d"))}>
                <Layers3 className="mr-2 h-4 w-4" />
                {mapView === "map_2d" ? "切换 3D" : "切换 2D"}
              </Button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 p-4">
            <MapStage
              view={mapView}
              referenceLine={[]}
              actualLine={scenario.actualTrackLine}
              highlightLine={highlightedLine}
              points={scenario.mapPoints}
            />
            <div className="absolute bottom-8 left-8 z-20 rounded-[22px] border border-white/10 bg-[#081218]/84 px-4 py-3 text-sm text-steel backdrop-blur">
              当前片段：{activeSegment?.title ?? "总览"} · 点击左侧关键路段卡可联动高亮
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-4">
            <div className="text-xs uppercase tracking-[0.2em] text-steel">时间轴 / 传感器摘要条</div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1.35fr_0.85fr]">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap gap-2">
                  {scenario.timelineEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        timelineIndex === event.index
                          ? "border-[#4f6b58] bg-[#11221b] text-[#d9f3e5]"
                          : "border-white/10 bg-[#101a20] text-steel"
                      }`}
                      onClick={() => {
                        setTimelineIndex(event.index);
                        if (event.id in scenario.highlightedSegments) {
                          setActiveSegmentId(event.id);
                        }
                      }}
                    >
                      {event.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, scenario.trackSamples.length - 1)}
                  step={1}
                  value={timelineIndex}
                  className="mt-4 w-full accent-[#ff995e]"
                  onChange={(event) => setTimelineIndex(Number(event.currentTarget.value))}
                />
                <div className="mt-3 text-sm text-steel">
                  当前回看：<span className="font-medium text-white">{activeTrackSample?.timeLabel ?? scenario.startTime}</span>
                </div>
              </div>

              <div className="grid gap-3">
                {sensorSummary.map((item) => (
                  <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-steel">
                      <Clock3 className="h-4 w-4" />
                      {item.label}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                    <div className="mt-2 text-sm leading-6 text-steel">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
      <div className="mt-1.5 text-[20px] font-semibold leading-tight text-white">{value}</div>
    </div>
  );
}

function ActionList({
  actions,
}: {
  actions: Array<{ label: string; note: string }>;
}) {
  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <div key={action.label} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
          <div className="text-sm font-semibold text-white">{action.label}</div>
          <div className="mt-2 text-sm leading-6 text-steel">{action.note}</div>
        </div>
      ))}
    </div>
  );
}

function summaryBadgeClassName(status: SummaryScenario["completionStatus"]) {
  if (status === "completed") {
    return "border-[#204433] bg-[#13281f] text-[#bff5cf]";
  }
  if (status === "aborted") {
    return "border-[#6b413d] bg-[#33191a] text-[#ffc0b2]";
  }
  return "border-[#5c4b1e] bg-[#342a10] text-[#ffdf8b]";
}

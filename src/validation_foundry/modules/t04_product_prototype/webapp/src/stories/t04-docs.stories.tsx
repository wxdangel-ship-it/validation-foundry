import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

const meta = {
  title: "T04/Docs",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "T04 Storybook 文档入口。用于浏览第二阶段的页面角色、页面契约、Storybook 页面/状态矩阵，以及哪些内容属于正式需求、哪些仍是原型占位。",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "Overview",
  render: () => (
    <DocsStage
      title="T04 第二阶段原型站"
      summary="本轮目标是完善 P4 越野地图页、P4-overlay 安全抽屉、P5 越野总结页，并把 Storybook 从页面散点提升为完整原型站。"
      sections={[
        {
          title: "页面角色",
          items: [
            "P2 / P3 继续作为出发前确认页，不推翻第一阶段结构。",
            "P4 成为 Trip 行中主战场，强调参考线、已走轨迹、安全入口和轻状态。",
            "P4-overlay 仍是覆盖态，不独立成完整页面。",
            "P5 成为结果中心，强调快速复盘、结论化传感器证据和 Route 反哺入口。",
          ],
        },
        {
          title: "模式差异",
          items: [
            "平台 Route：强调平台参考线、一致性反馈、平台 Route 回流。",
            "导入轨迹：强调自定义参考线、保存为自定义路线、候选 Route 回流。",
            "自由探索：强调起点、安全锚点、探索边界、沿已走轨迹返回。",
          ],
        },
        {
          title: "前台强展示 vs 后台主导",
          items: [
            "前台强展示：模式标签、轻状态、关键路段、总结结论、风险级别、动作入口。",
            "后台主导：下载状态、轨迹提炼、传感器 derived/mock 推演、Storybook 自动演示。",
            "所有 derived/mock 字段必须显式标注，不伪装成真实车端或后端事实。",
          ],
        },
      ]}
    />
  ),
};

export const PageContracts: Story = {
  name: "Page Contracts",
  render: () => (
    <DocsStage
      title="P4 / Overlay / P5 页面契约"
      summary="这一页只说明可编码的结构，不做视觉渲染指南。"
      sections={[
        {
          title: "P4 越野地图页",
          items: [
            "顶部轻状态栏：返回、模式标签、离线状态、GPS、记录状态、卫星通讯状态。",
            "中央地图主画布：卫星图 + 当前定位 + 当前朝向 + 已走轨迹 + 安全锚点；平台/导入模式再叠加参考线、起终点、回撤点、关键锚点；自由探索模式叠加探索范围和手动标点。",
            "右侧浮动操作区：回到当前位置、普通/3D 切换、关键点开关、安全入口、结束 Trip。",
            "底部轻信息条：平台/导入模式显示下一关键点、终点和继续沿参考路线提示；自由探索显示起点、最近安全锚点和边界状态提示。",
            "四级警示：Level 1 轻提示、Level 2 注意提示、Level 3 风险提示、Level 4 高优先级提示。",
          ],
        },
        {
          title: "P4-overlay 安全抽屉",
          items: [
            "区块 1：当前风险状态标签 + 一句说明。",
            "区块 2：保守动作区，平台/导入与自由探索按不同动作集合展示。",
            "区块 3：风险标记、发送当前位置、卫星通讯入口。",
          ],
        },
        {
          title: "P5 越野总结页",
          items: [
            "左侧固定 5 张卡：总览卡、路线画像卡、关键路段卡、车辆与挑战表现卡、Route 反哺/分享卡。",
            "右侧地图回放区：实际轨迹、关键事件锚点、关键路段高亮、普通/3D 切换。",
            "地图下方时间轴：拖动回看、关键事件打点、速度/海拔坡度/姿态风险的结论化摘要。",
            "左侧底部固定操作区：保存总结、生成分享内容、提交路线反馈或保存为候选路线。",
          ],
        },
      ]}
    />
  ),
};

export const StorybookMatrix: Story = {
  name: "Storybook Matrix",
  render: () => (
    <DocsStage
      title="Storybook 站点矩阵"
      summary="完整原型站按页面、状态、文档和流程四层组织。"
      sections={[
        {
          title: "页面级 stories",
          items: [
            "P2 RouteDetail.PlatformRoute / ImportedTrack",
            "P3 FreeExplorePlan",
            "P4 OffroadMap.PlatformRoute / ImportedTrack / FreeExplore",
            "P4-overlay SafetyDrawer.PlatformRoute / FreeExplore",
            "P5 Summary.PlatformRoute / ImportedTrack / FreeExplore",
          ],
        },
        {
          title: "状态级 stories",
          items: [
            "下载状态：未下载 / 下载中 / 下载完成",
            "地图状态：普通态 / 3D态",
            "警示状态：Level 1 / 2 / 3 / 4",
            "安全抽屉：关闭 / 打开",
            "总结页：完成 / 中止 / 回撤完成",
          ],
        },
        {
          title: "自动演示与静态站",
          items: [
            "Flow A / Flow B / Flow C 通过 play function 自动推进。",
            "build-storybook 产物可作为静态站分享。",
            "QA bundle 保留截图、状态图、流程证据和构建日志。",
          ],
        },
      ]}
    />
  ),
};

export const PlaceholderScope: Story = {
  name: "Placeholder Scope",
  render: () => (
    <DocsStage
      title="Mock / Placeholder 边界"
      summary="这一页只说明哪些内容仍是原型推演，避免把样例事实、derived/mock 和未来真实能力混在一起。"
      sections={[
        {
          title: "真实样例事实",
          items: [
            "继续沿用六只脚样例事实源：里程、时长、难度、起终点、566 个轨迹点。",
            "平台 Route 与导入轨迹模式都复用这条样例，但前台语义必须区分。",
          ],
        },
        {
          title: "原型锚点 / derived / mock",
          items: [
            "risk / regroup / retreat 仍是原型锚点，不伪装成真实样例事实。",
            "总结页里的传感器结论、挑战指数、车辆表现属于 derived/mock 推演。",
            "卫星通讯、发送当前位置、生成视频、3D 回放入口仍是占位入口。",
          ],
        },
        {
          title: "当前不做",
          items: [
            "不接真实后端、不接真实下载服务、不接真实轨迹解析服务。",
            "不实现完整偏航算法、返航策略和正式导航交互。",
            "不把 Storybook 站点扩展成真实业务后台。",
          ],
        },
      ]}
    />
  ),
};

function DocsStage({
  title,
  summary,
  sections,
}: {
  title: string;
  summary: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(244,139,84,0.18),transparent_24%),radial-gradient(circle_at_80%_12%,rgba(91,160,168,0.16),transparent_20%),linear-gradient(180deg,#050b10_0%,#091319_100%)] px-6 py-8 text-white">
      <div className="mx-auto max-w-[1194px] space-y-6">
        <div className="space-y-3 rounded-[30px] border border-white/10 bg-[#091319]/88 p-6">
          <Badge className="bg-white/10 text-white">T04 Docs</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="max-w-4xl text-sm leading-7 text-steel">{summary}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardContent className="space-y-4">
                <div className="text-sm font-semibold text-sand">{section.title}</div>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

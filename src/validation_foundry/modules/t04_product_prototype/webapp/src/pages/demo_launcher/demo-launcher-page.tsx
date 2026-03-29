import { Compass, FileInput, Map } from "lucide-react";
import { PrototypeViewport } from "../../components/prototype-frame";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export function DemoLauncherPage({
  onOpenPlatform,
  onOpenImported,
  onOpenExplore,
}: {
  onOpenPlatform: () => void;
  onOpenImported: () => void;
  onOpenExplore: () => void;
}) {
  return (
    <PrototypeViewport className="px-6 py-8">
      <div data-page-id="launcher" className="flex h-full flex-col">
        <Badge className="self-start bg-white/12">P0 Demo Launcher</Badge>
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">T04 Demo Launcher</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-steel">
              这里只服务于原型启动和测试，不属于正式产品页。当前演示固定围绕六只脚路书目录样例
              <span className="text-sand"> liuzhijiao_1989358 </span>
              展开，目标是跑通平台 Route、导入轨迹和自由探索三条标准流程。
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/6 px-5 py-4 text-sm text-steel">
            当前阶段：页面契约 + 状态流转 + 点击原型 + 自动演示
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <Card className="bg-[#102129]/80">
            <CardContent className="space-y-5">
              <Compass className="h-8 w-8 text-sand" />
              <div>
                <h2 className="text-2xl font-semibold">平台 Route 样例</h2>
                <p className="mt-3 text-sm leading-6 text-steel">
                  模拟从搜索、专题图层或推荐路线进入，直接落到 P2 越野路线详情页，并以平台整理路线语义推进。
                </p>
              </div>
              <Button type="button" className="w-full" onClick={onOpenPlatform}>
                进入平台 Route 样例
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#102129]/80">
            <CardContent className="space-y-5">
              <FileInput className="h-8 w-8 text-sand" />
              <div>
                <h2 className="text-2xl font-semibold">导入轨迹样例</h2>
                <p className="mt-3 text-sm leading-6 text-steel">
                  使用同一条样例轨迹，但前台语义切换为用户导入后的自定义参考路线，并展示自动提炼摘要。
                </p>
              </div>
              <Button type="button" className="w-full" onClick={onOpenImported}>
                进入导入轨迹样例
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#102129]/80">
            <CardContent className="space-y-5">
              <Map className="h-8 w-8 text-sand" />
              <div>
                <h2 className="text-2xl font-semibold">自由探索样例</h2>
                <p className="mt-3 text-sm leading-6 text-steel">
                  从起点、安全锚点和探索范围设置开始，验证自由探索模式的 Ready Gate、离线准备与地图页承接。
                </p>
              </div>
              <Button type="button" className="w-full" onClick={onOpenExplore}>
                进入自由探索样例
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrototypeViewport>
  );
}

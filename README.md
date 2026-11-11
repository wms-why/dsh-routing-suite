# dsh-routing-suite — 注入器 × 思维模式路由 × 分级模式 套装

一个仓库装齐三件套：**运行时注入器**（免重启运行时管理层）+
**思维模式路由预设**（任务感知推理模式，P1-P23 实测）+
**分级任务协议**（脑暴出题 → 规格化计划 → 打卡制 → 组收官 → 终验，含红队门与审计端点）。

[中文](README.md) | [English](README.en.md)

## 组件入口（快速跳转）

| 组件 | 说明 | 入口 |
|---|---|---|
| **injector** | 运行时注入器：`dev_*` 工具全家桶（注入/热重载/卸载/侧挂转正/路由自愈） | [injector/README.md](injector/README.md) · [文档](injector/docs/SPEC.md) |
| **preset** | 思维模式路由预设（router-standard / router-spec，按模型 persona 路由） | [preset/README.md](preset/README.md) · [实验报告](preset/docs/experiments.md) |
| **graded** | 分级模式：会话级两级任务协议（6 工具+三模式+小类模式粒度+红队门+审计端点+超级面板） | [graded/README.md](graded/README.md) · [架构](graded/docs/ARCHITECTURE.md) · [理论](graded/docs/THEORY.md) · [实测数据](graded/docs/DATA.md) |

## 研究与数据（graded）

**"模型也会偷懒——我们测到了，还做了对抗"** —— 分级模式插件的公开研究位：
- [🔬 模型注意力懈怠：观测笔记](graded/docs/STUDY.md)——长程任务里验证勤勉度衰减的真实分段数据（无协议链晚段"1 工具/0 读图" vs 协议链全程在线）+对抗机制对照
- [📊 协议 vs 无协议：实测对比](graded/docs/COMPARE.md)——同型 3D 任务三会话对比表+ASCI I 图
- [🧪 测量工具](graded/scripts/measure.mjs)——`node scripts/measure.mjs 你的会话.jsonl`：任何人可对自己会话复算上述指标（脱敏：只输出数字）
- [📁 实测数据](graded/docs/DATA.md)——三会话脱敏指标表+懈怠强度表+审计口径

## 一键安装

```powershell
dsh plugin --profile web add github:wms-why/dsh-routing-suite
```

> 本套装已含上述三组件（injector/preset/graded 均为仓库内普通目录，内容直接入库）；
> graded 发布物：`graded/dsh-external-dsh-graded-mode-0.0.1-rc1.tgz`（或 Release 附件）。

**DSH Target**：`>=0.2.0-rc <1`（本仓库已跟进 DSH 0.2.2-rc.1）

> DSH 目前处于 developer preview，官方明示会有破坏性变更（breaking changes）。
> 0.2 是一次架构级变更（预设注册表 / 工具注册表 / loader 契约都换过），
> 本仓库的版本跟进记录见 `preset/CHANGELOG.md`。

## 安装链（三步）

```powershell
# 1. 拉套装（单仓库：injector/preset 内容已直接入库，无需 submodule）
git clone https://github.com/wms-why/dsh-routing-suite.git
cd dsh-routing-suite

# 2. 一键安装（注入器装配 + 预设 bundle 生成/装配 + 提示重启）
.\install.ps1
```

或手动：

```powershell
# 步骤 1：装配注入器（官方装配，重启后由 bundles 接管）
dsh plugin --profile web add .
# dsh 不在 PATH 时：npx '@deepseek-ai/dsh' plugin --profile web add .

# 步骤 2：生成并装配 router 预设的 bundle
#   DSH ≥0.2 不再扫描 ~/.dsh/.agent-presets/ ——预设改为「bundle 声明一行
#   @deepseek-ai/dsh-agent-preset → 写进 preset 注册表」，所以每个预设目录
#   都是一个独立 bundle（package.json + dsh.bundle.patch）。
node .\preset\scripts\build-preset-bundle.mjs
dsh plugin --profile web add .\preset\router-standard
dsh plugin --profile web add .\preset\router-spec

# 步骤 3：重启 DSH → 新会话选择 Router Standard / Router Spec (experimental)
```

> 预设的 `cordis.patch.yml` 是**生成物**（由 `agent.cordis.yml` + `preset.yml` 生成）——
> 改预设请改源文件后重新生成，不要手改 patch。

## 组件

| 路径 | 仓库 | 版本 | 作用 |
|---|---|---|---|
| `injector/` | [dsh-super-injector](https://github.com/yjh051108/dsh-super-injector) | [v0.3.3](https://github.com/yjh051108/dsh-super-injector/releases/tag/v0.3.3) | 运行时注入器：dev_* 工具全家桶（注入/热重载/侧挂转正/卸载/路由自愈）；`github:` 装配由 prepare 钩子自动构建 |
| `preset/` | [dsh-router-standard](https://github.com/yjh051108/dsh-router-standard) | [v0.3.0 … 主线 v1.19.1/v34](https://github.com/yjh051108/dsh-router-standard/releases/tag/v0.3.0) | 思维模式路由预设：router-standard（分类 persona + 完整 sections）/ router-spec（深度思考优先）。router-pro 为规划中（planned），未随 v0.3.0 发布 |
| `graded/` | [dsh-graded-mode](https://github.com/yjh051108/dsh-routing-suite/tree/main/graded) | [v0.0.1-rc1](https://github.com/yjh051108/dsh-routing-suite/releases/tag/v0.0.1-rc1) | graded 模式：会话级两级任务协议（脑暴选择题对齐 → 北极星定稿 → 规格化计划 → 按规格注入 → 打卡制 → 组收官 → 终验）；6 工具 + 三模式 + 小类模式粒度 + 红队门 + 审计端点；`graded/dsh-graded-mode-3.2.0.tgz` 可直接 `dsh plugin --profile web add` |

> 版本号以各组件仓库的 git tag 为准（列内链接直达对应 Release）。

三个组件随本仓库统一演进（`injector/`、`preset/` 与 `graded/` 已是仓库内普通目录，内容直接入库）；上游独立仓库保留用于独立发布，后续可转镜像/归档。预设安装目录为 `preset/router-standard`（已平铺，无额外嵌套）。

## router-standard 预设能力（P1-P23 实测摘要）

- **三行为带 + weak 内路由**：spec（计划-集体）/ react（执行者）/ mixed（陷阱，回避）/ weak（模型自分类）
- **按模型选 persona**：Pro=spec 句+few-shot（区分度 +5.0）；Flash=neutral+classify（+5.7）
- **近距离引导**：每轮用户消息后注入固定引导（缓存 92-94% 命中），路由 96% + 收敛 100% + 反稀释
- **单任务三锚**（persona 静态）：回顾 + 收敛 + 反跑题 —— 开放任务完成率 0% → 100%
- **plan-mode 保留**：只替换 persona section，plan 边界不失忆
- **AI 自优化工具**：`dev_router_status` / `dev_router_mode` / `dev_mode_subagent`

## v0.3.0 变更（真实装配链路修复）

- **首轮路由真实生效**（[#13](https://github.com/yjh051108/dsh-routing-suite/issues/13)）：经 `agent/inbox/claimed` 在装配前捕获首条真实用户消息，首个请求即按任务分类（此前所有会话首轮无条件 weak）
- **近距离引导改走 `agent/pre-step`**（[#34](https://github.com/yjh051108/dsh-routing-suite/issues/34)/[#36](https://github.com/yjh051108/dsh-routing-suite/issues/36)/[#55](https://github.com/yjh051108/dsh-routing-suite/issues/55)）：引导与用户消息同请求注入，真实链路上可达，且不再产生额外的第二次 API 调用（此前每轮多 1 次调用 = 费用 2×）
- **缺导入修复**（[#11](https://github.com/yjh051108/dsh-routing-suite/issues/11)）、preset.yml YAML 引号（[#53](https://github.com/yjh051108/dsh-routing-suite/issues/53)）、promoted 后完整回归（[#44](https://github.com/yjh051108/dsh-routing-suite/issues/44)）、安装脚本与文档修正（[#35](https://github.com/yjh051108/dsh-routing-suite/issues/35)/[#42](https://github.com/yjh051108/dsh-routing-suite/issues/42)/[#41](https://github.com/yjh051108/dsh-routing-suite/issues/41)）、injector git 装配自动构建（[#40](https://github.com/yjh051108/dsh-routing-suite/issues/40)）

## DSH 0.2 适配说明（本仓库已跟进）

DSH 0.2 是一次架构级变更——预设注册表、工具注册表、loader 契约都换过。本仓库
（fork）已把三组件适配到 **DSH 0.2.2-rc.1**，要点如下：

### 1. 预设：从「目录」变成「bundle 行」

0.1.x 的 agent preset 是 `~/.dsh/.agent-presets/<id>/`（`preset.yml` +
`agent.cordis.yml`），由 `dsh-agent-presets` 扫描发现。**0.2 取消了这个扫描**：
预设改为由插件声明一行 `@deepseek-ai/dsh-agent-preset`，写进
`dsh-agent-preset-registry`。

于是每个预设目录升级为一个独立 bundle：

```
preset/router-standard/
  package.json        # name: @dsh-external/dsh-router-standard, dsh.bundle.patch
  cordis.patch.yml    # 生成物：一行 @deepseek-ai/dsh-agent-preset
  agent.cordis.yml    # 源文件：预设的 loader 行（结构未变）
  preset.yml          # 源文件：name / description / order
```

`cordis.patch.yml` 由 `preset/scripts/build-preset-bundle.mjs` 生成——改预设改源
文件后重新生成，别手改 patch。预设行引用引导器时用**包子路径**
（`@dsh-external/dsh-router-standard/router-bootstrap`）而不是相对路径：0.2 的
解析路由按「包名 + 子路径」走，预设行的相对名不再按预设目录解析。

### 2. 工具面：assemble 的 waterfall 不再能裁工具

0.2 的 `system-prompt/assemble` 返回 `PromptPresentation {sections, contexts,
variables}`——**没有 `tools`**（工具声明归各自提供者，框架在 waterfall 之后才挂
上去，返回值里写 `tools` 也会被覆盖）。

所以首轮「只露 phase_begin」改用工具准入面表达：`tools.restrict({deny})` 挡住
该 agent 的全局工具，scope-local 注册的 `phase_begin` 不受影响（"scoped
registrations remain visible"）。

### 3. 其他 0.2 契约变化

| 面 | 0.1.x | 0.2.x | 本仓库的处理 |
|---|---|---|---|
| 人设段 | `deployment:persona`（一段） | `deployment:persona-prefix` + `-suffix` | 只顶替 prefix，suffix 丢弃（否则注入两遍） |
| persona 配置 | `text` | `prefix`（`prefix` 必填） | 改用 `prefix` |
| 工具层表项 | 定义本身 | `{definition, when}` 注册记录 | 取定义时拆一层 |
| 工具服务 | `layers.scoped`（WeakMap） | `layers.peek(scope)` | 改用 `peek` |
| 会话事件 | `session.events` getter | `session.snapshotEvents()` | 四处读取全部改走 `snapshotEvents()` |
| 呈现模式 | `tools.presentAs('native')` | 已移除（宿主挂 native/PTC 执行器） | 删掉调用（原先是静默 no-op） |
| `fiber._config` | cordis 4.0 | `fiber.rawConfig`（cordis 4.1） | 注入器加兼容层 |
| `entry._dispose()` | loader 1.0.2 有 | loader 1.1.0 删除 | 注入器加兼容层（回退到 `fiber.dispose()`） |
| `EntryGroup.remove()` | 返回 Promise | 同步返回 void | 注入器加兼容层 |
| `dsh-workflow-worker-thread` | 随 0.1.x 发布 | 0.2.x 不再发布 | 改用 `dsh-workflow-ptc` |
| `dsh-tool-subagent-control/list-agents` | 有该子路径导出 | 已移除 | 删掉该行（列表工具由 agent-team 提供） |
| `dsh-tool-subagent` 配置 | `backgroundMode` / `enableRunInBackground` | 改为 `modelSelection` / `modelDiscovery` | 换键；`modelDiscovery` 只开一处（否则重复注册 `list_subagent_models`） |

## 文档

- 注入器引导（规范铁律 10 条）：`injector/README.md`
- 路由预设论文与实验：`preset/docs/paper.md` + `preset/docs/experiments.md`（P1-P23）
- 仓库结构迁移（submodule → 直接文件）：[docs/FLATTEN-MIGRATION.md](docs/FLATTEN-MIGRATION.md)

## 许可证

MIT。致谢：xiaobright/modeltest（V4.1b 评测）、xiaobright/dsh-anchored-standard（锚定机制）。

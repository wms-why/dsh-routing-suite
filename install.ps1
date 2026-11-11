# dsh-routing-suite 一键安装（Windows PowerShell）
# 步骤：1) 装配注入器  2) 安装 router-standard / router-spec 预设  3) 提示重启
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
# 目标 profile：默认取当前运行的 profile（DSH_PROFILE），可用 SCRIPT_PROFILE 覆盖。
$profile = if ($env:SCRIPT_PROFILE) { $env:SCRIPT_PROFILE } elseif ($env:DSH_PROFILE) { $env:DSH_PROFILE } else { 'web' }

Write-Host '=== [1/3] 装配注入器 ===' -ForegroundColor Cyan
$injector = Join-Path $root 'injector'
if (-not (Test-Path (Join-Path $injector 'lib\index.js'))) {
  # 全新 clone 没有 lib/（构建产物不入库）。github: 装配（方式 B）会在安装时由
  # prepare 钩子自动构建；本地目录装配若构建不可行，请改用 Release tgz（方式 A）。
  Write-Host 'injector/lib 缺失——尝试 npm install 触发 prepare 钩子构建（若私有 peer 拉取失败会自动跳过）...' -ForegroundColor Yellow
  Push-Location $injector
  try {
    & npm install --no-audit --no-fund 2>&1 | Out-Host
  } catch {
    Write-Host 'npm install 失败（可忽略）' -ForegroundColor DarkGray
  } finally {
    Pop-Location
  }
  if (-not (Test-Path (Join-Path $injector 'lib\index.js'))) {
    Write-Host '自动构建不可行——注入器请改用以下方式装配：' -ForegroundColor Yellow
    Write-Host '  A. Release tgz（预构建，推荐）：https://github.com/yjh051108/dsh-super-injector/releases' -ForegroundColor Yellow
    Write-Host '  B. github: 装配（prepare 钩子自动构建）：dsh plugin --profile web add github:yjh051108/dsh-super-injector' -ForegroundColor Yellow
  } else {
    Write-Host 'injector/lib 构建完成' -ForegroundColor Green
  }
}
if (Test-Path (Join-Path $injector 'lib\index.js')) {
  # dsh CLI 可能不在 PATH（用 npx @deepseek-ai/dsh web 启动的场景）；优先 dsh，fallback 到 npx
  $dshCmd = Get-Command dsh -ErrorAction SilentlyContinue
  if ($dshCmd) {
    & dsh plugin --profile $profile add $injector 2>&1 | Out-Host
  } else {
    & npx '@deepseek-ai/dsh' plugin --profile $profile add $injector 2>&1 | Out-Host
  }
  Write-Host '注入器已装配（重启后由 bundles 接管）' -ForegroundColor Green
}

Write-Host '=== [2/3] 生成并装配 router preset bundle ===' -ForegroundColor Cyan
# DSH >=0.2 不再扫描 ~/.dsh/.agent-presets/ ——预设改为「bundle 声明一行
# @deepseek-ai/dsh-agent-preset → 写进 preset 注册表」，所以每个预设目录都是
# 一个独立 bundle（package.json + dsh.bundle.patch）。
# patch 是生成物：由 preset/scripts/build-preset-bundle.mjs 从 agent.cordis.yml + preset.yml 生成。
$presetRoot = Join-Path $root 'preset'
$presets = @('router-standard', 'router-spec')
$generator = Join-Path $presetRoot 'scripts\build-preset-bundle.mjs'
if (Get-Command node -ErrorAction SilentlyContinue) {
  & node $generator 2>&1 | Out-Host
} else {
  Write-Host '未找到 node——跳过 preset bundle patch 生成' -ForegroundColor Yellow
}
foreach ($name in $presets) {
  $pkg = Join-Path $presetRoot $name
  $patch = Join-Path $pkg 'cordis.patch.yml'
  if (-not (Test-Path $patch)) {
    Write-Host "FAIL: $name 缺少 cordis.patch.yml（$patch）——预设不会被 DSH 发现" -ForegroundColor Red
    continue
  }
  if ($dshCmd) {
    & dsh plugin --profile $profile add $pkg 2>&1 | Out-Host
  } else {
    & npx '@deepseek-ai/dsh' plugin --profile $profile add $pkg 2>&1 | Out-Host
  }
  Write-Host "预设 bundle 已装配：$name" -ForegroundColor Green
}

Write-Host '=== [3/3] 完成 ===' -ForegroundColor Cyan
Write-Host "1. 重启 DSH（profile: $profile）" -ForegroundColor Yellow
Write-Host '2. GUI 新建会话 → 选择 Router Standard / Router Spec (experimental)' -ForegroundColor Yellow
Write-Host '3. 发任务：生成任务自动 react，维护任务自动 spec，模糊任务进 weak 内路由' -ForegroundColor Yellow
Write-Host '4. AI 自优化工具：dev_router_status / dev_router_mode / dev_mode_subagent' -ForegroundColor Yellow

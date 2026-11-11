#!/usr/bin/env node
/**
 * 由 `agent.cordis.yml` + `preset.yml` 生成 DSH ≥0.2 的 bundle patch。
 *
 * 背景（DSH 0.2 架构变更）：0.1.x 的 agent preset 是「一个目录 + agent.cordis.yml +
 * preset.yml」，由 dsh-agent-presets 扫 ~/.dsh/.agent-presets/ 发现。0.2 起该扫描
 * 消失，预设改为「由插件声明 → 写进 dsh-agent-preset-registry」：
 *
 *   - 载体变成一个 bundle（package.json + dsh.bundle.patch）
 *   - 预设定义是 `@deepseek-ai/dsh-agent-preset` 行的 config：
 *     { id, name, description, order, plugins: [ ...loader 行... ] }
 *   - plugins 里每一项就是原来 agent.cordis.yml 的一行（结构完全一致）
 *
 * 所以本脚本只做两件事：把 preset.yml 的元数据搬进 config，再把 agent.cordis.yml
 * 的行整体缩进后塞进 plugins。行结构一字不改——避免手抄漂移。
 *
 * 用法：node scripts/build-preset-bundle.mjs [router-standard router-spec ...]
 *        不带参数 = 处理 preset/ 下所有含 agent.cordis.yml 的子目录。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PRESET_DIR = dirname(dirname(fileURLToPath(import.meta.url)))
/** plugins 列表所在的缩进层级：config: (8) → plugins: (8) → 行 (10)。 */
const PLUGINS_INDENT = ' '.repeat(10)

/** 从 preset.yml 里取出 name / description / order 三行原文（保持 YAML 写法）。 */
function readMeta(presetYml) {
  const lines = readFileSync(presetYml, 'utf8').split('\n')
  const meta = {}
  for (const key of ['name', 'description', 'order']) {
    const line = lines.find((l) => l.startsWith(`${key}:`))
    if (line !== undefined) meta[key] = line.trim()
  }
  return meta
}

/** 整体缩进 agent.cordis.yml 的每一行（空行保持空行）。 */
function indentRows(agentCordisYml) {
  return readFileSync(agentCordisYml, 'utf8')
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : PLUGINS_INDENT + line))
    .join('\n')
}

/**
 * DSH ≥0.2 里，预设行的相对名（'./x.mjs'）不再按「预设所在目录」解析——
 * 预设行由 dsh-agent-preset-registry 挂载，解析基准是 profile 目录，
 * 相对路径必然落空。0.2 的解析路由按「包名 + 子路径」走，所以这里把相对名
 * 改写成包子路径（'@dsh-external/dsh-router-<id>/<subpath>'）。
 *
 * 映射来自各预设 package.json 的 exports：文件名 → 子路径名。
 */
function rewriteRelativeNames(rows, presetId, exportsMap) {
  const packageName = `@dsh-external/dsh-${presetId}`
  return rows.replace(/^(\s*name:\s*)['"]?(\.\/[^'"\s]+)['"]?\s*$/gm, (whole, prefix, file) => {
    const base = file.split('?')[0].replace(/^\.\//, '')
    for (const [fileName, subpath] of Object.entries(exportsMap)) {
      // `@` 是 YAML 的保留指示符——包子路径必须加引号。
      if (fileName === base) return `${prefix}'${packageName}/${subpath}'`
    }
    return whole
  })
}

function buildPatch(id, meta, rows) {
  const metaLines = [meta.name, meta.description, meta.order]
    .filter((line) => line !== undefined)
    .map((line) => `        ${line}`)
    .join('\n')
  return `# dsh-routing-suite · ${id} —— agent preset 的 bundle 层。
#
# DSH ≥0.2：预设不再是 ~/.dsh/.agent-presets/ 下的目录，而是由本 bundle 声明一行
# @deepseek-ai/dsh-agent-preset，写进 dsh-agent-preset-registry。
# config.plugins 的每一项 = 原 agent.cordis.yml 的一行（结构未变）。
#
# 本文件由 scripts/build-preset-bundle.mjs 从 agent.cordis.yml + preset.yml 生成，
# 改预设请改源文件后重新生成，不要手改这里。
- insert:
    - id: preset-${id}
      name: '@deepseek-ai/dsh-agent-preset'
      config:
        id: ${id}
${metaLines}
        plugins:
${rows}
`
}

/** preset/ 下所有含 agent.cordis.yml 的子目录。 */
function discover() {
  return readdirSync(PRESET_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => existsSync(join(PRESET_DIR, name, 'agent.cordis.yml')))
}

const requested = process.argv.slice(2)
const names = requested.length > 0 ? requested : discover()
for (const name of names) {
  const dir = join(PRESET_DIR, name)
  const meta = readMeta(join(dir, 'preset.yml'))
  const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  // exports: { "./router-bootstrap": "./router-bootstrap-v34.mjs" } → { "router-bootstrap-v34.mjs": "router-bootstrap" }
  const exportsMap = Object.fromEntries(
    Object.entries(manifest.exports ?? {})
      .filter(([subpath, file]) => subpath.startsWith('./') && typeof file === 'string' && file.endsWith('.mjs'))
      .map(([subpath, file]) => [file.replace(/^\.\//, ''), subpath.replace(/^\.\//, '')]),
  )
  const rows = rewriteRelativeNames(indentRows(join(dir, 'agent.cordis.yml')), name, exportsMap)
  const out = join(dir, 'cordis.patch.yml')
  writeFileSync(out, buildPatch(name, meta, rows), 'utf8')
  console.log(`[build-preset-bundle] ${name} -> ${out}`)
}

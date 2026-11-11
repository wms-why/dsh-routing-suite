/**
 * @dsh-external/dsh-router-standard 的包入口。
 *
 * DSH ≥0.2 的 bundle 只贡献它的 `dsh.bundle.patch`（一行 agent preset 声明），
 * 本文件是包的 main —— 它不注册任何服务，也不参与预设的装配。
 *
 * 真正的引导器（router-bootstrap-v34.mjs）由预设自己挂载：
 * 预设的 plugins 行以包子路径 `@dsh-external/dsh-router-standard/router-bootstrap`
 * 引用它（0.2 的解析路由按包名解析子路径，相对路径不再按预设目录解析）。
 */
export const name = 'dsh-router-standard'
export const inject = []

export function apply() {
  // 无操作：预设的内容由 dsh-agent-preset 行声明。
}

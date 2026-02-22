# Notice — Vibe Coding 开发笔记

> 本项目采用 AI Vibe Coding 方式开发，以下记录了一些有趣的开发经历和调试过程。

---

## 🔍 版本号捉迷藏 (v0.3.0 → v0.3.1)

**问题**: 将版本号从 0.2.1 改到 0.3.0 后，用户在 VPS 上通过安装脚本安装，结果面板仍显示 0.2.1。

**过程**: AI 一开始只找到了 `package.json` 和 `dashboard.go` 两处版本号并更新，认为任务完成。但实际上版本号散落在 **6 个不同的文件** 中：

| 文件 | 描述 |
|------|------|
| `web/package.json` | npm 包版本 |
| `internal/handler/dashboard.go` | Dashboard API 返回的版本号 |
| `install.sh` | ❌ **遗漏** — 安装脚本硬编码 `0.2.1` |
| `web/src/pages/Layout.jsx` | ❌ **遗漏** — 前端界面硬编码 |
| `.github/workflows/ci.yml` | CI 编译没有注入版本号 |
| `.github/workflows/release.yml` | Release 编译 |

**根因**: 版本号没有统一管理，每次升版需要手动修改多个文件，容易遗漏。

**解决方案**: 创建 `VERSION` 文件作为唯一真相源（Single Source of Truth），所有其他地方动态读取：
- Go 后端: `go build -ldflags "-X main.Version=$(cat VERSION)"` 编译时注入
- install.sh: 运行时读取 VERSION 文件或从 GitHub API 获取 latest release
- 前端 Layout: 从 Dashboard API 获取版本号，不再硬编码
- CI/CD: 从 VERSION 文件读取并注入

**教训**: AI 在搜索版本号时第一次只做了部分搜索。用户反馈后进行了更彻底的全局搜索 (`grep -rn "0.2.1"`)，才发现 `install.sh` 中的遗漏。这提醒我们：**修改散布在多个文件中的硬编码值时，必须做全局搜索确认完整性**。

---

## 📋 意外的剪贴板事故

在开发过程中，用户的 `internal/handler/audit.go` 文件第一行被意外粘贴了一串无关内容（磁力链接），导致 `package handler` 声明被破坏：

```diff
- magnet:?xt=urn:btih:...package handler
+ package handler
```

这类意外在 Vibe Coding 中偶尔发生 — 用户在多个窗口间切换时，剪贴板内容可能被误粘贴到代码编辑器中。AI 在处理用户请求前，注意到 diff 中的异常并主动修复了它。

**教训**: AI Agent 需要对传入的 diff 保持警惕，异常内容可能不是用户有意为之。

---

## 🔄 Bool 指针的隐含陷阱

在 Phase 1 中发现的一个 subtle bug: GORM 模型中 `Enabled` 和 `TLSEnabled` 字段类型为 `bool`，这意味着 Go 的零值 `false` 和用户的显式 `false` 无法区分。当用户想要禁用某个 Host 时，GORM 会将 `false` 视为零值而跳过更新。

**解决方案**: 将所有布尔字段改为 `*bool`（指针类型），这样 `nil` 表示"使用默认值"，`false` 表示"用户显式设为 false"。

```go
// Before — bug: false 被 GORM 忽略
Enabled bool `gorm:"default:true"`

// After — 正确区分 nil 和 false
Enabled *bool `gorm:"default:true"`
```

---

## 🎨 Vibe Coding 的节奏

开发 CaddyPanel 的典型 Vibe Coding session：

1. **用户描述需求** → "添加 DNS Provider 管理 + DNS Challenge 证书"
2. **AI 规划** → 拆分为 Model → Handler → Service → Renderer → Frontend 的开发顺序
3. **AI 实现** → 批量创建文件和修改代码
4. **验证** → `go build` + `npm run build` 确认编译通过
5. **用户测试** → 部署到 VPS 验证实际效果
6. **迭代修复** → 用户发现 install.sh 版本号错误 → AI 全局搜索修复

整个 Phase 4 的开发（4 个批次，30+ 个文件变更，6 个新页面组件，15+ 个新 API 端点）在一个连续的 Vibe Coding session 中完成。

---

## 💡 经验总结

1. **版本号管理**: 永远使用 Single Source of Truth，避免多处硬编码
2. **全局搜索**: 修改任何"值"之前，先 `grep -rn` 全局搜索确认影响范围
3. **Bool 指针**: Go + GORM 中布尔字段必须用 `*bool` 避免零值陷阱
4. **渐进式验证**: 每完成一个批次就 `go build` + `npm run build` 验证，不要累积到最后
5. **文档同步**: 功能开发后及时更新 agents.md / stack.md / README.md，避免文档腐化

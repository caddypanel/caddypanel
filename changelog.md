# Changelog

所有版本变更记录。本项目使用 [Semantic Versioning](https://semver.org/)。

> 📌 本项目采用 AI Vibe Coding 方式开发，使用 Gemini 2.5 Pro + Antigravity Agent 辅助编码。

---

## [0.3.1] - 2026-02-23

### Changed
- 统一版本管理机制：创建 `VERSION` 文件作为唯一真相源
- Go 后端通过 `go build -ldflags -X main.Version=` 注入版本号
- `install.sh` 自动从 VERSION 文件或 GitHub API 获取版本号
- 前端右下角版本号改为从 Dashboard API 动态读取
- CI/CD 构建注入版本号

### Fixed
- 修复 `install.sh` 版本号仍为 0.2.1 的遗留问题

---

## [0.3.0] - 2026-02-22

### Added — Phase 4: Caddy 高级特性

#### 批次 1: DNS Provider + TLS 管理
- 🆕 DNS Provider 管理（Cloudflare / 阿里云 DNS / 腾讯云 DNS / Route53）
- 🆕 TLS 模式选择（自动 / DNS Challenge / 通配符 / 自定义证书 / 关闭）
- 🆕 `DnsProvider` 模型 + CRUD API（5 个端点）
- 🆕 `renderDnsTLS()` Caddyfile 渲染函数
- 🆕 前端 DNS Providers 管理页面
- 🆕 HostList TLS 模式选择器 + DNS Provider 下拉选择

#### 批次 2: Host 选项增强
- 🆕 响应压缩（Gzip + Zstd）— `encode gzip zstd`
- 🆕 CORS 跨域配置 — Preflight + 自定义 Origin/Methods/Headers
- 🆕 安全响应头一键开启 — HSTS / X-Frame-Options / CSP / X-XSS-Protection
- 🆕 自定义错误页面 — handle_errors 404/502/503
- 🆕 响应缓存开关 + TTL 配置
- 🆕 Host model 新增 9 个字段
- 🆕 4 个新的 renderer 函数

#### 批次 3: 静态文件和 PHP 托管
- 🆕 `static` 类型 — 静态文件托管（root + file_server + 目录浏览）
- 🆕 `php` 类型 — PHP/FastCGI 站点（php_fastcgi + file_server）
- 🆕 Host 类型从 2 种扩展到 4 种（proxy / redirect / static / php）
- 🆕 前端类型选择器和动态表单

#### 批次 4: Caddyfile 编辑器
- 🆕 CodeMirror 6 在线编辑器（oneDark 主题）
- 🆕 `caddy fmt` 一键格式化
- 🆕 `caddy validate` 语法验证
- 🆕 保存 / 保存并重载 / 重置
- 🆕 3 个新的 API 端点（`/caddy/caddyfile` POST / `/caddy/fmt` / `/caddy/validate`）

---

## [0.2.1] - 2026-02 (Before Phase 4)

### Added — Phase 3: 体验提升
- 🆕 Dashboard 增强 — Host 分类计数 / TLS 状态统计 / 系统信息
- 🆕 多用户管理 — CRUD + admin/viewer 角色
- 🆕 审计日志 — 所有操作记录 + IP 追踪 + 分页查询
- 🆕 自定义 Caddy 指令片段（custom_directives 文本框）

### Added — Phase 2: 核心缺失填补
- 🆕 域名跳转（Redirect Host 类型）— 301/302 跳转
- 🆕 自定义 SSL 证书上传 — cert/key 文件管理
- 🆕 HTTP Basic Auth — bcrypt 密码保护站点

### Added — Phase 1: 核心完善
- 🆕 预编译发布模式（GitHub Actions CI/CD）
- 🆕 Caddy 进程生命周期管理
- 🆕 一键安装脚本（支持 10+ Linux 发行版）
- 🆕 公网反代支持
- 🔧 修复 TLS 开关 `*bool` 空指针 bug

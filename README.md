# NodeAuth Worker Deploy Helper | 部署辅助工具

[NodeAuth Worker 部署辅助工具](https://tools.nodeauth.io) 是一个纯前端、高安全的配置辅助工具，旨在帮助开发者快速生成和加密 NodeAuth Worker 所需的环境变量。

## ✨ 核心功能

- **🎲 随机密钥生成**：生成 64 位强度的安全字符串，适用于 `JWT_SECRET` 或 `ENCRYPTION_KEY`。
- **📦 Base64 编码**：将普通环境变量包装为 `base64:` 前缀格式，符合 NodeAuth 解析规范。
- **🔡 Hex 编码**：将敏感值转换为 `hex:` 格式。
- **🔐 AES 批量加密**：
  - 支持多行 `KEY=VALUE` 格式解析。
  - **逻辑锁 (Logic Lock)**：支持结合 `NODEAUTH_LICENSE` 进行授权关联加密，进一步提升安全性。
  - **高性能**：采用 PBKDF2 (100k 迭代) 派生根密钥，并使用 AES-256-GCM 进行浏览器本地并行加密。
- **🌍 多语言支持**：内置中英文界面快速切换。
- **🌙 双色主题**：支持深色/浅色模式切换，适配不同工作环境。

## 🛡️ 安全保障

- **零数据传输**：所有加密和编码逻辑均在浏览器本地完成，没有任何数据会上传到服务器。
- **高强度算法**：严格遵循现代加密标准，使用 Web Crypto API 实现。
- **隐私保护**：即使在离线状态下也可使用。

## 🚀 快速开始

1. 访问 [tools.nodeauth.io](https://tools.nodeauth.io)。
2. 生成您的 `JWT_SECRET`。
3. 输入需要加密的环境变量条目（如 `OAUTH_GOOGLE_CLIENT_ID=...`）。
4. 点击“执行加密”，获取加密后的结果。
5. 将结果复制到您的 `wrangler.toml` 或 Cloudflare Dashboard 中。

## 📄 开源协议

本项目基于 MIT 协议进行分发。

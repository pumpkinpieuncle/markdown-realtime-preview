# Markdown 实时预览 (Markdown Real-time Preview)

一个本地、跨平台的 Markdown 实时预览工具，支持浏览器离线使用。提供与主流网站相似的预览体验，并支持所见即所得的 PDF 导出。

## 🌟 核心特性 (Features)

- **实时预览**：左侧编辑，右侧即时渲染，使用体验丝滑流畅。
- **暗黑模式**：内置亮色/暗色两套舒适的主题，随心切换。
- **同步滚动**：编辑区和预览区双向同步滚动，随时掌控阅读位置。
- **一键导出 PDF**：所见即所得的高质量 PDF 导出，无论亮色还是暗色主题导出的表现始终如一。
- **内容保护**：数据保存在本地浏览器中，绝不上传云端，确保隐私安全。
- **一键复制**：快速复制渲染后的富文本内容或源代码。
- **桌面应用**：支持 Windows (Win 7+) 和 macOS 安装，提供更深度的本地使用体验。

## 📥 桌面版下载 (Desktop Downloads)

您可以从 [GitHub Releases](https://github.com/pumpkinpieuncle/markdown-realtime-preview/releases) 页面下载最新版本的安装包。

- **Windows**: 支持 Win 7, 8, 10, 11 (提供 32 位和 64 位版本)。
- **macOS**: 支持 Apple Silicon (M1/M2/M3) 和 Intel 芯片。

### 环境要求
- [Node.js](https://nodejs.org/) >= 14.x

### 安装与运行

1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npm run dev
   ```
3. 构建生产版本：
   ```bash
   npm run build
   ```
   *构建后会生成单文件(Single File)到 `dist` 目录，您只需打开 `index.html` 即可随时随地使用！*

## 🛠️ 技术栈 (Tech Stack)

- 构建工具：[Vite](https://vitejs.dev/)
- 编辑器核心：[CodeMirror 6](https://codemirror.net/)
- Markdown 解析：[Marked](https://marked.js.org/)
- 代码高亮：[Highlight.js](https://highlightjs.org/)
- 防 XSS 注入：[DOMPurify](https://github.com/cure53/DOMPurify)
- PDF 导出：[html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)

## 📝 开源协议 (License)

[MIT License](LICENSE)

import Split from 'split.js';
import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import html2pdf from 'html2pdf.js';

// CodeMirror imports
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';

// Initialize Marked with Highlight.js
const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

marked.setOptions({
  breaks: true,
  gfm: true
});

// Initialize Split Window
Split(['#editor-container', '#preview-container'], {
  sizes: [50, 50],
  minSize: [200, 300],
  gutterSize: 8,
  cursor: 'col-resize'
});

const defaultContent = `# 欢迎使用 Markdown 实时预览

一款界面惊艳、完全本地运行的优质 Markdown 编辑器体验。

## ✨ 特性

- **实时预览**：边写边看，所见即所得。
- **语法高亮**：支持代码块的精美排版。
- **暗色模式**：为您打造的优质深色视觉体验。
- **分栏布局**：自由调整编辑和预览区域。
- 支持 \`GFM\`（GitHub Flavored Markdown）。

### 🚀 代码示例

\`\`\`javascript
const greeting = "你好，世界！";
console.log(greeting);

function calculate(a, b) {
  return a + b;
}
\`\`\`

### 📝 亲自试一试
在左侧面板编辑内容，右侧就会神奇地实时渲染！
`;

// Render Markdown logic
const previewEl = document.getElementById('preview');

function updatePreview(val) {
  // Marked parse returns a string or promise depending on options, but here it's sync
  const htmlResult = marked.parse(val);
  const cleanHtmlResult = DOMPurify.sanitize(htmlResult);
  previewEl.innerHTML = cleanHtmlResult;
}

// Initialize CodeMirror 6 Editor
const updateListener = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    const doc = update.state.doc.toString();
    updatePreview(doc);
    // Optionally save to localStorage
    localStorage.setItem('markdown-content', doc);
  }
});

const savedContent = localStorage.getItem('markdown-content') || defaultContent;
const savedTheme = localStorage.getItem('theme') || 'dark';

const themeConfig = new Compartment();

const state = EditorState.create({
  doc: savedContent,
  extensions: [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    highlightActiveLine(),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap
    ]),
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    // Use themeConfig for dynamic theme switching
    themeConfig.of(savedTheme === 'dark' ? oneDark : []),
    updateListener,
    EditorView.theme({
      "&": { height: "100%", outline: "none", backgroundColor: "var(--pane-bg)", color: "var(--text-main)" },
      ".cm-scroller": { fontFamily: "'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
      ".cm-content": { padding: "20px 0" },
      ".cm-gutters": { backgroundColor: "var(--header-bg)", color: "var(--text-muted)", borderRight: "1px solid var(--header-border)" }
    })
  ]
});

const view = new EditorView({
  state,
  parent: document.getElementById('editor-container')
});

// Add Sync Scroll logic
const editorScroller = document.querySelector('.cm-scroller');
const previewContainer = document.getElementById('preview-container');

let isSyncingLeft = false;
let isSyncingRight = false;
const syncScrollCheckbox = document.getElementById('sync-scroll-checkbox');

function syncScroll(source, target, isSourceFlag, isTargetFlag) {
  if (!syncScrollCheckbox.checked) return;
  if (isSourceFlag) {
    isSourceFlag = false;
    return;
  }
  isTargetFlag = true;

  const percentage = source.scrollTop / (source.scrollHeight - source.clientHeight);
  target.scrollTop = percentage * (target.scrollHeight - target.clientHeight);
}

// Editor scroll
if (editorScroller) {
  editorScroller.addEventListener('scroll', () => {
    syncScroll(editorScroller, previewContainer, isSyncingLeft, isSyncingRight);
  });
}

// Preview scroll
previewContainer.addEventListener('scroll', () => {
  if (editorScroller) {
    syncScroll(previewContainer, editorScroller, isSyncingRight, isSyncingLeft);
  }
});


// Button actions
document.getElementById('reset-button').addEventListener('click', () => {
  if (confirm('您确定要重置编辑器吗？所有内容都将被清空。')) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: defaultContent }
    });
  }
});

document.getElementById('copy-button').addEventListener('click', () => {
  const content = view.state.doc.toString();
  navigator.clipboard.writeText(content).then(() => {
    const btn = document.getElementById('copy-button');
    btn.textContent = '已复制！';
    setTimeout(() => btn.textContent = '复制', 2000);
  });
});

document.getElementById('export-button').addEventListener('click', () => {
  const element = document.getElementById('preview');
  const opt = {
    margin: 1,
    filename: 'document.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // 导出 PDF 前暂时切换到亮色模式
  const originalTheme = document.documentElement.getAttribute('data-theme');
  document.documentElement.removeAttribute('data-theme');

  // 给浏览器一点时间应用亮色模式的样式
  setTimeout(() => {
    html2pdf().set(opt).from(element).save().then(() => {
      // 导出完成后恢复原主题
      if (originalTheme) {
        document.documentElement.setAttribute('data-theme', originalTheme);
      }
    });
  }, 100);
});

// Theme Management
const themeCheckbox = document.getElementById('theme-checkbox');

function updateTheme(isDark) {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  if (typeof view !== 'undefined') {
    view.dispatch({
      effects: themeConfig.reconfigure(isDark ? oneDark : [])
    });
  }
}

// Initialize Theme
themeCheckbox.checked = savedTheme === 'dark';
updateTheme(savedTheme === 'dark');

themeCheckbox.addEventListener('change', (e) => {
  updateTheme(e.target.checked);
});


# my-drawing-tool

一个基于 React Flow、Tailwind CSS 和 Ant Design 的 AI 工作流构建器。支持离线可编辑、撤销/重做和命名草稿管理。

## 功能特性
- 工作流画布：使用 React Flow 构建和连接自定义节点（Text to Text、Text to Image）。
- 撤销/重做：支持工具栏按钮与快捷键。
	- 撤销：`Ctrl + Z`
	- 重做：`Ctrl + Shift + Z` 或 `Ctrl + Y`
- 拖动优化：历史记录智能处理，减少拖动抖动/闪烁。
- 视图居中：进入时自动居中，默认缩放为 `0.5`。
- 节点样式：Tailwind 布局 + AntD 控件；绿色/蓝色描边；连接点小方块清晰可见。
- 离线能力：Service Worker 对应用壳进行缓存，支持离线运行。
- 持久化编辑：自动将 `nodes/edges` 保存到 IndexedDB（无法使用时回退 localStorage）。
- 草稿管理：通过 AntD 弹窗保存/加载/删除/重命名命名草稿。
- 更新提示：检测到新版本时弹窗提醒刷新页面。

## 技术栈
- React 19 + TypeScript
- @xyflow/react（React Flow）
- Ant Design 6
- Tailwind CSS（实用类样式）
- IndexedDB（草稿与状态持久化）
- Service Worker（基础离线支持）
- PWA（支持安装置桌面）

## 快速开始
1. 安装依赖：
	 ```powershell
	 npm install
	 ```
2. 启动开发环境：
	 ```powershell
	 npm start
	 ```
3. 生产构建：
	 ```powershell
	 npm run build
	 ```
4. 预览生产构建（可选）：
	 ```powershell
	 npx serve -s build
	 ```

### 快捷启动脚本（Windows）
- 脚本路径：`scripts/quick-start.ps1`
- 功能：检测 Node/npm、自动安装依赖（如未安装）、启动开发服务器。
- 运行方式：
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\quick-start.ps1
  ```
- 或使用 npm 脚本别名：
  ```powershell
  npm run quick-start
  ```

## 使用说明
- 编辑
	- 拖拽节点进行布局；通过两侧连接点创建边。
	- 节点内使用 AntD 控件编辑指令、长宽比与模型选择。
- 撤销 / 重做
	- 使用工具栏按钮或快捷键进行操作。
- 离线与持久化
	- 编辑会自动本地保存；下次进入优先从 IndexedDB 恢复。
	- Service Worker 缓存应用壳，离线可运行。
- 草稿
	- Save Draft：将当前画布保存为命名草稿。
	- Manage Drafts：列出、加载、删除、重命名草稿。
- 更新提示
	- 检测到新版本后，将弹窗提示刷新以应用更新。

## 快捷键
- `Ctrl + Z`：撤销
- `Ctrl + Shift + Z` / `Ctrl + Y`：重做

## 项目结构
```
package.json
postcss.config.js
README.md
tailwind.config.js
tsconfig.json
public/
	index.html
	manifest.json
	robots.txt
	service-worker.js
src/
	App.tsx
	AppStyles.css
	FlowCanvas.tsx
	index.css
	index.tsx
	components/
		TextToTextNode.tsx
		TextToImageNode.tsx
		NodeStyles.css
	hooks/
		useHistoryState.ts
	storage/
		indexedDb.ts
```

## 备注
- 草稿持久化优先使用 IndexedDB；若不可用则回退到 localStorage。
- 当前 Service Worker 采用较简单的应用壳缓存策略；如有 API/数据缓存需求请按实际情况调整。
- Tailwind 用于布局与间距，Ant Design 提供表单控件与弹窗。

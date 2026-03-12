<!-- <p align="center">
  <img src="public/preview.png" alt="Plugin Preview">
</p> -->

# 🗺️ ChatGPT 对话滚动地图插件

> English version: [README.en.md](./README.en.md)

为你的 AI 对话添加一个交互式的滚动地图。**仅支持 ChatGPT。**

## 如何使用
1. 推荐从 Chrome 商店安装：[前往安装](https://chromewebstore.google.com/detail/ickndngbbabdllekmflaaogkpmnloalg?utm_source=item-share-cb)
2. 或手动安装：打开 `chrome://extensions/`，开启开发者模式，点击“加载已解压的扩展程序”，选择 `extension/` 文件夹。
3. 打开 ChatGPT 的任意会话页面。
4. 使用右侧滚动地图圆点快速跳转到对应用户消息。
5. 长按圆点可标记/取消标记重点。
6. 在弹窗中可进行全局开关和 ChatGPT 开关。

## 兼容性说明
- 当前仅在 macOS 环境下测试使用。
- Windows 兼容性暂未验证，当前未知。

## 本 Fork 的改动
- 圆点位置改为基于整页可滚动高度比例计算，最后一个问题下方的回答区域会自然保留空白比例。
- 视觉层改为贴近右侧原生滚动条的 Overlay 样式，不替换原生滚动行为。
- 圆点视觉细化：尺寸缩小，当前问题改为蓝色激活态，去掉原先突兀的放大效果。
- 项目名称与文档从 “Timeline/时间轴” 统一调整为 “Scrollmap/滚动地图”。
- 适配范围收敛为仅 ChatGPT。

## 更新记录（简）
- 新增问题时间展示：圆点提示内容会优先显示该问题的提出时间（若页面可解析到时间信息）。
- 移除 `+` 菜单“会话压缩助手”功能（当前版本暂不提供该入口）。
- 调整高亮触发策略：切换到新会话页后不再自动高亮，需用户主动滚动/点击后才同步当前问题高亮。
- 优化圆点悬停提示性能：将重计算合并为每帧一次，并简化 tooltip 文本测量路径，减少大量圆点时的悬停卡顿。

## 后续计划
- 将加入飞书网页版中与 OpenClaw 对话场景的支持。

## 致谢
本 Fork 基于原开源项目：[Reborn14/chatgpt-conversation-timeline](https://github.com/Reborn14/chatgpt-conversation-timeline)。

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 协议。

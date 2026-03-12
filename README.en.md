<!-- <p align="center">
  <img src="public/preview.png" alt="Plugin Preview">
</p> -->

# 🗺 ChatGPT Conversation Scrollmap Extension

> 中文文档: [README.md](./README.md)

An extension that adds an interactive scrollmap to your AI chat conversations. **Supports ChatGPT only.**

## How to Use
1. Install manually: open `chrome://extensions/`, enable Developer Mode, click `Load unpacked`, and select the `extension/` folder.
2. Open any conversation page on ChatGPT.
3. Use the right-side scrollmap markers to jump to a user message.
4. Long-press a marker to star/unstar it.
5. Use the popup to enable/disable globally and for ChatGPT.

## Compatibility Notes
- Tested on macOS only.
- Windows compatibility is currently unknown and unverified.

## What Changed in This Fork
- Marker positions are now proportional to the full page scroll height, so the blank answer area under the last user message is preserved.
- The UI now uses an overlay-style visual merge with the right-side native scrollbar path.
- Marker visuals were tuned: smaller dots and a blue active marker without the previous enlarged active effect.
- Naming and docs were updated from "Timeline" to "Scrollmap".
- Provider scope was reduced to ChatGPT only.

## Acknowledgements
This fork is based on the original open-source project: [Reborn14/chatgpt-conversation-timeline](https://github.com/Reborn14/chatgpt-conversation-timeline).

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

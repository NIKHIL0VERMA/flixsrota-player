# 🎬 Flixsrota Player

A distraction free(without recommendations, share buttons, or channel overlays) implementation of youtube video player. Future versions will integrate with the upcoming Flixsrota Video Server, enabling adaptive streaming


---

## 🖼️ Preview

<p align="center">
  <img src="./assets/youtube_player.jpg" width="200" />
  <img src="./assets/controls.jpg" width="200" />
  <img src="./assets/skip_gesture.jpg" width="200" />
</p>
<p align="center">
  <img src="./assets/fullscreen_player.jpg" width="600" />
</p>
<p align="center">
  <img src="./assets/youtube_player2.jpg" width="200" />
  <img src="./assets/buffering.jpg" width="200" />
  <img src="./assets/paused.jpg" width="200" />
</p>

---


## ✨ Features
- 🎥 Play YouTube videos by **ID**
- 📱 Works on **React Native CLI** and **Expo**
- 🔄 Fullscreen toggle with orientation lock
- ▶️⏸️ Play / Pause controls
- 🔇🔊 Mute / Unmute support
- 🎚️ Gesture & slider-based seeking
- ⚡ Lightweight and easy-to-use
- 🛠️ Supports hooks for player state (ready, video states, current time, and total duration, etc.)


---

## 📦 Installation

### 1. Install the package
Using **npm**:
```bash
npm install @flixsrota/player
```

Using **yarn**:
```bash
yarn add @flixsrota/player
```

### 2. Install peer dependencies

This library uses several components. Install them based on your ecosystem:

#### ✅ Expo
```bash
npx expo install @react-native-community/slider react-native-webview expo-screen-orientation @expo/vector-icons
```

#### ✅ React Native CLI
```bash
npm install @react-native-community/slider react-native-webview react-native-orientation-locker @react-native-vector-icons/ionicons
# or
yarn add @react-native-community/slider react-native-webview react-native-orientation-locker @react-native-vector-icons/ionicons
```

---

## ⌨️ Web Shortcuts

When using the player on the web, you can use the following keyboard shortcuts for a seamless experience:

| Shortcut | Action |
| :--- | :--- |
| **`Space`** | Play / Pause |
| **`f`** | Toggle Fullscreen |
| **`Ctrl`** + **`m`** | Mute / Unmute |
| **`Ctrl`** + **`Arrow Right`** | Seek Forward 10s |
| **`Ctrl`** + **`Arrow Left`** | Seek Backward 10s |

---

## 🚀 Usage

```tsx
import { View, Text } from "react-native";
import { PlayerView } from "@flixsrota/player";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <PlayerView videoId="_cMxraX_5RE", bundleId="my.bundle.id" />
      <Text>Flixsrota Player Example</Text>
    </View>
  );
}
```

---

## 📂 Project Structure

```
├── assets/                # Images for preview & docs
├── example/               # Example Expo app
├── lib/                   # Build output (JS + types)
│   ├── module/            # Compiled JavaScript (for publishing)
│   └── typescript/        # TypeScript declaration files
├── src/                   # Source code (TypeScript)
│   └── __tests__/         # Tests (need to be implemented)
├── .github/               # Contribution configs (CI/CD, hooks)
```
---

## 🤝 Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

---

## 🗣️ Discussions & Feature Requests

📢 **Important:** We do not accept feature requests or questions via issues.  
If you want to request a feature or need help, please use **GitHub Discussions** only:

- 💡 [Request a Feature](https://github.com/NIKHIL0VERMA/flixsrota-player/discussions/new?category=ideas)  
- 💬 [Ask a Question / General Discussion](https://github.com/NIKHIL0VERMA/flixsrota-player/discussions)

This ensures issues are only used for bug reports and development tasks.

---

## 📜 License

MIT © [Nikhil Verma](https://github.com/NIKHIL0VERMA)
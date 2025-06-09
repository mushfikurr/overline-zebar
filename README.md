# overline-zebar

A fully featured custom widget for [Zebar](https://github.com/glzr-io/zebar).

![Screenshot of overline-zebar in use with GlazeWM, Zen Browser underneath](https://github.com/user-attachments/assets/333feb9c-225d-4be9-84db-cbdc7010e698)

## Features

- **Media Controls**
  - Click to **play/pause**
  - Shift + Click to **go to the previous track**
  - Ctrl + Click to **go to the next track**
- **Workspace Display**
  - Click to **focus on a workspace**
  - Scroll to **switch between workspaces**
- **System Tray**
  - Interact with left and right click
  - Expand the tray with Shift + Click
- **Search and Tiling Direction Controls**
- **Volume Control**
  - Click to **open volume slider**
  - Scroll to **adjust volume**
  - Shift + Click to **toggle mute**
- **Current Window Display**
  - Click to **reveal window controls**
  - Hover over controls to see their function

---

## Installation

**For releases older than Zebar v3, refer to [this branch](https://github.com/mushfikurr/overline-zebar/tree/old/zebar-v2).**

Note: If you have local branches from the older branch, the layout has changed:

```
main -> old/zebar-v2  
migrate/zebar-v3 -> main
```

### Option 1: The Zebar Marketplace

1. Right-click the Zebar tray icon, and click **Browse Widgets**  
2. Search for **"overline-zebar"**  
3. Click **Install**  
4. Continue to the [Configuration](#configuration) section

### Option 2: Build from Source

Choose this option if you want to:

- Customize the widget's functionality beyond what is possible with the pre-built version
- Modify the source code to add new features or change existing ones
- Contribute to the development of overline-zebar
- Use the latest development version with unreleased features

**Prerequisites:**

- [Node.js](https://nodejs.org/) (v16 or newer)
- [Git](https://git-scm.com/)

**Steps:**

1. Clone the repository to your local machine inside the `.glzr` directory (e.g., `C:/Users/<USER>/.glzr/zebar` on Windows):

    ```sh
    git clone https://github.com/mushfikurr/overline-zebar.git
    cd overline-zebar
    ```

2. Install all required dependencies:

    ```sh
    npm install
    ```

    This will install React, Vite, TailwindCSS, and all other dependencies needed for development.

3. See the [Configuration](#configuration) section below for details on how to customize the widget by editing the `public/config.json` file.

4. Build the project for production:

    ```sh
    npm run build
    ```

    This creates a `dist` folder containing the compiled widget ready for use.

---

## Configuration

You can customize various aspects of overline-zebar by editing the `config.json` file. This allows you to change settings without modifying the source code.

### General Configuration

For general Zebar widget configuration:

- Right-click the Zebar tray icon  
- Go to **Widget Packs > overline-zebar > Pack Settings**

**Recommended:** Adapt the width of Zebar to your gap and screen resolution.

### overline-zebar Configuration

- **For pre-built version users**, navigate to:

    ```
    C:\Users\<username>\.glzr\zebar\overline-zebar\dist\public\
    ```

- **For developers building from source**, navigate to:

    ```
    public/
    ```

#### Configuration Values

```json
"FLOW_LAUNCHER_PATH": "C:\\Users\\msy\\AppData\\Local\\FlowLauncher\\Flow.Launcher.exe",
"USE_AUTOTILING": true,
"AUTOTILING_WEBSOCKET_URI": "ws://localhost:6123",
"MEDIA_MAX_WIDTH": "300"
```

- `FLOW_LAUNCHER_PATH` - `string`: Path to the `.exe` for the "search button" to open. This can be any launcher (e.g., Powertoys Run).
- `USE_AUTOTILING` - `boolean`: Defaults to `true`. Changes tiling direction when a window reaches half its size.
- `AUTOTILING_WEBSOCKET_URI` - `string`: Defaults to `ws://localhost:6123`. Where Zebar listens for events from GlazeWM.
- `MEDIA_MAX_WIDTH` - `string`: Defaults to `400`. Max width of the Media widget (now playing display) in pixels. Recommended to be greater than 100.

### Fonts (Development Only)

Fonts are defined in [`src/styles/fonts.css`](src/styles/fonts.css).

- Use system fonts directly
- Or download fonts to the `public/` folder and reference them in `fonts.css`
- By default it targets monospaced fonts, but this can be changed in `App.tsx`
- [Font reference](https://developer.mozilla.org/en-US/docs/Web/CSS/font)

### Colors (Development Only)

- Edit [`tailwind.config.js`](tailwind.config.js) and [`src/styles/theme.css`](src/styles/theme.css) to customize colors

---

## See Live Changes to Zebar (Development Only)

Follow the steps to build the project from source.

1. Start the build process with hot reloading:

    ```sh
    npm run build:watch
    ```

2. Edit code — Zebar will automatically restart on save (if the widget is selected in Zebar).
3. Enable auto-save in your text editor for faster iteration.

---

## Contributions

Pull requests are welcome. If you find any issues or have feature suggestions, feel free to open an issue on GitHub.


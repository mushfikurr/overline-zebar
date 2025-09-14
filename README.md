![Screenshot of overline-zebar in use with GlazeWM, previewing multiple themes and rounded settings](https://github.com/user-attachments/assets/08b4be9a-e405-4217-814b-aac7acd6e0f5)

# overline-zebar

A fully featured, highly customizable widget pack for [Zebar](https://github.com/glzr-io/zebar). Works in tandem with GlazeWM, perfect for making Windows look great 🌠

<img width="2124" height="437" alt="System stats widget, hovering from the main widget" src="https://github.com/user-attachments/assets/2846a6ec-8268-4fc0-bed4-1ff6bdb4df55" />
<img width="1145" height="785" alt="Config widget window, centered on the screen" src="https://github.com/user-attachments/assets/e7536236-3e15-4066-b996-b90eb4f183d7" />

To install: [Installation](#installation)

## About The Project

This repository is a monorepo containing multiple widgets and packages that work together to provide a seamless and feature-rich experience for Zebar.

### Project Structure

The project is organized into two main directories:

- `packages/`: Contains shared code and components used across different widgets.
  - `config`: Manages configuration for all widgets.
  - `ui`: A component library with shared React components.
  - `tailwind`: Shared Tailwind CSS configuration.
  - `typescript`: Shared TypeScript configuration.
- `widgets/`: Contains the individual widgets that can be used with Zebar.
  - `main`: The main topbar widget.
  - `system-stats`: A widget to display system statistics.
  - `config-widget`: A graphical user interface to configure all widgets.
  - `script-launcher`: A widget to quickly launch custom scripts.

## Features

### Main Widget

The main widget is a topbar that provides a variety of features:

- **Media Controls**: Play/pause, skip tracks, and cycle through media sessions.
- **Workspace Display**: View and switch between workspaces, with an option for dynamic workspace names.
- **System Tray**: Interact with system tray icons, with the ability to pin icons.
- **Search and Tiling Direction Controls**: Quickly access your launcher and toggle tiling direction.
- **Volume Control**: Adjust volume, mute/unmute, and open a volume slider.
- **Current Window Display**: View the current window title and access window controls.
- **System Stats**: A summary of CPU, RAM, and weather information, which opens the `system-stats` widget on click.
- **Date/Time**: Displays the current date and time, and opens the `config-widget` on click.

### System-Stats Widget

This widget provides a detailed view of your system's statistics, including:

- **Host Information**: OS, hostname, uptime, and battery information.
- **Storage**: A list of all connected drives with their usage.
- **Performance**: CPU and memory usage details.
- **Network**: Detailed information about network interfaces, traffic, and addresses.

### Config Widget

A comprehensive GUI for configuring all aspects of the widgets, from appearance to functionality. See the [Configuration](#configuration) section for more details.

### Script-Launcher Widget

A simple but powerful widget that allows you to define and quickly run custom shell commands or scripts. Access the main **config-widget** by clicking the settings (gear) icon in the bottom right.

## Installation

### Option 1: The Zebar Marketplace (Recommended)

1.  Right-click the Zebar tray icon, and click **Browse Widgets**.
2.  Search for **"overline-zebar"**.
3.  Click **Install**.
4.  Continue to the [Configuration](#configuration) section.

### Option 2: Build from Source

Choose this option if you want to customize the widget's functionality, modify the source code, or contribute to the development.

**Prerequisites:**

- [Node.js](https://nodejs.org/) (v16 or newer)
- [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)

**Steps:**

1.  Clone the repository to your local machine inside the `.glzr` directory (e.g., `C:/Users/<USER>/.glzr/zebar` on Windows):

    ```sh
    git clone https://github.com/mushfikurr/overline-zebar.git
    cd overline-zebar
    ```

2.  Install all required dependencies using pnpm:

    ```sh
    pnpm install
    ```

3.  Build the project for production:

    ```sh
    pnpm --filter "@overline-zebar/*" build
    ```

    This creates a `dist` folder in each widget's directory, containing the compiled widget ready for use.

4.  See the [Configuration](#configuration) section below for details on how to customize the widgets.

## Configuration

`overline-zebar` is highly configurable through the **config-widget**. To open it, simply click on the date and time in the main topbar widget.

### (!) For Zebar specific settings

To configure zebar specific settings when downloading from marketplace, you must copy the downloaded widget from:

`%appdata%/zebar/downloads` -> `C:/Users/<username>/.glzr/zebar/`

This will save the widget to a custom pack. You will now be able to configure the widget through the `zpack.json` file.

The config-widget itself provides a user-friendly interface to manage internal widget settings. Keep in mind it is not 1:1 with the Zebar settings. 

Here's a breakdown of the available options:

### General

- **Enable Auto Tiling**: Automatically changes the tiling direction when a window reaches half its size.
- **Zebar WebSocket URI**: The address where Zebar listens for events from GlazeWM.

### Appearance

- **Border Radius**: Adjust the roundness of elements.
- **Theme**: Choose from a list of preset themes (including Catppuccin variants) or generate your own from a single color. The theme generator creates a rich, varied palette with distinct shades and high-contrast, tinted text, ensuring both readability and a unique aesthetic. The theme editor allows you to:
  - Select, add, and delete themes.
  - Customize every color in the theme with a color picker and eye-dropper.
  - Preview changes in real-time.

### Config Management

- **Export Configuration**: Download your current settings as a JSON file.
- **Import Configuration**: Load settings from a JSON file.
- **Reset Configuration**: Restore all settings to their default values.

### Widget Specific > Main (Topbar)

#### General

- **Launcher Path**: The file path to your preferred application launcher (e.g., Flow Launcher, PowerToys Run).
- **Allow Dynamic Workspace Indicators**: If enabled, workspace indicators will be named after the first opened window in that workspace.
- **Horizontal Margin**: Adds space to the left and right of the topbar for a "floating" look.
- **Left/Right Padding**: Adjusts the inner spacing on the left and right ends of the topbar independently.
- **Media Max Width**: Sets the maximum width for the media display.

#### Stats

- **Providers**: Enable or disable individual system stat providers (CPU, Memory, Weather).
- **Toggle Fahrenheit**: Switch between Celsius and Fahrenheit for the weather display.
- **Thresholds**: Customize the display colors for different temperature ranges. By default, there are four configurable thresholds, each with a minimum and maximum temperature value. The available colors (Danger, Warning, and Text) are derived from your chosen theme.

#### System Tray

- **Pinned Icons**: Select which icons should remain visible when the system tray is collapsed. You can toggle the collapsed state by Shift-clicking the system tray icons.

### Widget Specific > Script Launcher

- **Accessing Configuration**: Open the main **config-widget** by clicking the settings (gear) icon in the bottom right of the script launcher.
- **Scripts**: Add, edit, and remove custom scripts. Each script has a name (which is displayed in the widget) and a shell command to be executed.

## Development

To see live changes during development, follow the steps to build from source:

```sh
pnpm run build
```

This command will build all monorepo packages and widgets. To work on a specific widget, run:

```sh
pnpm run build:watch --filter <widget-name>
```

This will start the development server for all widgets with hot reloading. Zebar will automatically restart on save if the widget is selected.

## Contributions

Pull requests are welcome. If you find any issues or have feature suggestions, feel free to open an issue on GitHub.


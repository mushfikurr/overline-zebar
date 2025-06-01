import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getFlowLauncherPath,
  getUseAutoTiling,
  getAutoTilingWebSocketUri,
  getMediaMaxWidth,
  getZebarBackgroundColor,
  getZebarBorderColor,
  getZebarBorderRadius,
  getZebarBorderWidth,
  getZebarHorizontalSpace,
  getZebarVerticalSpace,
} from "../utils/getFromEnv";

interface ConfigContextType {
  flowLauncherPath: string;
  useAutoTiling: boolean;
  autoTilingWebSocketUri: string;
  mediaMaxWidth: string;
  zebarBackgroundColor: string;
  zebarBorderColor: string;
  zebarBorderRadius: string;
  zebarBorderWidth: string;
  zebarHorizontalSpace: string;
  zebarVerticalSpace: string;
  isLoading: boolean;
}

const defaultConfig: ConfigContextType = {
  flowLauncherPath: "C:\\Program Files\\FlowLauncher\\Flow.Launcher.exe",
  useAutoTiling: false,
  autoTilingWebSocketUri: "ws://localhost:6123",
  mediaMaxWidth: "400",
  zebarBackgroundColor: "#1e2228CC",
  zebarBorderColor: "#4e5663CC",
  zebarBorderRadius: "8px",
  zebarBorderWidth: "1px",
  zebarHorizontalSpace: "4px",
  zebarVerticalSpace: "5px",
  isLoading: true,
};

const ConfigContext = createContext<ConfigContextType>(defaultConfig);

export const useConfig = () => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<ConfigContextType>(defaultConfig);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [
          flowLauncherPath,
          useAutoTiling,
          autoTilingWebSocketUri,
          mediaMaxWidth,
          zebarBackgroundColor,
          zebarBorderColor,
          zebarBorderRadius,
          zebarBorderWidth,
          zebarHorizontalSpace,
          zebarVerticalSpace,
        ] = await Promise.all([
          getFlowLauncherPath(),
          getUseAutoTiling(),
          getAutoTilingWebSocketUri(),
          getMediaMaxWidth(),
          getZebarBackgroundColor(),
          getZebarBorderColor(),
          getZebarBorderRadius(),
          getZebarBorderWidth(),
          getZebarHorizontalSpace(),
          getZebarVerticalSpace(),
        ]);

        setConfig({
          flowLauncherPath,
          useAutoTiling,
          autoTilingWebSocketUri,
          mediaMaxWidth,
          zebarBackgroundColor,
          zebarBorderColor,
          zebarBorderRadius,
          zebarBorderWidth,
          zebarHorizontalSpace,
          zebarVerticalSpace,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to load configuration:", error);
        setConfig((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

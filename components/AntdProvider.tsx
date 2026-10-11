"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, theme as antdTheme } from "antd";
import zhCN from "antd/locale/zh_CN";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: "light",
  toggleMode: () => undefined,
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

function applyHtmlTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.style.colorScheme = mode;
}

/** 浅色 / 深色两套 Ant Design 主题 token */
function buildTheme(mode: ThemeMode) {
  const isDark = mode === "dark";

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: "#3B5CFF",
      colorInfo: "#3B5CFF",
      colorText: isDark ? "#F2F2F2" : "#1A1A1A",
      colorTextSecondary: isDark ? "#A3A3A3" : "#666666",
      colorTextTertiary: isDark ? "#737373" : "#8C8C8C",
      colorBorder: isDark ? "#2A2A2A" : "#E8E8E8",
      colorBgLayout: isDark ? "#0F0F10" : "#F7F7F7",
      colorBgContainer: isDark ? "#171718" : "#FFFFFF",
      borderRadius: 12,
      fontFamily:
        'var(--font-display), "PingFang SC", "Microsoft YaHei", sans-serif',
      controlHeightLG: 52,
    },
    components: {
      Button: {
        borderRadius: 26,
        controlHeightLG: 52,
        fontWeight: 500,
      },
      Input: {
        borderRadius: 14,
        controlHeightLG: 52,
        paddingInlineLG: 18,
      },
      Menu: {
        itemBg: "transparent",
        horizontalItemSelectedColor: isDark ? "#F5F5F5" : "#1A1A1A",
        horizontalItemHoverColor: "#3B5CFF",
        darkItemBg: "transparent",
        darkItemSelectedBg: "transparent",
        activeBarHeight: 0,
        itemPaddingInline: 18,
      },
      Layout: {
        headerBg: isDark
          ? "rgba(15, 15, 16, 0.86)"
          : "rgba(255, 255, 255, 0.86)",
        bodyBg: "transparent",
        footerBg: isDark ? "#0F0F10" : "#FFFFFF",
      },
    },
  };
}

export default function AntdProvider({ children }: { children: ReactNode }) {
  // 与服务端默认一致：浅色，避免 hydration 错位
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("jianyu-theme");
    if (saved === "light" || saved === "dark") {
      setMode(saved);
      applyHtmlTheme(saved);
      return;
    }

    // 无本地记录时，跟随系统偏好，并写入本地以便下次一致
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: ThemeMode = prefersDark ? "dark" : "light";
    setMode(initial);
    applyHtmlTheme(initial);
    window.localStorage.setItem("jianyu-theme", initial);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === "light" ? "dark" : "light";
      window.localStorage.setItem("jianyu-theme", next);
      applyHtmlTheme(next);
      return next;
    });
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const contextValue = useMemo(
    () => ({ mode, toggleMode }),
    [mode, toggleMode]
  );

  return (
    <AntdRegistry>
      <ThemeModeContext.Provider value={contextValue}>
        <ConfigProvider locale={zhCN} theme={theme}>
          <App>{children}</App>
        </ConfigProvider>
      </ThemeModeContext.Provider>
    </AntdRegistry>
  );
}

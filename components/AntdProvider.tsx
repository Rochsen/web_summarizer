"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import type { ReactNode } from "react";

/** vivo 风格主题：留白、细腻圆角、品牌蓝 */
const theme = {
  token: {
    colorPrimary: "#3B5CFF",
    colorInfo: "#3B5CFF",
    colorText: "#1A1A1A",
    colorTextSecondary: "#666666",
    colorTextTertiary: "#8C8C8C",
    colorBorder: "#E8E8E8",
    colorBgLayout: "#F7F7F7",
    colorBgContainer: "#FFFFFF",
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
      horizontalItemSelectedColor: "#1A1A1A",
      horizontalItemHoverColor: "#3B5CFF",
      activeBarHeight: 0,
      itemPaddingInline: 18,
    },
    Layout: {
      headerBg: "rgba(255, 255, 255, 0.86)",
      bodyBg: "transparent",
      footerBg: "#FFFFFF",
    },
  },
};

export default function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider locale={zhCN} theme={theme}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}

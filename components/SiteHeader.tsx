"use client";

import {
  CloseOutlined,
  MenuOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useThemeMode } from "@/components/AntdProvider";

const { Header } = Layout;

const menuItems = [
  { key: "home", label: <a href="#top">首页</a> },
  { key: "feature", label: <a href="#feature">功能</a> },
  { key: "guide", label: <a href="#guide">使用指南</a> },
];

/**
 * vivo 风格顶栏：左品牌、导航居中、右侧深浅色切换
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { mode, toggleMode } = useThemeMode();
  const selectedKeys = useMemo(() => ["home"], []);
  const isDark = mode === "dark";

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <Header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-brand" aria-label="简阅首页">
          <Image
            src="/logo-mark.jpg"
            alt="简阅"
            width={36}
            height={36}
            className="site-brand__mark"
            priority
          />
          <span className="site-brand__name">简阅</span>
        </Link>

        {!isMobile && (
          <Menu
            mode="horizontal"
            selectedKeys={selectedKeys}
            items={menuItems}
            className="site-nav"
            disabledOverflow
            theme={isDark ? "dark" : "light"}
          />
        )}

        <div className="site-header__actions">
          {isMobile && (
            <button
              type="button"
              className="menu-trigger"
              aria-label={open ? "关闭菜单" : "打开菜单"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          )}
          <button
            type="button"
            className="theme-toggle"
            title={isDark ? "切换为浅色模式" : "切换为深色模式"}
            aria-label={isDark ? "切换为浅色模式" : "切换为深色模式"}
            onClick={toggleMode}
          >
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </button>
        </div>
      </div>

      {isMobile && open && (
        <div className="mobile-panel">
          <Menu
            mode="vertical"
            selectedKeys={selectedKeys}
            items={menuItems}
            theme={isDark ? "dark" : "light"}
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </Header>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import AiChatAssistant from "./ai/AiChatAssistant";
import styles from "./AdminShell.module.css";

export default function AdminShell({
  name,
  role,
  permissions,
  children,
}: {
  name: string;
  role: string;
  permissions: string[];
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("adm-sidebar-collapsed") === "1");
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      window.localStorage.setItem("adm-sidebar-collapsed", prev ? "0" : "1");
      return !prev;
    });
  }

  return (
    <div className={styles.shell}>
      <Sidebar permissions={permissions} collapsed={collapsed} onToggle={toggle} />
      <div className={`${styles.content} ${collapsed ? styles.contentCollapsed : ""}`}>
        <Topbar name={name} role={role} />
        <main className={styles.main}>{children}</main>
      </div>
      <CommandPalette />
      <AiChatAssistant permissions={permissions} />
    </div>
  );
}

"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import styles from "./Topbar.module.css";

export default function Topbar({ name, role }: { name: string; role: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isRootDashboard = pathname === "/admin";

  return (
    <header className={styles.topbar}>
      <div className={styles.leftGroup}>
        {!isRootDashboard && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.back()}
            title="Go back one step"
            aria-label="Go back one step"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back</span>
          </button>
        )}
        <div className={styles.searchHint}>
          Press <kbd className={styles.kbd}>Ctrl</kbd> + <kbd className={styles.kbd}>K</kbd> to search
        </div>
      </div>
      <div className={styles.right}>
        <ThemeToggle />
        <div className={styles.user}>
          <span className={styles.userName}>{name}</span>
          <span className={styles.userRole}>{role.replace(/_/g, " ")}</span>
        </div>
        {!isRootDashboard && (
          <button
            type="button"
            className={styles.exitBtn}
            onClick={() => router.back()}
            title="Exit page (Back)"
            aria-label="Exit page"
          >
            ✕
          </button>
        )}
        <button className={styles.logout} onClick={() => signOut({ callbackUrl: "/admin/login" })} type="button">
          Sign out
        </button>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { CSSProperties, ReactNode } from "react";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid var(--gb-border)",
        color: "var(--gb-text)",
        background: "var(--gb-surface)",
        fontWeight: 700,
      }}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid var(--gb-accent)",
        background: disabled ? "var(--gb-border-soft)" : "var(--gb-surface)",
        color: disabled ? "var(--gb-muted)" : "var(--gb-text)",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 2px 0 rgba(123,31,45,0.18)",
        transform: "translateY(0)",
        ...style,
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(1px)";
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid var(--gb-border)",
        borderRadius: 16,
        padding: 16,
        background: "var(--gb-surface)",
        boxShadow: "0 10px 24px rgba(43,17,23,0.08)",
        color: "var(--gb-text)",
      }}
    >
      {children}
    </div>
  );
}

export function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid var(--gb-border)",
        borderRadius: 14,
        background: "var(--gb-surface)",
      }}
    >
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
        <thead>
          <tr>
            {data.headers.map((h, idx) => (
              <th
                key={idx}
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderBottom: "1px solid var(--gb-border)",
                  background: "var(--gb-surface)",
                  color: "var(--gb-text)",
                  whiteSpace: "nowrap",
                  position: "sticky",
                  top: 0,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "var(--gb-surface)" : "var(--gb-row-alt)" }}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: 10,
                    borderBottom: "1px solid var(--gb-border-soft)",
                    whiteSpace: "nowrap",
                    color: "var(--gb-text)",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function HeaderNav() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--gb-border-soft)",
        padding: "14px 24px",
        position: "sticky",
        top: 0,
        background: "var(--gb-bg)",
        zIndex: 10,
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          padding: "0 16px",
        }}
      >
        <NavLink href="/">Home</NavLink>
        <NavLink href="/betslip">Betslip</NavLink>
        <NavLink href="/value">Value Screens</NavLink>
        <NavLink href="/performance">Performance</NavLink>
      </nav>
    </header>
  );
}

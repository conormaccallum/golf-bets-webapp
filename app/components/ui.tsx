"use client";

import Link from "next/link";
import { ReactNode } from "react";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #333",
        color: "white",
        background: "#111",
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
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid #fff",
        background: disabled ? "#333" : "#111",
        color: disabled ? "#999" : "white",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 2px 0 rgba(255,255,255,0.25)",
        transform: "translateY(0)",
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
        border: "1px solid #333",
        borderRadius: 16,
        padding: 16,
        background: "#000",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
        color: "white",
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
        border: "1px solid #333",
        borderRadius: 14,
        background: "#000",
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
                  borderBottom: "1px solid #333",
                  background: "#111",
                  color: "white",
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
            <tr key={i} style={{ background: i % 2 === 0 ? "#000" : "#141414" }}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #222",
                    whiteSpace: "nowrap",
                    color: "white",
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
        borderBottom: "1px solid #222",
        padding: "14px 24px",
        position: "sticky",
        top: 0,
        background: "#000",
        zIndex: 10,
      }}
    >
      <nav
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        {/* LEFT — LOGO */}
        <div>
          <img
            src="/logo.png"
            alt="Logo"
            style={{ height: 70, objectFit: "contain" }}
          />
        </div>

        {/* CENTER — NAV BUTTONS */}
        <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/value">Value Screens</NavLink>
          <NavLink href="/betslip">Betslip</NavLink>
          <NavLink href="/performance">Performance</NavLink>
        </div>

        {/* RIGHT — spacer */}
        <div />
      </nav>
    </header>
  );
}

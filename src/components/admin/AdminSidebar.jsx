import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, Briefcase, Settings, LogOut, MessageSquare, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAV = [
  { label: "Talentos", icon: Users, path: "/admin/talentos" },
  { label: "Vagas", icon: Briefcase, path: "/admin/vagas" },
  { label: "Mensagens", icon: MessageSquare, path: "/admin/mensagens" },
  { label: "Templates", icon: FileText, path: "/admin/templates" },
];

export default function AdminSidebar({ user }) {
  const { pathname } = useLocation();

  const handleLogout = () => base44.auth.logout("/");

  return (
    <aside style={{
      width: "240px", flexShrink: 0, height: "100vh", position: "sticky", top: 0,
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)",
      borderRight: "1px solid rgba(255,255,255,0.6)",
      boxShadow: "0 8px 32px rgba(10,10,10,0.05), inset -1px 0 0 rgba(10,10,10,0.04), inset 1px 1px 0 rgba(255,255,255,0.7)",
      display: "flex", flexDirection: "column", padding: "28px 16px",
      zIndex: 1,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: "40px", paddingLeft: "8px" }}>
        <img
          src="https://www.loglabdigital.com.br/wp-content/uploads/2026/07/log_full_.svg"
          alt="Log Lab"
          style={{ height: "34px", width: "auto", display: "block" }}
        />
        <div style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(10,10,10,0.45)", marginTop: "6px" }}>
          Portal Administrativo
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {NAV.map(({ label, icon: Icon, path }) => {
          const active = pathname === path || (pathname === "/admin" && path === "/admin/talentos");
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 16px", borderRadius: "10px", marginBottom: "4px",
                textDecoration: "none", transition: "all 180ms ease",
                borderLeft: active ? "3px solid #F5B800" : "3px solid transparent",
                background: active ? "rgba(245,182,0,0.15)" : "transparent",
                color: active ? "#0A0A0A" : "rgba(10,10,10,0.6)",
                fontFamily: "var(--font-inter)", fontWeight: active ? 600 : 500, fontSize: "14px",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(10,10,10,0.04)"; e.currentTarget.style.color = "#0A0A0A"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(10,10,10,0.6)"; }}}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        <div style={{ height: "1px", background: "rgba(10,10,10,0.06)", margin: "16px 0" }} />

        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "12px 16px", borderRadius: "10px",
          color: "rgba(10,10,10,0.3)", fontFamily: "var(--font-inter)", fontSize: "14px",
          cursor: "not-allowed",
        }}>
          <Settings size={16} />
          Configurações
        </div>
      </nav>

      {/* User footer */}
      <div style={{
        borderTop: "1px solid rgba(10,10,10,0.06)", paddingTop: "16px",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: "#F5B800", color: "#0A0A0A",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "13px", flexShrink: 0,
        }}>
          {(user?.full_name || user?.email || "A")[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#0A0A0A", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.full_name || user?.email}
          </div>
        </div>
        <button onClick={handleLogout} title="Sair" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(10,10,10,0.4)", padding: "4px", transition: "color 180ms ease" }}
          onMouseEnter={e => e.currentTarget.style.color = "#dc2626"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(10,10,10,0.4)"}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
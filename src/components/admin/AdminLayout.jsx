import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => { base44.auth.redirectToLogin("/admin"); });
  }, []);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid rgba(245,184,0,0.3)", borderTopColor: "#F5B800", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#111111" }}>
      <AdminSidebar user={user} />
      <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
        <Outlet />
      </main>
    </div>
  );
}
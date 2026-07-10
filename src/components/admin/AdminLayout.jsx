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
      .catch(() => { navigate('/login', { state: { returnTo: '/admin' }, replace: true }); });
  }, []);

  if (loading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #fafafa 0%, #fff8e7 50%, #fafafa 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-100px", left: "-80px", width: "400px", height: "400px", background: "#F5B600", opacity: 0.10, filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "-120px", right: "-60px", width: "380px", height: "380px", background: "#F5B600", opacity: 0.08, filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ width: "32px", height: "32px", border: "3px solid rgba(10,10,10,0.08)", borderTopColor: "#F5B800", borderRadius: "50%", animation: "spin 0.8s linear infinite", position: "relative", zIndex: 1 }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden", position: "relative",
      background: "linear-gradient(135deg, #fbfaf7 0%, #fff6dd 45%, #faf9f6 100%)",
      "--font-inter": "'Google Sans Flex', 'Inter', -apple-system, sans-serif",
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "fixed", top: "-140px", left: "160px", width: "480px", height: "480px", background: "linear-gradient(45deg, #F5B600, #ffd766)", opacity: 0.14, filter: "blur(110px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-160px", right: "-80px", width: "460px", height: "460px", background: "linear-gradient(45deg, #ffcf4d, #F5B600)", opacity: 0.12, filter: "blur(120px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "40%", right: "30%", width: "300px", height: "300px", background: "#0A0A0A", opacity: 0.025, filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

      <AdminSidebar user={user} />
      <main style={{ flex: 1, overflowY: "auto", padding: "32px", position: "relative", zIndex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
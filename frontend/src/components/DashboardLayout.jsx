import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const learnerNav = [
  { to: "/learner", icon: "⬡", label: "Overview" },
  { to: "/learner/portfolio", icon: "💼", label: "Portfolio" },
  { to: "/learner/trades", icon: "🔄", label: "Trades" },
  { to: "/learner/sessions", icon: "🎓", label: "Sessions" },
  { to: "/learner/reports", icon: "📊", label: "Reports" },
  { to: "/learner/my-tutor", icon: "🎓", label: "My Tutor" },
  { to: "/learner/subscription", icon: "💳", label: "Subscription" },
];

const tutorNav = [
  { to: "/tutor", icon: "⬡", label: "Dashboard" },
  { to: "/tutor/learners", icon: "👥", label: "My Learners" },
  { to: "/tutor/sessions", icon: "📅", label: "Sessions" },
  { to: "/tutor/feedback", icon: "⭐", label: "Feedback" },
  { to: "/tutor/reports", icon: "📊", label: "Reports" },
];

const adminNav = [
  { to: "/admin", icon: "⬡", label: "Overview" },
  { to: "/admin/users", icon: "👥", label: "Users" },
  { to: "/admin/payments", icon: "💰", label: "Payments" },
  { to: "/admin/plans", icon: "📋", label: "Plans" },
  { to: "/admin/assets", icon: "📈", label: "Assets" },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const navItems = user?.role === "tutor" ? tutorNav : user?.role === "admin" ? adminNav : learnerNav;
  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{
        width: open ? 220 : 64, background: "var(--bg2)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", padding: "20px 12px",
        transition: "width 0.25s ease", flexShrink: 0, overflow: "hidden"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, paddingLeft: 4 }}>
          <div style={{ width: 32, height: 32, background: "var(--green)", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📈</div>
          {open && <span style={{ fontWeight: 800, fontSize: 16, color: "#eef", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>TutorTrade</span>}
        </div>

        {/* Role badge */}
        {open && (
          <div style={{ marginBottom: 16, paddingLeft: 4 }}>
            <span className={`badge badge-${user?.role === "tutor" ? "blue" : user?.role === "admin" ? "amber" : "green"}`}>
              {user?.role}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {navItems.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to.split("/").length === 2}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                background: isActive ? "var(--green-bg)" : "transparent",
                borderRadius: 10, color: isActive ? "var(--green)" : "var(--text3)",
                fontWeight: isActive ? 600 : 400, fontSize: 14, transition: "all 0.15s",
                borderLeft: isActive ? "2px solid var(--green)" : "2px solid transparent",
                whiteSpace: "nowrap", overflow: "hidden"
              })}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>{n.icon}</span>
              {open && n.label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--green-bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "var(--green)", flexShrink: 0, border: "1px solid var(--green-border)" }}>
            {initials}
          </div>
          {open && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#dde", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <button onClick={handleLogout} style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)",
          padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <button onClick={() => setOpen(!open)}
            style={{ background: "transparent", border: "none", color: "var(--text3)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>☰</button>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
          </div>
        </header>
        {/* Page */}
        <main style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

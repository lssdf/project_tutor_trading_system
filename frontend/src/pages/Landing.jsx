import { useNavigate } from "react-router-dom";

const TEAM = [
  { name: "Harendra Godara", role: "CEO & Founder", exp: "15 yrs in equity markets", avatar: "HG", color: "#00e5a0" },
  { name: "M.D kaif", role: "Head of Tutors", exp: "Ex-NSE analyst, 12 yrs", avatar: "MD", color: "#57a8ff" },
  { name: "Harshita Rathod", role: "CTO", exp: "FinTech engineer, 10 yrs", avatar: "HR", color: "#ffb347" },
  { name: "Janvi Goud", role: "Lead Tutor — Crypto", exp: "Crypto trader since 2016", avatar: "JG", color: "#ff5757" },
  { name: "Himanshu Singh", role: "Product Manager", exp: "EdTech & finance, 8 yrs", avatar: "HS", color: "#c084fc" },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 60px", borderBottom: "1px solid var(--border)", background: "var(--bg2)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "var(--green)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📈</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#eef" }}>TutorTrade</span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {["Features", "Plans", "Team"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 14, color: "var(--text2)", fontWeight: 500, textDecoration: "none" }}>{l}</a>
          ))}
          <button className="btn btn-outline" onClick={() => navigate("/login")}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "110px 20px 70px", background: "radial-gradient(ellipse at 50% 0%, rgba(0,229,160,0.06) 0%, transparent 70%)" }}>
        <div style={{ display: "inline-block", background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: 20, padding: "6px 20px", fontSize: 13, color: "var(--green)", fontWeight: 600, marginBottom: 28, letterSpacing: "0.03em" }}>
          🚀 India's #1 Trading Education Platform
        </div>
        <h1 style={{ fontSize: 60, fontWeight: 800, color: "#eef", lineHeight: 1.1, marginBottom: 22, letterSpacing: "-0.02em" }}>
          Trade Smarter.<br /><span style={{ color: "var(--green)" }}>Learn Faster.</span>
        </h1>
        <p style={{ fontSize: 19, color: "var(--text2)", maxWidth: 580, margin: "0 auto 44px", lineHeight: 1.7 }}>
          Connect with expert trading tutors, track your live portfolio, analyze real-world trades, and grow with personalized 1-on-1 sessions.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <button className="btn btn-primary" style={{ padding: "14px 36px", fontSize: 16 }} onClick={() => navigate("/register")}>
            Start Free →
          </button>
          <button className="btn btn-outline" style={{ padding: "14px 36px", fontSize: 16 }} onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </section>

      {/* Stats */}
      <section style={{ display: "flex", justifyContent: "center", gap: 60, padding: "44px 60px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg2)", flexWrap: "wrap" }}>
        {[["500+", "Active Learners"], ["50+", "Expert Tutors"], ["₹2Cr+", "Portfolio Managed"], ["4.8★", "Avg Rating"]].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "var(--green)", fontFamily: "var(--mono)" }}>{v}</div>
            <div style={{ fontSize: 14, color: "var(--text2)", marginTop: 5 }}>{l}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "90px 60px" }}>
        <h2 style={{ textAlign: "center", fontSize: 38, fontWeight: 800, color: "#eef", marginBottom: 12 }}>Everything you need to succeed</h2>
        <p style={{ textAlign: "center", color: "var(--text2)", marginBottom: 56, fontSize: 16 }}>Real tools. Real tutors. Real results.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {[
            { icon: "📊", title: "Live Portfolio Tracking", desc: "Real-time prices from NSE, BSE, Crypto markets. See your holdings, P&L, and performance with live data." },
            { icon: "🎓", title: "Expert Tutors", desc: "Get matched with certified tutors specializing in stocks, crypto, forex & commodities." },
            { icon: "📅", title: "1-on-1 Sessions", desc: "Schedule personalized sessions. Your tutor reviews your trades and gives actionable feedback." },
            { icon: "📈", title: "Real Market Data", desc: "Trade with live Sensex, Nifty, BTC, ETH prices. Full candlestick charts and history included." },
            { icon: "📋", title: "Performance Reports", desc: "Monthly reports generated by your tutor with P&L analysis and improvement areas." },
            { icon: "💳", title: "Flexible Plans", desc: "Start free. Upgrade to Pro or Premium. Cancel anytime — no lock-in." },
          ].map(f => (
            <div key={f.title} className="card" style={{ transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, color: "#eef", marginBottom: 8, fontSize: 17 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" style={{ padding: "70px 60px", background: "var(--bg2)", borderTop: "1px solid var(--border)" }}>
        <h2 style={{ textAlign: "center", fontSize: 38, fontWeight: 800, color: "#eef", marginBottom: 12 }}>Simple Pricing</h2>
        <p style={{ textAlign: "center", color: "var(--text2)", marginBottom: 56 }}>Start free. Cancel anytime.</p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { name: "Basic", price: "₹0", desc: "Free forever", tag: null, features: ["Practice trading", "Portfolio tracking", "Trade history", "Live market prices"], highlight: false },
            { name: "Pro", price: "₹499", desc: "per month", tag: "Most Popular", features: ["Everything in Basic", "1 Tutor assigned", "Monthly sessions", "Performance reports", "Priority support"], highlight: true },
            { name: "Premium", price: "₹999", desc: "per month", tag: null, features: ["Everything in Pro", "Multiple tutors", "Unlimited sessions", "Full analytics", "Custom reports", "Direct chat"], highlight: false },
          ].map(p => (
            <div key={p.name} className="card" style={{ width: 290, border: p.highlight ? "2px solid var(--green)" : "1px solid var(--border)", background: p.highlight ? "linear-gradient(135deg, #0a2e20 0%, var(--bg3) 100%)" : "var(--bg3)" }}>
              {p.tag && <div className="badge badge-green" style={{ marginBottom: 12 }}>{p.tag}</div>}
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#eef" }}>{p.name}</h3>
              <div style={{ fontSize: 36, fontWeight: 800, color: p.highlight ? "var(--green)" : "#eef", margin: "12px 0 4px", fontFamily: "var(--mono)" }}>{p.price}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 22 }}>{p.desc}</div>
              <ul style={{ listStyle: "none", marginBottom: 26 }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontSize: 14, color: "var(--text)", padding: "6px 0", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--green)", marginTop: 1 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className={`btn ${p.highlight ? "btn-primary" : "btn-outline"}`} style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("/register")}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Our Team */}
      <section id="team" style={{ padding: "90px 60px" }}>
        <h2 style={{ textAlign: "center", fontSize: 38, fontWeight: 800, color: "#eef", marginBottom: 12 }}>Our Team</h2>
        <p style={{ textAlign: "center", color: "var(--text2)", marginBottom: 56, fontSize: 16 }}>Experienced traders and educators who built TutorTrade for you.</p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", maxWidth: 1000, margin: "0 auto" }}>
          {TEAM.map(m => (
            <div key={m.name} className="card" style={{ width: 180, textAlign: "center", transition: "transform 0.2s, border-color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = m.color + "60"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: m.color + "18", border: `2px solid ${m.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: m.color, margin: "0 auto 14px" }}>
                {m.avatar}
              </div>
              <div style={{ fontWeight: 700, color: "#eef", fontSize: 15, marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: m.color, fontWeight: 600, marginBottom: 6 }}>{m.role}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>{m.exp}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #0a2e20 0%, var(--bg2) 100%)", borderTop: "1px solid var(--green-border)", padding: "70px 60px", textAlign: "center" }}>
        <h2 style={{ fontSize: 38, fontWeight: 800, color: "#eef", marginBottom: 16 }}>Ready to start trading smarter?</h2>
        <p style={{ color: "var(--text2)", marginBottom: 36, fontSize: 16 }}>Join 500+ learners who are growing with expert guidance.</p>
        <button className="btn btn-primary" style={{ padding: "14px 44px", fontSize: 17 }} onClick={() => navigate("/register")}>
          Create Free Account →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: "30px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text3)", fontSize: 13, borderTop: "1px solid var(--border)", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📈</span>
          <span style={{ fontWeight: 700, color: "#eef" }}>TutorTrade</span>
        </div>
        <span>© 2026 TutorTrade. All rights reserved.</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Contact"].map(l => <a key={l} href="#" style={{ color: "var(--text3)", textDecoration: "none" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}

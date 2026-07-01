import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_PROFILES = [
  { id: 2, name: "Aisha Nkrumah", age: 26, bio: "Architect by day, salsa dancer by night. I believe great design and great conversation share the same bones.", location: "Brooklyn, NY", distance: "2 mi", interests: ["Architecture", "Salsa", "Jazz", "Coffee"], photos: ["https://i.pravatar.cc/400?img=47"], verified: true },
  { id: 3, name: "Marcus Chen", age: 29, bio: "Software engineer who cooks better than I code. Searching for someone to test my recipes on — or just explore the city with.", location: "Manhattan, NY", distance: "4 mi", interests: ["Cooking", "Hiking", "Photography", "Tech"], photos: ["https://i.pravatar.cc/400?img=11"], verified: false },
  { id: 4, name: "Sofia Reyes", age: 24, bio: "PhD student in marine biology. I'll talk your ear off about octopuses unless you redirect me to wine.", location: "Hoboken, NJ", distance: "6 mi", interests: ["Marine Biology", "Wine", "Reading", "Yoga"], photos: ["https://i.pravatar.cc/400?img=45"], verified: true },
  { id: 5, name: "Elliot Park", age: 31, bio: "Cinematographer. I see the world in 24fps. Slow mornings, fast ideas, and somewhere a good espresso in between.", location: "Brooklyn, NY", distance: "3 mi", interests: ["Film", "Espresso", "Travel", "Music"], photos: ["https://i.pravatar.cc/400?img=68"], verified: true },
  { id: 6, name: "Priya Sharma", age: 27, bio: "Lawyer who moonlights as a stand-up comic. I argue for a living and laugh for free.", location: "Manhattan, NY", distance: "1 mi", interests: ["Comedy", "Law", "Travel", "Podcasts"], photos: ["https://i.pravatar.cc/400?img=49"], verified: false },
];

const CURRENT_USER = { id: 1, name: "Jordan", age: 28, photo: "https://i.pravatar.cc/400?img=33" };

const INITIAL_CHATS = {
  2: { profile: MOCK_PROFILES[0], messages: [{ from: 2, text: "Hey! I saw you liked my profile 👋", time: "10:42 AM" }] },
  5: { profile: MOCK_PROFILES[3], messages: [{ from: 5, text: "Congrats on the match! Love your vibe.", time: "Yesterday" }] },
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 22, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const HeartIcon = ({ filled, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#e84393" : "none"} stroke={filled ? "#e84393" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  rose: "#e84393",
  roseDark: "#c4327a",
  roseLight: "#fce8f3",
  roseFaint: "#fff5fb",
  ink: "#0f0d12",
  inkMid: "#3d3646",
  inkLight: "#7a6e86",
  cream: "#faf8fc",
  border: "#ede9f4",
  white: "#ffffff",
  matchGold: "#f0a500",
  superLike: "#5b8cf8",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'DM Sans', sans-serif; background: ${T.cream}; color: ${T.ink}; overflow: hidden; height: 100dvh; }

  .app { display: flex; flex-direction: column; height: 100dvh; max-width: 420px; margin: 0 auto; background: ${T.white}; position: relative; overflow: hidden; box-shadow: 0 0 60px rgba(232,67,147,0.08); }

  /* NAV */
  .nav { display: flex; justify-content: space-around; align-items: center; padding: 10px 0 max(10px, env(safe-area-inset-bottom)); border-top: 1px solid ${T.border}; background: ${T.white}; flex-shrink: 0; }
  .nav-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; cursor: pointer; color: ${T.inkLight}; font-size: 10px; font-family: 'DM Sans', sans-serif; font-weight: 500; padding: 6px 12px; border-radius: 12px; transition: all 0.2s; position: relative; }
  .nav-btn.active { color: ${T.rose}; }
  .nav-btn:hover { background: ${T.roseFaint}; }
  .nav-badge { position: absolute; top: 2px; right: 8px; background: ${T.rose}; color: white; border-radius: 99px; font-size: 9px; font-weight: 700; padding: 1px 5px; min-width: 16px; text-align: center; }

  /* HEADER */
  .header { padding: 16px 20px 12px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; border-bottom: 1px solid ${T.border}; }
  .header-title { font-family: 'Playfair Display', serif; font-size: 26px; color: ${T.ink}; font-weight: 700; }
  .header-title span { color: ${T.rose}; }
  .header-action { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${T.roseFaint}; border: none; cursor: pointer; color: ${T.rose}; transition: background 0.2s; }
  .header-action:hover { background: ${T.roseLight}; }

  /* SCROLL CONTENT */
  .scroll { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .scroll::-webkit-scrollbar { display: none; }

  /* AUTH */
  .auth { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 28px; background: linear-gradient(160deg, ${T.roseFaint} 0%, ${T.white} 60%); }
  .auth-logo { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 700; color: ${T.ink}; margin-bottom: 6px; }
  .auth-logo span { color: ${T.rose}; }
  .auth-sub { color: ${T.inkLight}; font-size: 15px; margin-bottom: 40px; text-align: center; line-height: 1.5; }
  .auth-card { background: ${T.white}; border-radius: 24px; padding: 28px; width: 100%; max-width: 360px; box-shadow: 0 4px 32px rgba(232,67,147,0.1); border: 1px solid ${T.border}; }
  .auth-tabs { display: flex; background: ${T.cream}; border-radius: 12px; padding: 3px; margin-bottom: 24px; }
  .auth-tab { flex: 1; text-align: center; padding: 9px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; background: none; color: ${T.inkLight}; transition: all 0.2s; }
  .auth-tab.active { background: ${T.white}; color: ${T.rose}; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 12px; font-weight: 600; color: ${T.inkLight}; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .field input { width: 100%; padding: 13px 16px; border: 1.5px solid ${T.border}; border-radius: 12px; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; color: ${T.ink}; background: ${T.cream}; }
  .field input:focus { border-color: ${T.rose}; background: ${T.white}; }
  .btn { width: 100%; padding: 15px; background: ${T.rose}; color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; letter-spacing: 0.01em; }
  .btn:hover { background: ${T.roseDark}; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,67,147,0.3); }
  .btn:active { transform: translateY(0); }
  .btn.secondary { background: ${T.white}; color: ${T.rose}; border: 1.5px solid ${T.rose}; }
  .btn.secondary:hover { background: ${T.roseFaint}; box-shadow: none; }
  .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: ${T.inkLight}; font-size: 13px; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: ${T.border}; }

  /* SWIPE */
  .swipe-area { flex: 1; display: flex; flex-direction: column; padding: 12px 16px; gap: 14px; overflow: hidden; }
  .card-stack { flex: 1; position: relative; }
  .profile-card { position: absolute; inset: 0; border-radius: 24px; overflow: hidden; background: ${T.white}; box-shadow: 0 8px 32px rgba(0,0,0,0.12); cursor: grab; user-select: none; transition: box-shadow 0.2s; }
  .profile-card:active { cursor: grabbing; }
  .card-img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
  .card-gradient { position: absolute; bottom: 0; left: 0; right: 0; height: 55%; background: linear-gradient(to top, rgba(15,13,18,0.92) 0%, transparent 100%); }
  .card-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; color: white; }
  .card-name { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; margin-bottom: 4px; }
  .card-meta { font-size: 14px; opacity: 0.85; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .verified { background: ${T.rose}; border-radius: 99px; font-size: 10px; font-weight: 700; padding: 2px 7px; letter-spacing: 0.04em; }
  .card-interests { display: flex; flex-wrap: wrap; gap: 6px; }
  .pill { background: rgba(255,255,255,0.18); backdrop-filter: blur(8px); border-radius: 99px; font-size: 11px; padding: 4px 10px; font-weight: 500; }
  .swipe-stamp { position: absolute; top: 24px; border-radius: 10px; font-size: 22px; font-weight: 800; padding: 8px 16px; letter-spacing: 0.04em; opacity: 0; pointer-events: none; border: 3px solid; }
  .stamp-like { left: 20px; color: #22c55e; border-color: #22c55e; transform: rotate(-15deg); }
  .stamp-nope { right: 20px; color: #ef4444; border-color: #ef4444; transform: rotate(15deg); }
  .action-bar { display: flex; justify-content: center; align-items: center; gap: 14px; padding-bottom: 4px; }
  .action-btn { display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.18s; border-radius: 50%; }
  .action-btn.sm { width: 48px; height: 48px; background: ${T.white}; box-shadow: 0 3px 14px rgba(0,0,0,0.1); color: ${T.inkMid}; }
  .action-btn.lg { width: 64px; height: 64px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
  .action-btn.nope { background: ${T.white}; color: #ef4444; }
  .action-btn.like { background: linear-gradient(135deg, #e84393, #c4327a); color: white; }
  .action-btn.super { background: linear-gradient(135deg, #5b8cf8, #3a6ad4); color: white; }
  .action-btn:hover { transform: scale(1.1); }
  .action-btn:active { transform: scale(0.95); }
  .no-more { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px; color: ${T.inkLight}; }
  .no-more-icon { font-size: 56px; }

  /* MATCHES */
  .matches-page { padding: 16px; }
  .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${T.inkLight}; margin-bottom: 12px; margin-top: 8px; }
  .new-matches { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; margin-bottom: 20px; }
  .new-matches::-webkit-scrollbar { display: none; }
  .match-bubble { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; flex-shrink: 0; }
  .match-avatar { width: 68px; height: 68px; border-radius: 50%; object-fit: cover; border: 3px solid ${T.rose}; padding: 2px; }
  .match-name { font-size: 11px; font-weight: 600; color: ${T.inkMid}; max-width: 68px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .convo-list { display: flex; flex-direction: column; gap: 2px; }
  .convo-item { display: flex; align-items: center; gap: 13px; padding: 12px 8px; border-radius: 16px; cursor: pointer; transition: background 0.15s; }
  .convo-item:hover { background: ${T.roseFaint}; }
  .convo-avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
  .convo-info { flex: 1; min-width: 0; }
  .convo-name { font-weight: 600; font-size: 15px; color: ${T.ink}; }
  .convo-preview { font-size: 13px; color: ${T.inkLight}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .convo-time { font-size: 11px; color: ${T.inkLight}; flex-shrink: 0; }

  /* CHAT */
  .chat-screen { display: flex; flex-direction: column; height: 100%; }
  .chat-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid ${T.border}; flex-shrink: 0; }
  .back-btn { background: none; border: none; cursor: pointer; color: ${T.inkMid}; padding: 4px; display: flex; align-items: center; }
  .chat-avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; }
  .chat-name { font-weight: 700; font-size: 16px; color: ${T.ink}; }
  .chat-status { font-size: 12px; color: #22c55e; font-weight: 500; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; scrollbar-width: none; }
  .chat-messages::-webkit-scrollbar { display: none; }
  .msg { max-width: 76%; display: flex; flex-direction: column; }
  .msg.mine { align-self: flex-end; align-items: flex-end; }
  .msg.theirs { align-self: flex-start; }
  .msg-bubble { padding: 11px 15px; border-radius: 18px; font-size: 14.5px; line-height: 1.45; }
  .msg.mine .msg-bubble { background: linear-gradient(135deg, ${T.rose}, ${T.roseDark}); color: white; border-bottom-right-radius: 4px; }
  .msg.theirs .msg-bubble { background: ${T.cream}; color: ${T.ink}; border-bottom-left-radius: 4px; border: 1px solid ${T.border}; }
  .msg-time { font-size: 10px; color: ${T.inkLight}; margin-top: 3px; padding: 0 4px; }
  .chat-input-row { display: flex; gap: 10px; padding: 12px 16px max(12px, env(safe-area-inset-bottom)); border-top: 1px solid ${T.border}; flex-shrink: 0; align-items: flex-end; }
  .chat-input { flex: 1; padding: 12px 16px; border: 1.5px solid ${T.border}; border-radius: 22px; font-size: 14.5px; font-family: 'DM Sans', sans-serif; outline: none; resize: none; max-height: 100px; line-height: 1.4; color: ${T.ink}; background: ${T.cream}; transition: border-color 0.2s; }
  .chat-input:focus { border-color: ${T.rose}; background: ${T.white}; }
  .send-btn { width: 44px; height: 44px; background: ${T.rose}; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: all 0.18s; flex-shrink: 0; }
  .send-btn:hover { background: ${T.roseDark}; transform: scale(1.05); }

  /* PROFILE */
  .profile-page { padding-bottom: 24px; }
  .profile-cover { height: 240px; background: linear-gradient(135deg, ${T.rose}, ${T.roseDark}); position: relative; overflow: hidden; }
  .profile-cover-bg { position: absolute; inset: 0; opacity: 0.15; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
  .profile-avatar-wrap { position: absolute; bottom: -40px; left: 20px; }
  .profile-avatar { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
  .profile-edit-btn { position: absolute; bottom: 0; right: 0; width: 28px; height: 28px; background: ${T.rose}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; }
  .profile-body { padding: 52px 20px 0; }
  .profile-name { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: ${T.ink}; }
  .profile-location { display: flex; align-items: center; gap: 4px; font-size: 13px; color: ${T.inkLight}; margin-top: 4px; }
  .profile-bio { margin-top: 14px; font-size: 14.5px; line-height: 1.6; color: ${T.inkMid}; }
  .profile-section { margin-top: 22px; }
  .profile-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${T.inkLight}; margin-bottom: 10px; }
  .pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .pill-light { background: ${T.roseFaint}; color: ${T.rose}; border-radius: 99px; font-size: 13px; padding: 6px 14px; font-weight: 600; border: 1px solid ${T.roseLight}; }
  .stat-row { display: flex; gap: 12px; margin-top: 20px; }
  .stat-card { flex: 1; background: ${T.cream}; border-radius: 16px; padding: 14px; text-align: center; border: 1px solid ${T.border}; }
  .stat-num { font-size: 24px; font-weight: 700; color: ${T.rose}; font-family: 'Playfair Display', serif; }
  .stat-label { font-size: 11px; color: ${T.inkLight}; font-weight: 500; margin-top: 2px; }

  /* MATCH MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15,13,18,0.85); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; animation: fadeIn 0.3s; }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .match-modal { background: ${T.white}; border-radius: 28px; padding: 36px 28px; text-align: center; width: 100%; max-width: 340px; animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  .match-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: ${T.rose}; margin-bottom: 6px; }
  .match-avatars { display: flex; justify-content: center; gap: -16px; margin: 20px 0; }
  .match-av { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid white; box-shadow: 0 4px 16px rgba(232,67,147,0.25); }
  .match-av:last-child { margin-left: -20px; }
  .match-desc { color: ${T.inkLight}; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
  .match-btns { display: flex; flex-direction: column; gap: 10px; }

  /* SETTINGS */
  .settings-list { padding: 12px 16px; }
  .settings-item { display: flex; align-items: center; justify-content: space-between; padding: 15px 4px; border-bottom: 1px solid ${T.border}; cursor: pointer; }
  .settings-item:last-child { border-bottom: none; }
  .settings-label { font-size: 15px; color: ${T.ink}; font-weight: 500; }
  .settings-value { font-size: 14px; color: ${T.inkLight}; display: flex; align-items: center; gap: 6px; }
  .toggle { width: 44px; height: 26px; background: ${T.border}; border-radius: 99px; position: relative; cursor: pointer; transition: background 0.2s; }
  .toggle.on { background: ${T.rose}; }
  .toggle-knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.15); }
  .toggle.on .toggle-knob { transform: translateX(18px); }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [step, setStep] = useState("form"); // form | otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    if (tab === "signup" && step === "form") { setStep("otp"); return; }
    onLogin();
  };

  return (
    <div className="auth">
      <div className="auth-logo">spark<span>.</span></div>
      <p className="auth-sub">Connections that actually spark.<br />Find your person, for real.</p>
      <div className="auth-card">
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setStep("form"); }}>Sign in</button>
          <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => { setTab("signup"); setStep("form"); }}>Create account</button>
        </div>

        {step === "otp" ? (
          <>
            <p style={{ fontSize: 14, color: T.inkLight, marginBottom: 20, lineHeight: 1.5 }}>
              We sent a 6-digit code to <strong style={{ color: T.ink }}>{phone || email}</strong>. Enter it below.
            </p>
            <div className="field">
              <label>Verification Code</label>
              <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} style={{ textAlign: "center", fontSize: 24, letterSpacing: "0.3em", fontWeight: 700 }} />
            </div>
            <button className="btn" onClick={onLogin} style={{ marginBottom: 12 }}>Verify & Continue</button>
            <button className="btn secondary" onClick={() => setStep("form")}>← Back</button>
          </>
        ) : tab === "login" ? (
          <>
            <div className="field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div className="field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
            <button className="btn" onClick={handleSubmit} style={{ marginBottom: 16 }}>Sign in</button>
            <div className="divider">or</div>
            <button className="btn secondary" onClick={handleSubmit}>Continue with Google</button>
          </>
        ) : (
          <>
            <div className="field"><label>Full Name</label><input placeholder="Your name" /></div>
            <div className="field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div className="field"><label>Phone (for OTP)</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" /></div>
            <div className="field"><label>Password</label><input type="password" placeholder="••••••••" /></div>
            <button className="btn" onClick={handleSubmit}>Send OTP & Continue →</button>
          </>
        )}
      </div>
    </div>
  );
}

function SwipeScreen({ onMatch }) {
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [drag, setDrag] = useState({ active: false, x: 0, y: 0, startX: 0, startY: 0 });
  const cardRef = useRef(null);
  const current = profiles[0];

  const swipe = (dir) => {
    if (!current) return;
    if (dir === "right") onMatch(current);
    setProfiles(p => p.slice(1));
  };

  const onPointerDown = (e) => {
    setDrag({ active: true, x: 0, y: 0, startX: e.clientX, startY: e.clientY });
  };

  const onPointerMove = (e) => {
    if (!drag.active) return;
    setDrag(d => ({ ...d, x: e.clientX - d.startX, y: e.clientY - d.startY }));
  };

  const onPointerUp = () => {
    if (!drag.active) return;
    const { x } = drag;
    if (Math.abs(x) > 80) swipe(x > 0 ? "right" : "left");
    setDrag({ active: false, x: 0, y: 0, startX: 0, startY: 0 });
  };

  const rotation = drag.x * 0.08;
  const likeOpacity = Math.max(0, Math.min(1, drag.x / 80));
  const nopeOpacity = Math.max(0, Math.min(1, -drag.x / 80));

  return (
    <div className="swipe-area">
      <div className="card-stack"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        ref={cardRef}
      >
        {!current ? (
          <div className="no-more">
            <div className="no-more-icon">✨</div>
            <p style={{ fontWeight: 700, fontSize: 18 }}>You're all caught up</p>
            <p style={{ fontSize: 14, color: T.inkLight, textAlign: "center", maxWidth: 220 }}>Check back soon for new people in your area.</p>
          </div>
        ) : (
          <>
            {profiles[1] && (
              <div className="profile-card" style={{ transform: "scale(0.95) translateY(12px)", zIndex: 0, filter: "brightness(0.9)" }}>
                <img className="card-img" src={profiles[1].photos[0]} alt="" />
              </div>
            )}
            <div className="profile-card" style={{
              zIndex: 1,
              transform: drag.active ? `translate(${drag.x}px, ${drag.y * 0.3}px) rotate(${rotation}deg)` : "none",
              transition: drag.active ? "none" : "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              touchAction: "none",
            }}>
              <img className="card-img" src={current.photos[0]} alt={current.name} draggable={false} />
              <div className="card-gradient" />
              <div className="card-info">
                <div className="card-name">{current.name}, {current.age}</div>
                <div className="card-meta">
                  <Icon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" size={13} fill="currentColor" stroke="none" />
                  {current.distance} away
                  {current.verified && <span className="verified">✓ Verified</span>}
                </div>
                <div className="card-interests">
                  {current.interests.slice(0, 3).map(i => <span key={i} className="pill">{i}</span>)}
                </div>
              </div>
              <div className="swipe-stamp stamp-like" style={{ opacity: likeOpacity }}>LIKE</div>
              <div className="swipe-stamp stamp-nope" style={{ opacity: nopeOpacity }}>NOPE</div>
            </div>
          </>
        )}
      </div>

      <div className="action-bar">
        <button className="action-btn sm" onClick={() => setProfiles(MOCK_PROFILES)} title="Rewind">
          <Icon d="M1 4v6h6M23 20v-6h-6" size={18} />
        </button>
        <button className="action-btn lg nope" onClick={() => swipe("left")}>
          <Icon d="M18 6 6 18M6 6l12 12" size={26} strokeWidth={2.5} />
        </button>
        <button className="action-btn lg like" onClick={() => swipe("right")}>
          <HeartIcon filled size={26} />
        </button>
        <button className="action-btn sm super" title="Super Like">
          <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" size={18} fill="currentColor" stroke="none" />
        </button>
      </div>
    </div>
  );
}

function MatchesScreen({ matches, onOpenChat }) {
  const conversations = Object.values(INITIAL_CHATS).concat(
    matches.filter(m => !INITIAL_CHATS[m.id]).map(m => ({ profile: m, messages: [] }))
  );

  return (
    <div className="scroll">
      <div className="matches-page">
        {matches.length > 0 && (
          <>
            <div className="section-label">New Matches</div>
            <div className="new-matches">
              {matches.map(m => (
                <div key={m.id} className="match-bubble" onClick={() => onOpenChat(m.id, conversations.find(c => c.profile.id === m.id) || { profile: m, messages: [] })}>
                  <img className="match-avatar" src={m.photos[0]} alt={m.name} />
                  <span className="match-name">{m.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="section-label">Messages</div>
        <div className="convo-list">
          {conversations.map(({ profile, messages }) => (
            <div key={profile.id} className="convo-item" onClick={() => onOpenChat(profile.id, { profile, messages })}>
              <img className="convo-avatar" src={profile.photos[0]} alt={profile.name} />
              <div className="convo-info">
                <div className="convo-name">{profile.name}</div>
                <div className="convo-preview">{messages[0]?.text || "Say hello! 👋"}</div>
              </div>
              <div className="convo-time">{messages[0]?.time || ""}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatScreen({ chat, onBack }) {
  const [msgs, setMsgs] = useState(chat.messages);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    const newMsg = { from: 1, text: input.trim(), time: "Just now" };
    setMsgs(m => [...m, newMsg]);
    setInput("");
    setTimeout(() => {
      const replies = ["That's so cool! 😄", "Haha, tell me more 👀", "I was literally just thinking about that!", "No way, same!! 🙌", "You seem really interesting...", "We should grab coffee and continue this 😊"];
      setMsgs(m => [...m, { from: chat.profile.id, text: replies[Math.floor(Math.random() * replies.length)], time: "Just now" }]);
    }, 1200);
  };

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}><Icon d="M19 12H5M12 5l-7 7 7 7" /></button>
        <img className="chat-avatar" src={chat.profile.photos[0]} alt="" />
        <div>
          <div className="chat-name">{chat.profile.name}</div>
          <div className="chat-status">● Active now</div>
        </div>
      </div>
      <div className="chat-messages">
        <div style={{ textAlign: "center", fontSize: 12, color: T.inkLight, padding: "8px 0 16px" }}>
          You matched with {chat.profile.name.split(" ")[0]}! Say hello 👋
        </div>
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.from === 1 ? "mine" : "theirs"}`}>
            <div className="msg-bubble">{m.text}</div>
            <div className="msg-time">{m.time}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder="Message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={1}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button className="send-btn" onClick={send}>
          <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={18} />
        </button>
      </div>
    </div>
  );
}

function ProfileScreen({ onLogout }) {
  const [notifs, setNotifs] = useState(true);
  const [loc, setLoc] = useState(true);

  return (
    <div className="scroll">
      <div className="profile-page">
        <div className="profile-cover">
          <div className="profile-cover-bg" />
          <div className="profile-avatar-wrap">
            <img className="profile-avatar" src={CURRENT_USER.photo} alt="" />
            <div className="profile-edit-btn">
              <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" size={12} strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="profile-body">
          <div className="profile-name">{CURRENT_USER.name} Kim</div>
          <div className="profile-location">
            <Icon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" size={13} fill={T.inkLight} stroke="none" />
            Brooklyn, NY · 28
          </div>
          <p className="profile-bio">Designer &amp; part-time wanderer. Love vinyl records, Sunday farmers markets, and people who can hold a real conversation. Looking for something genuine.</p>

          <div className="stat-row">
            <div className="stat-card"><div className="stat-num">47</div><div className="stat-label">Likes</div></div>
            <div className="stat-card"><div className="stat-num">12</div><div className="stat-label">Matches</div></div>
            <div className="stat-card"><div className="stat-num">5</div><div className="stat-label">Chats</div></div>
          </div>

          <div className="profile-section">
            <div className="profile-section-title">Interests</div>
            <div className="pills">
              {["Design", "Vinyl Records", "Hiking", "Coffee", "Jazz", "Travel"].map(i => (
                <span key={i} className="pill-light">{i}</span>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-title">Settings</div>
            <div style={{ background: T.cream, borderRadius: 16, border: `1px solid ${T.border}` }}>
              <div className="settings-list">
                <div className="settings-item">
                  <span className="settings-label">Notifications</span>
                  <div className={`toggle ${notifs ? "on" : ""}`} onClick={() => setNotifs(n => !n)}><div className="toggle-knob" /></div>
                </div>
                <div className="settings-item">
                  <span className="settings-label">Location</span>
                  <div className={`toggle ${loc ? "on" : ""}`} onClick={() => setLoc(l => !l)}><div className="toggle-knob" /></div>
                </div>
                <div className="settings-item">
                  <span className="settings-label">Discovery Range</span>
                  <span className="settings-value">25 mi <Icon d="M9 18l6-6-6-6" size={14} /></span>
                </div>
                <div className="settings-item">
                  <span className="settings-label">Age Range</span>
                  <span className="settings-value">23–35 <Icon d="M9 18l6-6-6-6" size={14} /></span>
                </div>
                <div className="settings-item" onClick={onLogout}>
                  <span className="settings-label" style={{ color: "#ef4444" }}>Sign out</span>
                  <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" size={18} stroke="#ef4444" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchModal({ profile, onClose, onChat }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="match-modal" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 48, marginBottom: 4 }}>💘</div>
        <div className="match-title">It's a Match!</div>
        <p style={{ color: T.inkLight, fontSize: 14, marginBottom: 4 }}>You and {profile.name.split(" ")[0]} both liked each other.</p>
        <div className="match-avatars">
          <img className="match-av" src={CURRENT_USER.photo} alt="You" />
          <img className="match-av" src={profile.photos[0]} alt={profile.name} />
        </div>
        <div className="match-btns">
          <button className="btn" onClick={onChat}>Send a message</button>
          <button className="btn secondary" onClick={onClose}>Keep swiping</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("auth"); // auth | main
  const [tab, setTab] = useState("swipe");
  const [matches, setMatches] = useState([]);
  const [matchModal, setMatchModal] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chatData, setChatData] = useState(INITIAL_CHATS);
  const [msgCount, setMsgCount] = useState(2);

  const handleMatch = (profile) => {
    setMatches(m => [profile, ...m]);
    setMatchModal(profile);
  };

  const openChat = (id, data) => {
    setChatData(d => ({ ...d, [id]: data }));
    setActiveChat(id);
    setTab("matches");
  };

  const handleMatchChat = () => {
    const p = matchModal;
    setMatchModal(null);
    openChat(p.id, { profile: p, messages: [] });
  };

  if (screen === "auth") return (
    <>
      <style>{css}</style>
      <AuthScreen onLogin={() => setScreen("main")} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* HEADER */}
        {!activeChat && (
          <div className="header">
            <div className="header-title">spark<span>.</span></div>
            {tab === "swipe" && (
              <button className="header-action"><Icon d="M4 6h16M4 12h8m-8 6h16" /></button>
            )}
            {tab === "matches" && (
              <button className="header-action"><Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></button>
            )}
          </div>
        )}

        {/* CONTENT */}
        {activeChat ? (
          <ChatScreen
            chat={chatData[activeChat] || { profile: MOCK_PROFILES[0], messages: [] }}
            onBack={() => setActiveChat(null)}
          />
        ) : tab === "swipe" ? (
          <SwipeScreen onMatch={handleMatch} />
        ) : tab === "matches" ? (
          <MatchesScreen matches={matches} onOpenChat={openChat} />
        ) : (
          <ProfileScreen onLogout={() => setScreen("auth")} />
        )}

        {/* NAV */}
        {!activeChat && (
          <nav className="nav">
            <button className={`nav-btn ${tab === "swipe" ? "active" : ""}`} onClick={() => setTab("swipe")}>
              <HeartIcon filled={tab === "swipe"} size={22} />
              Discover
            </button>
            <button className={`nav-btn ${tab === "matches" ? "active" : ""}`} onClick={() => setTab("matches")}>
              <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill={tab === "matches" ? T.rose : "none"} stroke={tab === "matches" ? T.rose : "currentColor"} />
              {msgCount > 0 && <span className="nav-badge">{msgCount}</span>}
              Matches
            </button>
            <button className={`nav-btn ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
              <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" fill={tab === "profile" ? T.rose : "none"} stroke={tab === "profile" ? T.rose : "currentColor"} />
              Profile
            </button>
          </nav>
        )}

        {/* MATCH MODAL */}
        {matchModal && (
          <MatchModal
            profile={matchModal}
            onClose={() => setMatchModal(null)}
            onChat={handleMatchChat}
          />
        )}
      </div>
    </>
  );
}
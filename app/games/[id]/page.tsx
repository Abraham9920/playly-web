"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const SPORT_ICONS: Record<string, string> = {
  Basketball: "🏀",
  Soccer: "⚽",
  Tennis: "🎾",
  Volleyball: "🏐",
  Running: "🏃",
  Padel: "🏓",
  Yoga: "🧘",
  PADEL: "🏓",
  SOCCER: "⚽",
  YOGA: "🧘",
  Other: "🎯",
};

export default function GameDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    fetchGame();
  }, [id]);

  const fetchGame = async () => {
    try {
      const res = await fetch(
        `https://playly-backend-production.up.railway.app/games/${id}`,
      );
      if (res.ok) setGame(await res.json());
    } catch {}
    setLoading(false);
  };

  const joinGame = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setJoining(true);
    setError("");
    try {
      const res = await fetch(
        `https://playly-backend-production.up.railway.app/games/${id}/join`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setJoined(true);
        fetchGame();
      } else {
        const d = await res.json();
        setError(d.message || "Error");
      }
    } catch {
      setError("Network error");
    }
    setJoining(false);
  };

  if (loading)
    return (
      <div
        style={{
          background: "#060810",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#4A6070", fontFamily: "'DM Sans',sans-serif" }}>
          Loading...
        </div>
      </div>
    );

  if (!game)
    return (
      <div
        style={{
          background: "#060810",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#FF6B6B", fontFamily: "'DM Sans',sans-serif" }}>
          Game not found
        </div>
      </div>
    );

  const pct = Math.round(
    ((game.joinedPlayers || game.players || 0) / game.maxPlayers) * 100,
  );
  const spotsLeft = game.maxPlayers - (game.joinedPlayers || game.players || 0);
  const icon = SPORT_ICONS[game.sport] || "🎯";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#060810;font-family:'DM Sans',sans-serif;color:#F0F4F8;min-height:100vh}
        .header{position:sticky;top:0;z-index:100;background:rgba(6,8,16,0.9);backdrop-filter:blur(20px);border-bottom:1px solid #0E1318;padding:0 20px;display:flex;align-items:center;gap:16px;height:60px}
        .back{background:transparent;border:none;color:#4A6070;font-size:20px;cursor:pointer}
        .header-title{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#F0F4F8}
        .hero{background:linear-gradient(135deg,#00D4FF08,#00E59908);border-bottom:1px solid #0E1318;padding:32px 20px}
        .sport-row{display:flex;align-items:center;gap:12px;margin-bottom:16px}
        .sport-icon{font-size:48px}
        .sport-label{font-size:13px;font-weight:600;color:#4A6070;text-transform:uppercase;letter-spacing:2px}
        .game-title{font-family:'Bebas Neue',sans-serif;font-size:40px;color:#F0F4F8;line-height:1;margin-top:4px}
        .tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
        .tag{padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;background:#0E1318;border:1px solid #1C2730;color:#4A6070}
        .tag.green{border-color:#00E59933;color:#00E599}
        .tag.blue{border-color:#00D4FF33;color:#00D4FF}
        .tag.orange{border-color:#FF6B3533;color:#FF6B35}
        .section{padding:20px}
        .section-title{font-size:12px;color:#2A3A48;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
        .info-card{background:#0A0F18;border:1px solid #0E1318;border-radius:12px;padding:16px;margin-bottom:12px}
        .info-row{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #0E1318}
        .info-row:last-child{border-bottom:none}
        .info-icon{font-size:18px;width:28px}
        .info-label{font-size:13px;color:#4A6070;flex:1}
        .info-value{font-size:14px;font-weight:600;color:#F0F4F8}
        .players-section{padding:0 20px 20px}
        .progress-wrap{background:#0A0F18;border:1px solid #0E1318;border-radius:12px;padding:16px}
        .progress-header{display:flex;justify-content:space-between;margin-bottom:12px}
        .progress-label{font-size:13px;color:#4A6070}
        .progress-count{font-size:20px;font-weight:700;color:#00D4FF;font-family:'Bebas Neue',sans-serif}
        .progress-bar{width:100%;height:6px;background:#0E1318;border-radius:3px;overflow:hidden;margin-bottom:8px}
        .progress-fill{height:100%;background:linear-gradient(90deg,#00D4FF,#00E599);border-radius:3px;transition:width 0.5s}
        .spots{font-size:12px;color:#4A6070}
        .spots span{color:#00E599;font-weight:600}
        .bottom{position:fixed;bottom:0;left:0;right:0;padding:16px 20px;background:rgba(6,8,16,0.95);backdrop-filter:blur(20px);border-top:1px solid #0E1318}
        .btn-join{width:100%;background:linear-gradient(135deg,#00D4FF,#00E599);border:none;border-radius:12px;padding:16px;font-family:'DM Sans',sans-serif;font-size:16px;font-weight:700;color:#060810;cursor:pointer;transition:opacity 0.2s}
        .btn-join:disabled{opacity:0.4}
        .btn-joined{background:#0E1318;border:1px solid #00E59933;color:#00E599}
        .btn-full{background:#1C2730;color:#4A6070;cursor:not-allowed}
        .error{background:#FF3B3B11;border:1px solid #FF3B3B33;border-radius:10px;padding:10px 14px;color:#FF6B6B;font-size:13px;margin-bottom:12px}
        .host-card{display:flex;align-items:center;gap:12px;background:#0A0F18;border:1px solid #0E1318;border-radius:12px;padding:14px}
        .host-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#00E599);display:flex;align-items:center;justify-content:center;font-weight:700;color:#060810;font-size:16px;flex-shrink:0}
        .host-name{font-size:15px;font-weight:600;color:#F0F4F8}
        .host-label{font-size:12px;color:#4A6070}
        .price-badge{background:linear-gradient(135deg,#00D4FF11,#00E59911);border:1px solid #00D4FF22;border-radius:12px;padding:16px;text-align:center;margin-bottom:12px}
        .price-amount{font-family:'Bebas Neue',sans-serif;font-size:48px;color:#00D4FF}
        .price-label{font-size:12px;color:#4A6070;text-transform:uppercase;letter-spacing:1px}
      `}</style>

      <header className="header">
        <button className="back" onClick={() => router.push("/")}>
          ←
        </button>
        <div className="header-title">Game Details</div>
      </header>

      <div className="hero">
        <div className="sport-row">
          <span className="sport-icon">{icon}</span>
          <div>
            <div className="sport-label">{game.sport}</div>
            <div className="game-title">{game.title}</div>
          </div>
        </div>
        <div className="tags">
          <span
            className={`tag ${game.skillLevel === "Casual" || game.skillLevel === "ALL_LEVELS" ? "green" : game.skillLevel === "INTERMEDIATE" ? "blue" : "orange"}`}
          >
            ⚡ {game.skillLevel}
          </span>
          <span className="tag blue">👥 {game.maxPlayers} max</span>
          {game.pricePerPlayer > 0 ? (
            <span className="tag orange">💰 ${game.pricePerPlayer}/player</span>
          ) : (
            <span className="tag green">🆓 Free</span>
          )}
          <span className="tag">{game.status || "OPEN"}</span>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Details</div>
        <div className="info-card">
          {game.startsAt && (
            <div className="info-row">
              <span className="info-icon">📅</span>
              <span className="info-label">Date & Time</span>
              <span className="info-value">
                {new Date(game.startsAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                ·{" "}
                {new Date(game.startsAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {game.duration && (
            <div className="info-row">
              <span className="info-icon">⏱️</span>
              <span className="info-label">Duration</span>
              <span className="info-value">{game.duration} min</span>
            </div>
          )}
          {game.venue && (
            <div className="info-row">
              <span className="info-icon">📍</span>
              <span className="info-label">Venue</span>
              <span className="info-value">{game.venue}</span>
            </div>
          )}
          {game.neighborhood && (
            <div className="info-row">
              <span className="info-icon">🗽</span>
              <span className="info-label">Neighborhood</span>
              <span className="info-value">{game.neighborhood}</span>
            </div>
          )}
        </div>
      </div>

      <div className="players-section">
        <div className="section-title">Players</div>
        <div className="progress-wrap">
          <div className="progress-header">
            <span className="progress-label">Spots filled</span>
            <span className="progress-count">
              {game.joinedPlayers || game.players || 0}/{game.maxPlayers}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="spots">
            {spotsLeft > 0 ? (
              <>
                <span>{spotsLeft}</span> spots left
              </>
            ) : (
              <span style={{ color: "#FF6B6B" }}>Game full</span>
            )}
          </div>
        </div>
      </div>

      {game.host && (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-title">Host</div>
          <div className="host-card">
            <div className="host-avatar">
              {game.host.name?.[0]?.toUpperCase() || "H"}
            </div>
            <div>
              <div className="host-name">{game.host.name}</div>
              <div className="host-label">Game organizer</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 100 }} />

      <div className="bottom">
        {error && <div className="error">{error}</div>}
        {spotsLeft <= 0 ? (
          <button className="btn-join btn-full" disabled>
            Game Full
          </button>
        ) : joined ? (
          <button className="btn-join btn-joined" disabled>
            ✅ You're In!
          </button>
        ) : (
          <button className="btn-join" onClick={joinGame} disabled={joining}>
            {joining
              ? "Joining..."
              : game.pricePerPlayer > 0
                ? `Join · $${game.pricePerPlayer}`
                : "Join Game →"}
          </button>
        )}
      </div>
    </>
  );
}

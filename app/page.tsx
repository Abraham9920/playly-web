"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const SPORTS = [
  "All",
  "Basketball",
  "Soccer",
  "Tennis",
  "Volleyball",
  "Running",
  "Padel",
];

const DEMO_GAMES = [
  {
    id: 1,
    sport: "Basketball",
    title: "Pickup Basketball",
    venue: "West 4th Street Courts",
    address: "W 4th St, NYC",
    time: "Today 6:00 PM",
    players: 8,
    maxPlayers: 10,
    level: "Intermediate",
    lat: 40.7308,
    lng: -74.0002,
  },
  {
    id: 2,
    sport: "Soccer",
    title: "Sunday Soccer",
    venue: "Pier 40",
    address: "Hudson River Park",
    time: "Sun 10:00 AM",
    players: 14,
    maxPlayers: 22,
    level: "Casual",
    lat: 40.7282,
    lng: -74.0094,
  },
  {
    id: 3,
    sport: "Tennis",
    title: "Singles Match",
    venue: "Central Park Tennis",
    address: "Central Park West",
    time: "Sat 9:00 AM",
    players: 1,
    maxPlayers: 2,
    level: "Advanced",
    lat: 40.7794,
    lng: -73.9632,
  },
  {
    id: 4,
    sport: "Volleyball",
    title: "Beach Volleyball",
    venue: "East River Park",
    address: "East River Esplanade",
    time: "Today 7:00 PM",
    players: 6,
    maxPlayers: 12,
    level: "Casual",
    lat: 40.7135,
    lng: -73.9776,
  },
  {
    id: 5,
    sport: "Running",
    title: "Morning 5K",
    venue: "Prospect Park",
    address: "Brooklyn",
    time: "Tomorrow 7:00 AM",
    players: 4,
    maxPlayers: 20,
    level: "All Levels",
    lat: 40.6602,
    lng: -73.969,
  },
  {
    id: 6,
    sport: "Padel",
    title: "Padel Doubles",
    venue: "Padel Haus",
    address: "524 W 19th St",
    time: "Sat 2:00 PM",
    players: 2,
    maxPlayers: 4,
    level: "Beginner",
    lat: 40.7459,
    lng: -74.0045,
  },
];

const SPORT_ICONS: Record<string, string> = {
  Basketball: "🏀",
  Soccer: "⚽",
  Tennis: "🎾",
  Volleyball: "🏐",
  Running: "🏃",
  Padel: "🏓",
  All: "🎯",
};

const LEVEL_COLORS: Record<string, string> = {
  Casual: "#00E599",
  Intermediate: "#00D4FF",
  Advanced: "#FF6B35",
  Beginner: "#A78BFA",
  "All Levels": "#F0F4F8",
};

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function Home() {
  const router = useRouter();
  const [sport, setSport] = useState("All");
  const [games, setGames] = useState(DEMO_GAMES);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [joining, setJoining] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch(
        "https://playly-backend-production.up.railway.app/games",
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setGames(data);
      }
    } catch {}
  };

  const filtered =
    sport === "All" ? games : games.filter((g) => g.sport === sport);

  const updateMarkers = useCallback((map: any, gamesToShow: any[]) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    gamesToShow.forEach((game) => {
      if (!game.lat || !game.lng) return;
      const marker = new window.google.maps.Marker({
        position: { lat: Number(game.lat), lng: Number(game.lng) },
        map,
        title: game.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: "#00D4FF",
          fillOpacity: 0.9,
          strokeColor: "#060810",
          strokeWeight: 2,
        },
      });
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="background:#0E1318;color:#F0F4F8;padding:12px 14px;border-radius:8px;font-family:sans-serif;min-width:180px">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">${SPORT_ICONS[game.sport] || "🎯"} ${game.title}</div>
          <div style="color:#4A6070;font-size:12px;margin-bottom:2px">📍 ${game.venue}</div>
          <div style="color:#4A6070;font-size:12px">🕐 ${game.time} · ${game.players}/${game.maxPlayers} players</div>
        </div>`,
      });
      marker.addListener("click", () => {
        setSelectedGame(game);
        infoWindow.open(map, marker);
      });
      markersRef.current.push(marker);
    });
  }, []);

  const initGoogleMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.758, lng: -73.9855 },
      zoom: 12,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0a0f18" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0a0f18" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#4a6070" }] },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#0e1318" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1c2730" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#2a3a48" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#060810" }],
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [{ color: "#0e1318" }],
        },
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#0e1318" }],
        },
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1c2730" }],
        },
      ],
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: { position: 9 },
    });
    mapInstanceRef.current = map;
    updateMarkers(map, filtered);
  }, [filtered, updateMarkers]);

  useEffect(() => {
    if (view !== "map") return;
    if (window.google) {
      if (!mapInstanceRef.current) initGoogleMap();
      else updateMarkers(mapInstanceRef.current, filtered);
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    window.initMap = initGoogleMap;
    if (!document.getElementById("gmaps-script")) {
      const script = document.createElement("script");
      script.id = "gmaps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, [view, sport, games, initGoogleMap, filtered, updateMarkers]);

  const joinGame = async (gameId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setJoining(gameId);
    try {
      const res = await fetch(
        `https://playly-backend-production.up.railway.app/games/${gameId}/join`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) fetchGames();
    } catch {}
    setJoining(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#060810;font-family:'DM Sans',sans-serif;color:#F0F4F8;min-height:100vh}
        .header{position:sticky;top:0;z-index:100;background:rgba(6,8,16,0.85);backdrop-filter:blur(20px);border-bottom:1px solid #0E1318;padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:60px}
        .logo{font-family:'Bebas Neue',sans-serif;font-size:32px;background:linear-gradient(135deg,#00D4FF,#00E599);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .header-right{display:flex;align-items:center;gap:12px}
        .btn-login{background:transparent;border:1px solid #1C2730;border-radius:8px;padding:8px 16px;color:#4A6070;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer}
        .btn-create{background:linear-gradient(135deg,#00D4FF,#00E599);border:none;border-radius:8px;padding:8px 16px;color:#060810;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer}
        .avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#00E599);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#060810;cursor:pointer}
        .hero{padding:32px 20px 0;text-align:center}
        .hero-title{font-family:'Bebas Neue',sans-serif;font-size:52px;line-height:1;background:linear-gradient(135deg,#F0F4F8 40%,#4A6070);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px}
        .hero-sub{color:#4A6070;font-size:14px;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px}
        .view-toggle{display:flex;gap:4px;background:#0E1318;border-radius:10px;padding:3px;width:fit-content;margin:0 auto 24px}
        .vt-btn{padding:7px 20px;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:#4A6070;transition:all 0.2s}
        .vt-btn.active{background:#1C2730;color:#F0F4F8}
        .filters{display:flex;gap:8px;overflow-x:auto;padding:0 20px 20px;scrollbar-width:none}
        .filters::-webkit-scrollbar{display:none}
        .filter-chip{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:20px;border:1px solid #1C2730;background:#0E1318;color:#4A6070;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.2s;flex-shrink:0}
        .filter-chip.active{background:#1C2730;border-color:#00D4FF33;color:#F0F4F8}
        .games-container{padding:0 20px 100px}
        .section-label{font-size:12px;color:#2A3A48;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}
        .games-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
        .game-card{background:#0A0F18;border:1px solid #0E1318;border-radius:16px;padding:20px;transition:all 0.2s;position:relative;overflow:hidden}
        .game-card:hover{border-color:#1C2730;transform:translateY(-2px)}
        .game-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#00D4FF,#00E599);opacity:0;transition:opacity 0.2s}
        .game-card:hover::before{opacity:1}
        .card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}
        .sport-badge{display:flex;align-items:center;gap:6px;background:#0E1318;border-radius:8px;padding:6px 10px}
        .sport-name{font-size:12px;font-weight:600;color:#4A6070;text-transform:uppercase;letter-spacing:1px}
        .level-badge{font-size:11px;font-weight:600;padding:4px 8px;border-radius:6px;background:#0E1318}
        .card-title{font-size:17px;font-weight:700;color:#F0F4F8;margin-bottom:4px}
        .card-venue{font-size:13px;color:#2A3A48;margin-bottom:14px}
        .card-meta{display:flex;align-items:center;justify-content:space-between}
        .card-time{font-size:13px;color:#4A6070;font-weight:500}
        .players-count{font-size:13px;font-weight:700;color:#00D4FF}
        .btn-join{background:linear-gradient(135deg,#00D4FF,#00E599);border:none;border-radius:8px;padding:8px 18px;color:#060810;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;margin-top:14px;width:100%}
        .btn-join:disabled{opacity:0.5}
        .btn-join.full{background:#1C2730;color:#4A6070}
        .progress-bar{width:100%;height:3px;background:#0E1318;border-radius:2px;margin-top:10px;overflow:hidden}
        .progress-fill{height:100%;background:linear-gradient(90deg,#00D4FF,#00E599);border-radius:2px}
        .map-wrap{padding:0 20px 100px}
        .gmap{width:100%;height:520px;border-radius:16px;overflow:hidden;border:1px solid #1C2730;margin-bottom:20px}
        .map-hint{text-align:center;color:#2A3A48;font-size:13px;margin-bottom:16px}
        .fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#00E599);border:none;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(0,212,255,0.4);z-index:50;color:#060810;font-weight:700;transition:transform 0.2s}
        .fab:hover{transform:scale(1.1)}
        .gm-style .gm-style-iw-c{background:#0E1318!important;border:1px solid #1C2730!important;padding:0!important;box-shadow:0 4px 20px rgba(0,0,0,0.5)!important}
        .gm-style .gm-style-iw-d{overflow:hidden!important}
        .gm-ui-hover-effect{filter:invert(1)!important;opacity:0.5!important}
      `}</style>

      <header className="header">
        <div className="logo">Playly</div>
        <div className="header-right">
          {user ? (
            <>
              <button
                className="btn-create"
                onClick={() => router.push("/games/create")}
              >
                + Game
              </button>
              <div className="avatar">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            </>
          ) : (
            <>
              <button
                className="btn-login"
                onClick={() => router.push("/login")}
              >
                Sign In
              </button>
              <button
                className="btn-create"
                onClick={() => router.push("/games/create")}
              >
                + Create Game
              </button>
            </>
          )}
        </div>
      </header>

      <div className="hero">
        <div className="hero-title">Find Your Game</div>
        <div className="hero-sub">NYC Sports Community</div>
        <div className="view-toggle">
          <button
            className={`vt-btn ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            📋 List
          </button>
          <button
            className={`vt-btn ${view === "map" ? "active" : ""}`}
            onClick={() => setView("map")}
          >
            🗺️ Map
          </button>
        </div>
      </div>

      <div className="filters">
        {SPORTS.map((s) => (
          <button
            key={s}
            className={`filter-chip ${sport === s ? "active" : ""}`}
            onClick={() => setSport(s)}
          >
            <span>{SPORT_ICONS[s]}</span>
            <span>{s}</span>
          </button>
        ))}
      </div>

      {view === "list" ? (
        <div className="games-container">
          <div className="section-label">{filtered.length} games near you</div>
          <div className="games-grid">
            {filtered.map((game) => {
              const pct = Math.round((game.players / game.maxPlayers) * 100);
              const full = game.players >= game.maxPlayers;
              return (
                <div key={game.id} className="game-card">
                  <div className="card-top">
                    <div className="sport-badge">
                      <span>{SPORT_ICONS[game.sport] || "🎯"}</span>
                      <span className="sport-name">{game.sport}</span>
                    </div>
                    <span
                      className="level-badge"
                      style={{ color: LEVEL_COLORS[game.level] || "#F0F4F8" }}
                    >
                      {game.level}
                    </span>
                  </div>
                  <div className="card-title">{game.title}</div>
                  <div className="card-venue">📍 {game.venue}</div>
                  <div className="card-meta">
                    <span className="card-time">🕐 {game.time}</span>
                    <span className="players-count">
                      {game.players}/{game.maxPlayers}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <button
                    className={`btn-join ${full ? "full" : ""}`}
                    onClick={() => joinGame(game.id)}
                    disabled={full || joining === game.id}
                  >
                    {joining === game.id
                      ? "Joining..."
                      : full
                        ? "Game Full"
                        : "Join Game →"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="map-wrap">
          <div className="map-hint">Tap a pin to see game details</div>
          <div ref={mapRef} className="gmap" />
          {selectedGame && (
            <div className="games-grid">
              <div className="game-card" style={{ borderColor: "#00D4FF44" }}>
                <div className="card-top">
                  <div className="sport-badge">
                    <span>{SPORT_ICONS[selectedGame.sport] || "🎯"}</span>
                    <span className="sport-name">{selectedGame.sport}</span>
                  </div>
                  <span
                    className="level-badge"
                    style={{
                      color: LEVEL_COLORS[selectedGame.level] || "#F0F4F8",
                    }}
                  >
                    {selectedGame.level}
                  </span>
                </div>
                <div className="card-title">{selectedGame.title}</div>
                <div className="card-venue">📍 {selectedGame.venue}</div>
                <div className="card-meta">
                  <span className="card-time">🕐 {selectedGame.time}</span>
                  <span className="players-count">
                    {selectedGame.players}/{selectedGame.maxPlayers}
                  </span>
                </div>
                <button
                  className="btn-join"
                  onClick={() => joinGame(selectedGame.id)}
                >
                  Join Game →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button className="fab" onClick={() => router.push("/games/create")}>
        +
      </button>
    </>
  );
}

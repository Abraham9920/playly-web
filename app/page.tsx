'use client';
import { useEffect, useState } from 'react';

const SPORTS = ['ALL', 'PADEL', 'SOCCER', 'YOGA', 'BASKETBALL', 'TENNIS'];

const SPORT_ICONS: Record<string, string> = {
  ALL: '⚡',
  PADEL: '🎾',
  SOCCER: '⚽',
  YOGA: '🧘',
  BASKETBALL: '🏀',
  TENNIS: '🎾',
};

const SPORT_COLORS: Record<string, string> = {
  PADEL: '#00E599',
  SOCCER: '#FFD700',
  YOGA: '#FF6B9D',
  BASKETBALL: '#FF6B2B',
  TENNIS: '#00D4FF',
  ALL: '#00D4FF',
};

interface Game {
  id: string;
  title: string;
  sport: string;
  skillLevel: string;
  venue: string;
  neighborhood: string;
  startsAt: string;
  duration: number;
  maxPlayers: number;
  joinedPlayers: number;
  pricePerPlayer: number;
  status: string;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [filtered, setFiltered] = useState<Game[]>([]);
  const [activeSport, setActiveSport] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://playly-backend-production.up.railway.app/games', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { setGames(data); setFiltered(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = games;
    if (activeSport !== 'ALL') result = result.filter(g => g.sport === activeSport);
    if (search) result = result.filter(g =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.venue.toLowerCase().includes(search.toLowerCase()) ||
      g.neighborhood.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [activeSport, search, games]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const spotsLeft = (g: Game) => g.maxPlayers - g.joinedPlayers;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #060810; color: #F0F4F8; font-family: 'DM Sans', sans-serif; }

        .hero {
          position: relative;
          padding: 60px 24px 40px;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -100px; left: -100px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero::after {
          content: '';
          position: absolute;
          top: -50px; right: -50px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(0,229,153,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 72px;
          line-height: 1;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #00D4FF 0%, #00E599 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tagline {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #4A6070;
          margin-top: 4px;
        }
        .search-wrap {
          margin-top: 32px;
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 16px; top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          opacity: 0.4;
        }
        .search-input {
          width: 100%;
          background: #0E1318;
          border: 1px solid #1C2730;
          border-radius: 12px;
          padding: 14px 16px 14px 44px;
          color: #F0F4F8;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: #2A3A48; }
        .search-input:focus { border-color: #00D4FF44; }

        .filters {
          padding: 0 24px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          margin-bottom: 8px;
        }
        .filters::-webkit-scrollbar { display: none; }
        .filter-btn {
          flex-shrink: 0;
          background: #0E1318;
          border: 1px solid #1C2730;
          border-radius: 100px;
          padding: 8px 16px;
          color: #4A6070;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .filter-btn.active {
          background: #0E1318;
          border-color: var(--sport-color);
          color: var(--sport-color);
          box-shadow: 0 0 12px var(--sport-color-20);
        }

        .section-header {
          padding: 16px 24px 12px;
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 1px;
          color: #F0F4F8;
        }
        .section-count {
          font-size: 13px;
          color: #2A3A48;
          font-weight: 500;
        }

        .cards {
          padding: 0 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card {
          background: #0A0F14;
          border: 1px solid #141E26;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--sport-color) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .card:hover { border-color: #1C2730; transform: translateY(-1px); }
        .card:hover::before { opacity: 1; }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .sport-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--sport-color-10);
          border: 1px solid var(--sport-color-30);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--sport-color);
        }
        .price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 1px;
          color: var(--sport-color);
        }
        .price-label {
          font-size: 10px;
          color: #2A3A48;
          text-align: right;
          margin-top: -2px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: #F0F4F8;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        .card-venue {
          font-size: 13px;
          color: #4A6070;
          margin-bottom: 16px;
        }
        .card-venue span {
          color: #2A8070;
        }

        .card-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #2A3A48;
        }
        .meta-icon { font-size: 13px; }

        .card-footer {
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .spots-bar-wrap {
          flex: 1;
          margin-right: 16px;
        }
        .spots-label {
          font-size: 11px;
          color: #2A3A48;
          margin-bottom: 5px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .spots-bar {
          height: 3px;
          background: #141E26;
          border-radius: 2px;
          overflow: hidden;
        }
        .spots-fill {
          height: 100%;
          background: var(--sport-color);
          border-radius: 2px;
          transition: width 0.6s ease;
        }

        .join-btn {
          background: var(--sport-color);
          color: #060810;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          letter-spacing: 0.5px;
        }
        .join-btn:hover { opacity: 0.85; transform: scale(0.98); }
        .join-btn:disabled {
          background: #1C2730;
          color: #2A3A48;
          cursor: not-allowed;
        }

        .empty {
          text-align: center;
          padding: 60px 24px;
          color: #2A3A48;
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-text { font-size: 16px; }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          gap: 8px;
        }
        .dot {
          width: 8px; height: 8px;
          background: #00D4FF;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; background: #00E599; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-10px); opacity: 1; }
        }

        .skill-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
          margin-right: 2px;
          opacity: 0.6;
        }
      `}</style>

      <div className="hero">
        <div className="logo">Playly</div>
        <div className="tagline">NYC Sports Platform</div>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search games, venues, neighborhoods..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filters">
        {SPORTS.map(sport => {
          const color = SPORT_COLORS[sport] || '#00D4FF';
          return (
            <button
              key={sport}
              className={`filter-btn ${activeSport === sport ? 'active' : ''}`}
              style={{
                '--sport-color': color,
                '--sport-color-20': color + '33',
              } as React.CSSProperties}
              onClick={() => setActiveSport(sport)}
            >
              {SPORT_ICONS[sport]} {sport === 'ALL' ? 'All Sports' : sport.charAt(0) + sport.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      <div className="section-header">
        <div className="section-title">Open Games</div>
        <div className="section-count">{filtered.length} available</div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="dot" /><div className="dot" /><div className="dot" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏟️</div>
          <div className="empty-text">No games found</div>
        </div>
      ) : (
        <div className="cards">
          {filtered.map(g => {
            const color = SPORT_COLORS[g.sport] || '#00D4FF';
            const spots = spotsLeft(g);
            const fillPct = (g.joinedPlayers / g.maxPlayers) * 100;
            return (
              <div
                key={g.id}
                className="card"
                style={{
                  '--sport-color': color,
                  '--sport-color-10': color + '1A',
                  '--sport-color-30': color + '4D',
                } as React.CSSProperties}
              >
                <div className="card-top">
                  <div className="sport-badge">
                    {SPORT_ICONS[g.sport] || '🏃'} {g.sport}
                  </div>
                  <div>
                    <div className="price">${g.pricePerPlayer === 0 ? 'FREE' : g.pricePerPlayer}</div>
                    <div className="price-label">per player</div>
                  </div>
                </div>

                <div className="card-title">{g.title}</div>
                <div className="card-venue">
                  {g.venue} · <span>{g.neighborhood}</span>
                </div>

                <div className="card-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    {formatTime(g.startsAt)}
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">⏱</span>
                    {g.duration} min
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📊</span>
                    {g.skillLevel.charAt(0) + g.skillLevel.slice(1).toLowerCase()}
                  </div>
                </div>

                <div className="card-footer">
                  <div className="spots-bar-wrap">
                    <div className="spots-label">
                      {spots > 0 ? `${spots} spot${spots !== 1 ? 's' : ''} left` : 'Full'}
                    </div>
                    <div className="spots-bar">
                      <div className="spots-fill" style={{ width: `${fillPct}%` }} />
                    </div>
                  </div>
                  <button className="join-btn" disabled={spots === 0}>
                    {spots === 0 ? 'Full' : 'Join →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

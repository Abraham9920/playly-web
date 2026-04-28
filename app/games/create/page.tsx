"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const SPORTS = [
  "Basketball",
  "Soccer",
  "Tennis",
  "Volleyball",
  "Running",
  "Padel",
  "Yoga",
  "Other",
];
const LEVELS = ["Casual", "Beginner", "Intermediate", "Advanced", "All Levels"];
const SPORT_ICONS: Record<string, string> = {
  Basketball: "🏀",
  Soccer: "⚽",
  Tennis: "🎾",
  Volleyball: "🏐",
  Running: "🏃",
  Padel: "🏓",
  Yoga: "🧘",
  Other: "🎯",
};

declare global {
  interface Window {
    google: any;
    initCreateMap: () => void;
  }
}

export default function CreateGame() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    sport: "",
    level: "Casual",
    date: "",
    time: "",
    maxPlayers: 10,
    price: 0,
    description: "",
    venue: "",
    address: "",
    lat: null as number | null,
    lng: null as number | null,
  });

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.758, lng: -73.9855 },
      zoom: 13,
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
      ],
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    // Search box
    const input = document.getElementById("map-search") as HTMLInputElement;
    if (input) {
      const searchBox = new window.google.maps.places.SearchBox(input);
      map.addListener("bounds_changed", () =>
        searchBox.setBounds(map.getBounds()),
      );
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (!places?.length) return;
        const place = places[0];
        if (!place.geometry?.location) return;
        placeMarker(
          place.geometry.location,
          place.name || "",
          place.formatted_address || "",
        );
        map.setCenter(place.geometry.location);
        map.setZoom(15);
      });
    }

    map.addListener("click", (e: any) => {
      placeMarker(e.latLng, "", "");
      reverseGeocode(e.latLng);
    });
  };

  const placeMarker = (location: any, name: string, address: string) => {
    if (markerRef.current) markerRef.current.setMap(null);
    const marker = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: "#00D4FF",
        fillOpacity: 1,
        strokeColor: "#060810",
        strokeWeight: 2,
      },
      animation: window.google.maps.Animation.DROP,
    });
    markerRef.current = marker;
    const lat =
      typeof location.lat === "function" ? location.lat() : location.lat;
    const lng =
      typeof location.lng === "function" ? location.lng() : location.lng;
    setForm((f) => ({
      ...f,
      lat,
      lng,
      venue: name || f.venue,
      address: address || f.address,
    }));
  };

  const reverseGeocode = (latLng: any) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        setForm((f) => ({ ...f, address: results[0].formatted_address }));
      }
    });
  };

  useEffect(() => {
    if (step === 2) {
      if (window.google) {
        initMap();
        return;
      }
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
      window.initCreateMap = initMap;
      if (!document.getElementById("gmaps-script")) {
        const script = document.createElement("script");
        script.id = "gmaps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initCreateMap`;
        script.async = true;
        document.head.appendChild(script);
      } else if (window.google) {
        initMap();
      }
    }
  }, [step]);

  const submit = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://playly-backend-production.up.railway.app/games",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            scheduledAt: `${form.date}T${form.time}:00`,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error creating game");
      router.push("/");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const canNext1 = form.title && form.sport && form.time;
  const canSubmit = form.lat && form.lng;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#060810;font-family:'DM Sans',sans-serif;color:#F0F4F8;min-height:100vh}
        .header{position:sticky;top:0;z-index:100;background:rgba(6,8,16,0.9);backdrop-filter:blur(20px);border-bottom:1px solid #0E1318;padding:0 20px;display:flex;align-items:center;gap:16px;height:60px}
        .back-btn{background:transparent;border:none;color:#4A6070;font-size:20px;cursor:pointer;padding:4px}
        .header-title{font-family:'Bebas Neue',sans-serif;font-size:24px;background:linear-gradient(135deg,#00D4FF,#00E599);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .steps{display:flex;gap:8px;margin-left:auto}
        .step-dot{width:8px;height:8px;border-radius:50%;background:#1C2730;transition:all 0.3s}
        .step-dot.active{background:linear-gradient(135deg,#00D4FF,#00E599);width:24px;border-radius:4px}
        .container{padding:24px 20px 100px;max-width:600px;margin:0 auto}
        .step-title{font-family:'Bebas Neue',sans-serif;font-size:36px;color:#F0F4F8;margin-bottom:4px}
        .step-sub{color:#4A6070;font-size:14px;margin-bottom:28px}
        .field{margin-bottom:20px}
        .label{font-size:12px;color:#4A6070;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;display:block}
        .input{width:100%;background:#0E1318;border:1px solid #1C2730;border-radius:10px;padding:14px 16px;color:#F0F4F8;font-family:'DM Sans',sans-serif;font-size:15px;outline:none;transition:border-color 0.2s}
        .input:focus{border-color:#00D4FF44}
        .input::placeholder{color:#2A3A48}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .sport-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
        .sport-btn{padding:12px 8px;border-radius:12px;border:1px solid #1C2730;background:#0E1318;cursor:pointer;text-align:center;transition:all 0.2s}
        .sport-btn:hover{border-color:#1C2730;background:#0E1318}
        .sport-btn.selected{border-color:#00D4FF;background:#00D4FF11}
        .sport-btn .icon{font-size:22px;margin-bottom:4px}
        .sport-btn .name{font-size:11px;color:#4A6070;font-weight:600}
        .sport-btn.selected .name{color:#00D4FF}
        .level-grid{display:flex;flex-wrap:wrap;gap:8px}
        .level-btn{padding:8px 16px;border-radius:20px;border:1px solid #1C2730;background:#0E1318;color:#4A6070;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s}
        .level-btn.selected{border-color:#00E599;background:#00E59911;color:#00E599}
        .slider-wrap{position:relative}
        .slider{width:100%;-webkit-appearance:none;height:4px;border-radius:2px;background:#1C2730;outline:none}
        .slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#00E599);cursor:pointer;border:2px solid #060810}
        .slider-val{text-align:center;font-size:28px;font-family:'Bebas Neue',sans-serif;color:#00D4FF;margin-bottom:8px}
        .map-search-wrap{position:relative;margin-bottom:12px}
        .map-search{width:100%;background:#0E1318;border:1px solid #1C2730;border-radius:10px;padding:14px 16px 14px 44px;color:#F0F4F8;font-family:'DM Sans',sans-serif;font-size:15px;outline:none}
        .map-search::placeholder{color:#2A3A48}
        .search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:18px}
        .gmap{width:100%;height:380px;border-radius:16px;overflow:hidden;border:1px solid #1C2730;margin-bottom:16px}
        .location-info{background:#0E1318;border:1px solid #1C2730;border-radius:10px;padding:14px 16px;margin-bottom:16px}
        .location-address{font-size:13px;color:#4A6070}
        .location-coords{font-size:12px;color:#2A3A48;margin-top:4px}
        .venue-input{margin-top:12px}
        .map-hint{text-align:center;color:#2A3A48;font-size:13px;margin-bottom:12px}
        .error{background:#FF3B3B11;border:1px solid #FF3B3B33;border-radius:10px;padding:12px 16px;color:#FF6B6B;font-size:13px;margin-bottom:16px}
        .btn-next{width:100%;background:linear-gradient(135deg,#00D4FF,#00E599);border:none;border-radius:12px;padding:16px;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;color:#060810;cursor:pointer;transition:opacity 0.2s;margin-top:8px}
        .btn-next:disabled{opacity:0.3;cursor:not-allowed}
        .preview-card{background:#0A0F18;border:1px solid #1C2730;border-radius:16px;padding:20px;margin-bottom:20px}
        .preview-sport{display:flex;align-items:center;gap:8px;margin-bottom:12px}
        .preview-icon{font-size:28px}
        .preview-sport-name{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#F0F4F8}
        .preview-title{font-size:20px;font-weight:700;color:#F0F4F8;margin-bottom:8px}
        .preview-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
        .meta-tag{background:#0E1318;border-radius:8px;padding:6px 12px;font-size:13px;color:#4A6070}
        textarea.input{resize:vertical;min-height:80px}
      `}</style>

      <header className="header">
        <button
          className="back-btn"
          onClick={() => (step === 1 ? router.push("/") : setStep(1))}
        >
          ←
        </button>
        <div className="header-title">Create Game</div>
        <div className="steps">
          <div className={`step-dot ${step >= 1 ? "active" : ""}`} />
          <div className={`step-dot ${step >= 2 ? "active" : ""}`} />
          <div className={`step-dot ${step >= 3 ? "active" : ""}`} />
        </div>
      </header>

      <div className="container">
        {/* STEP 1: Game Details */}
        {step === 1 && (
          <>
            <div className="step-title">Game Details</div>
            <div className="step-sub">
              What kind of game are you organizing?
            </div>

            <div className="field">
              <label className="label">Sport</label>
              <div className="sport-grid">
                {SPORTS.map((s) => (
                  <button
                    key={s}
                    className={`sport-btn ${form.sport === s ? "selected" : ""}`}
                    onClick={() => set("sport", s)}
                  >
                    <div className="icon">{SPORT_ICONS[s]}</div>
                    <div className="name">{s}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label">Game Title</label>
              <input
                className="input"
                placeholder="e.g. Pickup Basketball at W4"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label">Skill Level</label>
              <div className="level-grid">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    className={`level-btn ${form.level === l ? "selected" : ""}`}
                    onClick={() => set("level", l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label className="label">Date</label>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="field">
                <label className="label">Time</label>
                <input
                  className="input"
                  type="time"
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">
                Max Players:{" "}
                <span style={{ color: "#00D4FF" }}>{form.maxPlayers}</span>
              </label>
              <div className="slider-val">{form.maxPlayers}</div>
              <input
                className="slider"
                type="range"
                min="2"
                max="50"
                value={form.maxPlayers}
                onChange={(e) => set("maxPlayers", Number(e.target.value))}
              />
            </div>

            <div className="row">
              <div className="field">
                <label className="label">Price per player ($)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0 = free"
                  value={form.price || ""}
                  onChange={(e) => set("price", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Description (optional)</label>
              <textarea
                className="input"
                placeholder="Tell players what to bring, rules, etc."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <button
              className="btn-next"
              disabled={!canNext1}
              onClick={() => setStep(2)}
            >
              Next: Pick Location →
            </button>
          </>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <>
            <div className="step-title">Pick Location</div>
            <div className="step-sub">Search for a venue or tap on the map</div>

            <div className="map-search-wrap">
              <span className="search-icon">🔍</span>
              <input
                id="map-search"
                className="map-search"
                placeholder="Search venue, park, court..."
              />
            </div>

            <div className="map-hint">
              Tap anywhere on the map to drop a pin
            </div>
            <div ref={mapRef} className="gmap" />

            {form.lat && form.lng ? (
              <div className="location-info">
                <div className="location-address">
                  📍 {form.address || "Location selected"}
                </div>
                <div className="location-coords">
                  {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                </div>
              </div>
            ) : (
              <div className="location-info">
                <div className="location-address" style={{ color: "#2A3A48" }}>
                  No location selected yet
                </div>
              </div>
            )}

            <div className="field venue-input">
              <label className="label">Venue Name</label>
              <input
                className="input"
                placeholder="e.g. West 4th Street Courts"
                value={form.venue}
                onChange={(e) => set("venue", e.target.value)}
              />
            </div>

            <button
              className="btn-next"
              disabled={!canSubmit}
              onClick={() => setStep(3)}
            >
              Next: Review →
            </button>
          </>
        )}

        {/* STEP 3: Review & Submit */}
        {step === 3 && (
          <>
            <div className="step-title">Review Game</div>
            <div className="step-sub">Everything look good?</div>

            <div className="preview-card">
              <div className="preview-sport">
                <span className="preview-icon">
                  {SPORT_ICONS[form.sport] || "🎯"}
                </span>
                <span className="preview-sport-name">{form.sport}</span>
              </div>
              <div className="preview-title">{form.title}</div>
              <div className="preview-meta">
                <span className="meta-tag">
                  📅 {form.date} {form.time}
                </span>
                <span className="meta-tag">👥 Max {form.maxPlayers}</span>
                <span className="meta-tag" style={{ color: "#00E599" }}>
                  ⚡ {form.level}
                </span>
                {form.price > 0 && (
                  <span className="meta-tag" style={{ color: "#00D4FF" }}>
                    ${form.price}/player
                  </span>
                )}
                {form.price === 0 && (
                  <span className="meta-tag" style={{ color: "#00E599" }}>
                    FREE
                  </span>
                )}
              </div>
              <div className="location-address" style={{ marginTop: 8 }}>
                📍 {form.venue || form.address}
              </div>
              {form.description && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#4A6070" }}>
                  {form.description}
                </div>
              )}
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn-next" disabled={loading} onClick={submit}>
              {loading ? "Creating..." : "🚀 Create Game"}
            </button>

            <button
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid #1C2730",
                borderRadius: 12,
                padding: 14,
                color: "#4A6070",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 14,
                cursor: "pointer",
                marginTop: 8,
              }}
              onClick={() => setStep(2)}
            >
              ← Edit Location
            </button>
          </>
        )}
      </div>
    </>
  );
}

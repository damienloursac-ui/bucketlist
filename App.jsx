import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase.js";

/* ══════════════════════════════════════════════
   CONSTANTES
══════════════════════════════════════════════ */
const CATEGORIES = [
  { id: "all",       label: "Tous",        emoji: "✦"  },
  { id: "adventure", label: "Aventure",    emoji: "🧗" },
  { id: "nature",    label: "Nature",      emoji: "🌿" },
  { id: "ocean",     label: "Océan",       emoji: "🌊" },
  { id: "culture",   label: "Culture",     emoji: "🎭" },
  { id: "food",      label: "Gastronomie", emoji: "🍜" },
  { id: "travel",    label: "Voyage",      emoji: "✈️" },
  { id: "sport",     label: "Sport",       emoji: "🏆" },
  { id: "art",       label: "Art",         emoji: "🎨" },
];

const CAT_BG = {
  adventure: "linear-gradient(135deg,#1a0a00,#3d1f00)",
  nature:    "linear-gradient(135deg,#001a0a,#003d1f)",
  ocean:     "linear-gradient(135deg,#00091a,#00213d)",
  culture:   "linear-gradient(135deg,#1a0015,#3d0033)",
  food:      "linear-gradient(135deg,#1a0800,#3d1c00)",
  travel:    "linear-gradient(135deg,#001219,#004d5c)",
  sport:     "linear-gradient(135deg,#0a001a,#1f003d)",
  art:       "linear-gradient(135deg,#19001a,#3c003d)",
};

const CAT_EMOJI = {
  adventure:"🏔️", nature:"🌌", ocean:"🌊",
  culture:"🏛️",  food:"🍜",   travel:"✈️",
  sport:"🏆",     art:"🎨",
};

/* ══════════════════════════════════════════════
   STYLES PARTAGÉS
══════════════════════════════════════════════ */
const S = {
  modal:    { background:"#080810", border:"1px solid rgba(212,175,55,0.28)", borderRadius:"1.1rem", overflow:"hidden", boxShadow:"0 0 80px rgba(212,175,55,0.1)", width:"100%" },
  mHead:    { padding:"1.25rem 1.5rem", borderBottom:"1px solid #131326", display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  mTitle:   { margin:0, color:"white", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", fontWeight:600 },
  mBody:    { padding:"1.25rem 1.5rem", display:"flex", flexDirection:"column", gap:"1.05rem" },
  eyebrow:  { color:"#d4af37", fontSize:"0.62rem", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Lato',sans-serif", display:"block", marginBottom:"0.4rem" },
  closeBtn: { background:"none", border:"1px solid #222", color:"#666", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:"1.1rem", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  input:    { width:"100%", padding:"0.7rem 0.9rem", background:"#101020", border:"1px solid #222", borderRadius:"0.5rem", color:"white", fontFamily:"'Lato',sans-serif", fontSize:"0.92rem", outline:"none", boxSizing:"border-box" },
  pill:     { padding:"0.35rem 0.75rem", borderRadius:"2rem", border:"1px solid #222", background:"transparent", color:"#666", cursor:"pointer", fontSize:"0.75rem", fontFamily:"'Lato',sans-serif", transition:"all 0.18s" },
  pillOn:   { border:"1px solid #d4af37", background:"rgba(212,175,55,0.14)", color:"#d4af37" },
  btnGold:  { width:"100%", padding:"0.75rem", background:"linear-gradient(135deg,#d4af37,#b8960f)", border:"none", borderRadius:"0.55rem", color:"#000", cursor:"pointer", fontWeight:700, fontFamily:"'Lato',sans-serif", fontSize:"0.9rem", letterSpacing:"0.4px" },
  btnGhost: { padding:"0.65rem 1rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", background:"transparent", border:"1px solid #2a2a3a", borderRadius:"0.5rem", color:"#888", cursor:"pointer", fontFamily:"'Lato',sans-serif", fontSize:"0.85rem", width:"100%" },
};

/* ══════════════════════════════════════════════
   UTILITAIRE
══════════════════════════════════════════════ */
function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = e => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ══════════════════════════════════════════════
   OVERLAY
══════════════════════════════════════════════ */
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:300,
      background:"rgba(0,0,0,0.88)", backdropFilter:"blur(12px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"1rem", overflowY:"auto",
    }}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:500 }}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAGE AUTH (Inscription / Connexion)
══════════════════════════════════════════════ */
function AuthPage({ onAuth }) {
  const [mode, setMode]       = useState("login"); // login | register
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Compte créé ! Vérifie ton email pour confirmer, puis connecte-toi.");
        setMode("login");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch (e) {
      setError(e.message || "Une erreur est survenue.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#060609",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"1rem", fontFamily:"'Lato',sans-serif",
      position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 30px #101020 inset !important; -webkit-text-fill-color:white !important; }
      `}</style>

      {/* Étoiles déco */}
      {[...Array(30)].map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          left:`${(i*3.4)%100}%`, top:`${(i*7.1)%100}%`,
          width: i%5===0?3:1.5, height: i%5===0?3:1.5,
          borderRadius:"50%", background:"#d4af37",
          opacity:0.04+(i%6)*0.05,
        }} />
      ))}

      <div style={{ width:"100%", maxWidth:420, animation:"fadeUp 0.5s ease" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <p style={{ color:"#d4af37", fontSize:"0.6rem", letterSpacing:"4px", textTransform:"uppercase", marginBottom:"0.5rem", fontWeight:300 }}>
            ✦ bienvenue ✦
          </p>
          <h1 style={{
            fontFamily:"'Cormorant Garamond',serif", fontSize:"3rem", fontWeight:700,
            background:"linear-gradient(135deg,#fff 20%,#d4af37 55%,#f5d98e 78%,#fff 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
          }}>Bucket List</h1>
          <p style={{ color:"#444", fontSize:"0.82rem", marginTop:"0.5rem" }}>
            {mode === "login" ? "Connecte-toi pour accéder à tes rêves" : "Crée ton compte pour commencer"}
          </p>
        </div>

        {/* Card */}
        <div style={{ background:"#0a0a12", border:"1px solid rgba(212,175,55,0.2)", borderRadius:"1.25rem", overflow:"hidden", boxShadow:"0 0 80px rgba(212,175,55,0.08)" }}>
          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:"1px solid #131326" }}>
            {[["login","Connexion"],["register","Inscription"]].map(([v,l]) => (
              <button key={v} onClick={() => { setMode(v); setError(""); setSuccess(""); }} style={{
                flex:1, padding:"1rem", border:"none", cursor:"pointer",
                background: mode===v ? "rgba(212,175,55,0.08)" : "transparent",
                color: mode===v ? "#d4af37" : "#555",
                fontFamily:"'Lato',sans-serif", fontSize:"0.85rem", fontWeight: mode===v ? 700 : 400,
                borderBottom: mode===v ? "2px solid #d4af37" : "2px solid transparent",
                transition:"all 0.2s",
              }}>{l}</button>
            ))}
          </div>

          <div style={{ padding:"1.75rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
            {/* Email */}
            <div>
              <span style={S.eyebrow}>Email</span>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="ton@email.com"
                style={S.input}
                autoFocus
              />
            </div>

            {/* Mot de passe */}
            <div>
              <span style={S.eyebrow}>Mot de passe</span>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={mode === "register" ? "Min. 6 caractères" : "••••••••"}
                style={S.input}
              />
            </div>

            {/* Erreur / Succès */}
            {error   && <p style={{ color:"#ef4444", fontSize:"0.8rem", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"0.5rem", padding:"0.65rem 0.9rem" }}>{error}</p>}
            {success && <p style={{ color:"#22c55e", fontSize:"0.8rem", background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:"0.5rem", padding:"0.65rem 0.9rem" }}>{success}</p>}

            {/* Bouton */}
            <button
              onClick={handleSubmit}
              disabled={loading || !email.trim() || !password.trim()}
              style={{
                ...S.btnGold, marginTop:"0.25rem",
                opacity: loading || !email.trim() || !password.trim() ? 0.4 : 1,
                cursor: loading || !email.trim() || !password.trim() ? "default" : "pointer",
              }}
            >
              {loading ? "Chargement…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </div>
        </div>

        <p style={{ textAlign:"center", color:"#333", fontSize:"0.72rem", marginTop:"1.5rem" }}>
          Tes données sont sécurisées et privées ✦
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ZONE UPLOAD PHOTO
══════════════════════════════════════════════ */
function PhotoUpload({ photo, onChange }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);

  const handle = async files => {
    const file = [...(files || [])].find(f => f.type.startsWith("image/"));
    if (!file) return;
    const dataUrl = await readFile(file);
    onChange(dataUrl);
  };

  const openPicker = e => { e.stopPropagation(); ref.current.click(); };

  return (
    <div onClick={e => e.stopPropagation()}>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }}
        onChange={e => handle(e.target.files)} />

      {photo ? (
        <div style={{ position:"relative", borderRadius:"0.75rem", overflow:"hidden", height:180 }}>
          <img src={photo} alt="aperçu" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 50%)" }} />
          <div style={{ position:"absolute", top:"0.6rem", right:"0.6rem", display:"flex", gap:"0.4rem" }}>
            <button onClick={openPicker} style={{ background:"rgba(0,0,0,0.65)", border:"1px solid #444", borderRadius:"0.4rem", color:"#ccc", padding:"0.28rem 0.6rem", cursor:"pointer", fontSize:"0.7rem", fontFamily:"'Lato',sans-serif" }}>🔄 Changer</button>
            <button onClick={e => { e.stopPropagation(); onChange(null); }} style={{ background:"rgba(180,0,0,0.65)", border:"none", borderRadius:"0.4rem", color:"white", padding:"0.28rem 0.6rem", cursor:"pointer", fontSize:"0.7rem", fontFamily:"'Lato',sans-serif" }}>✕</button>
          </div>
          <span style={{ position:"absolute", bottom:"0.65rem", left:"0.85rem", color:"#d4af37", fontSize:"0.68rem", fontFamily:"'Lato',sans-serif" }}>✓ Photo sélectionnée</span>
        </div>
      ) : (
        <div
          onClick={openPicker}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDrag(true); }}
          onDragLeave={e => { e.stopPropagation(); setDrag(false); }}
          onDrop={e => { e.preventDefault(); e.stopPropagation(); setDrag(false); handle(e.dataTransfer.files); }}
          style={{
            border:`2px dashed ${drag ? "#d4af37" : "#252535"}`,
            borderRadius:"0.75rem", padding:"1.6rem 1rem",
            textAlign:"center", cursor:"pointer",
            background: drag ? "rgba(212,175,55,0.06)" : "transparent",
            transition:"all 0.2s",
          }}
        >
          <div style={{ fontSize:"1.8rem", marginBottom:"0.5rem", opacity:0.6 }}>🖼️</div>
          <p style={{ margin:0, color:"#666", fontSize:"0.82rem", fontFamily:"'Lato',sans-serif" }}>Clique ou glisse une photo ici</p>
          <p style={{ margin:"0.25rem 0 0", color:"#383848", fontSize:"0.7rem", fontFamily:"'Lato',sans-serif" }}>JPG · PNG · WEBP — optionnel</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MODALE — AJOUTER UN RÊVE
══════════════════════════════════════════════ */
function AddModal({ onClose, onAdd }) {
  const [title, setTitle]       = useState("");
  const [category, setCategory] = useState("adventure");
  const [photo, setPhoto]       = useState(null);
  const [note, setNote]         = useState("");
  const [saving, setSaving]     = useState(false);

  const canCreate = title.trim().length > 0;

  const handleCreate = async () => {
    if (!canCreate || saving) return;
    setSaving(true);
    await onAdd({ title:title.trim(), category, photo, note:note.trim() });
    setSaving(false);
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <div style={S.modal}>
        <div style={S.mHead}>
          <div>
            <span style={S.eyebrow}>Nouvelle entrée</span>
            <h2 style={S.mTitle}>✨ Nouveau rêve</h2>
          </div>
          <button onClick={onClose} style={S.closeBtn}>×</button>
        </div>
        <div style={S.mBody}>
          <div>
            <span style={S.eyebrow}>Ton rêve <span style={{ color:"#ef4444" }}>*</span></span>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && canCreate && handleCreate()}
              placeholder="Ex : Voir les cerisiers au Japon…" style={S.input} />
          </div>
          <div>
            <span style={S.eyebrow}>Catégorie</span>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
              {CATEGORIES.filter(c => c.id !== "all").map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  style={{ ...S.pill, ...(category === c.id ? S.pillOn : {}) }}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span style={S.eyebrow}>Photo <span style={{ color:"#3a3a5a", fontWeight:400, letterSpacing:0, textTransform:"none", fontSize:"0.7rem" }}>— optionnel</span></span>
            <PhotoUpload photo={photo} onChange={setPhoto} />
          </div>
          <div>
            <span style={S.eyebrow}>Note <span style={{ color:"#3a3a5a", fontWeight:400, letterSpacing:0, textTransform:"none", fontSize:"0.7rem" }}>— optionnel</span></span>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Pourquoi ce rêve te tient à cœur…" rows={2}
              style={{ ...S.input, resize:"none" }} />
          </div>
          <button onClick={handleCreate} disabled={!canCreate || saving} style={{
            ...S.btnGold,
            opacity: canCreate && !saving ? 1 : 0.35,
            cursor: canCreate && !saving ? "pointer" : "default",
          }}>
            {saving ? "Enregistrement…" : "✨ Créer ce rêve"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ══════════════════════════════════════════════
   MODALE — ACCOMPLIR
══════════════════════════════════════════════ */
function CompleteModal({ dream, onClose, onComplete }) {
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [location, setLocation] = useState(null);
  const [locName, setLocName]   = useState("");
  const [note, setNote]         = useState(dream.note || "");
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving]     = useState(false);

  const detect = () => {
    setLocating(true); setLocError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords:{ latitude:lat, longitude:lng } }) => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const d = await r.json();
          const city = d.address?.city || d.address?.town || d.address?.village || "";
          const country = d.address?.country || "";
          const name = [city,country].filter(Boolean).join(", ") || `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
          setLocation({ lat, lng, name }); setLocName(name);
        } catch {
          setLocation({ lat, lng, name:`${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          setLocName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
        setLocating(false);
      },
      () => { setLocError("Géolocalisation refusée ou indisponible."); setLocating(false); },
      { timeout:10000, enableHighAccuracy:true }
    );
  };

  const confirm = async () => {
    setSaving(true);
    await onComplete({ ...dream, done:true, date, location: location ? { ...location, name:locName } : null, note });
    setSaving(false);
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <div style={S.modal}>
        <div style={{ ...S.mHead, background:"linear-gradient(135deg,rgba(212,175,55,0.13),transparent)" }}>
          <div>
            <div style={{ fontSize:"1.8rem", marginBottom:"0.2rem" }}>🏆</div>
            <h2 style={S.mTitle}>Rêve accompli !</h2>
            <p style={{ margin:0, color:"#d4af37", fontSize:"0.82rem", fontStyle:"italic" }}>« {dream.title} »</p>
          </div>
          <button onClick={onClose} style={S.closeBtn}>×</button>
        </div>
        <div style={S.mBody}>
          <div>
            <span style={S.eyebrow}>Date de réalisation</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ ...S.input, colorScheme:"dark" }} />
          </div>
          <div>
            <span style={S.eyebrow}>Où étais-tu ?</span>
            {location ? (
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.65rem 0.9rem", background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.25)", borderRadius:"0.5rem" }}>
                <span>📍</span>
                <input value={locName} onChange={e => setLocName(e.target.value)}
                  style={{ flex:1, background:"transparent", border:"none", color:"#d4af37", fontFamily:"inherit", outline:"none", fontSize:"0.9rem" }} />
                <button onClick={() => { setLocation(null); setLocName(""); }}
                  style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:"1rem" }}>×</button>
              </div>
            ) : (
              <>
                <button onClick={detect} disabled={locating} style={S.btnGhost}>
                  {locating ? "📍 Localisation en cours…" : "📍 Détecter ma position GPS"}
                </button>
                {locError && <p style={{ margin:"0.35rem 0 0", color:"#ef4444", fontSize:"0.75rem" }}>{locError}</p>}
              </>
            )}
          </div>
          <div>
            <span style={S.eyebrow}>Ton ressenti</span>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Comment tu t'es senti ? C'était comment ?" rows={3}
              style={{ ...S.input, resize:"none" }} />
          </div>
          <div style={{ display:"flex", gap:"0.65rem" }}>
            <button onClick={onClose} style={{ ...S.btnGhost, flex:1 }}>Annuler</button>
            <button onClick={confirm} disabled={saving} style={{ ...S.btnGold, flex:2, opacity:saving?0.5:1 }}>
              {saving ? "Enregistrement…" : "Confirmer 🏆"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ══════════════════════════════════════════════
   MODALE — CARTE
══════════════════════════════════════════════ */
function MapModal({ dream, onClose }) {
  const { location, title } = dream;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-.12},${location.lat-.12},${location.lng+.12},${location.lat+.12}&layer=mapnik&marker=${location.lat},${location.lng}`;
  return (
    <Overlay onClose={onClose}>
      <div style={{ ...S.modal, maxWidth:660 }}>
        <div style={S.mHead}>
          <div>
            <span style={S.eyebrow}>Réalisé à</span>
            <h2 style={S.mTitle}>{location.name}</h2>
            <p style={{ margin:0, color:"#888", fontSize:"0.78rem", fontStyle:"italic" }}>« {title} »</p>
          </div>
          <button onClick={onClose} style={S.closeBtn}>×</button>
        </div>
        <iframe title="carte" src={src} style={{ width:"100%", height:320, border:"none", display:"block" }} />
        <div style={{ padding:"0.6rem 1.4rem", borderTop:"1px solid #131326" }}>
          <span style={{ color:"#444", fontSize:"0.7rem", fontFamily:"monospace" }}>📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
        </div>
      </div>
    </Overlay>
  );
}

/* ══════════════════════════════════════════════
   CARTE RÊVE
══════════════════════════════════════════════ */
function DreamCard({ dream, onComplete, onDelete, onMap }) {
  const [hover, setHover] = useState(false);
  const cat = CATEGORIES.find(c => c.id === dream.category);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius:"1rem", overflow:"hidden",
        border:`1px solid ${dream.done ? "rgba(212,175,55,0.45)" : hover ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.04)"}`,
        background:"#0d0d18",
        transform: hover ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hover ? "0 24px 48px rgba(0,0,0,0.55)" : "none",
        transition:"all 0.28s ease",
        display:"flex", flexDirection:"column",
      }}
    >
      {/* Visuel */}
      <div style={{ position:"relative", height:200, overflow:"hidden", flexShrink:0 }}>
        {dream.photo ? (
          <img src={dream.photo} alt={dream.title} style={{
            width:"100%", height:"100%", objectFit:"cover", display:"block",
            filter: dream.done ? "none" : "brightness(0.72) saturate(0.8)",
            transform: hover ? "scale(1.06)" : "scale(1)",
            transition:"transform 0.45s ease",
          }} />
        ) : (
          <div style={{ width:"100%", height:"100%", background:CAT_BG[dream.category]||"#0d0d18", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
            <span style={{ fontSize:"3.2rem" }}>{CAT_EMOJI[dream.category]||"🌟"}</span>
            <span style={{ color:"rgba(255,255,255,0.15)", fontSize:"0.65rem", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Lato',sans-serif" }}>Pas de photo</span>
          </div>
        )}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 55%)" }} />
        <span style={{ position:"absolute", top:"0.7rem", left:"0.7rem", background:"rgba(0,0,0,0.58)", backdropFilter:"blur(6px)", border:"1px solid rgba(255,255,255,0.07)", color:"#ccc", fontSize:"0.67rem", padding:"0.22rem 0.6rem", borderRadius:"2rem", fontFamily:"'Lato',sans-serif" }}>
          {cat?.emoji} {cat?.label}
        </span>
        {dream.done && (
          <div style={{ position:"absolute", top:"0.7rem", right:"0.7rem", background:"#d4af37", borderRadius:"50%", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem", fontWeight:700, color:"#000" }}>✓</div>
        )}
        {hover && (
          <button onClick={() => onDelete(dream.id)} style={{ position:"absolute", bottom:"0.7rem", right:"0.7rem", background:"rgba(200,30,30,0.82)", border:"none", borderRadius:"0.4rem", color:"white", cursor:"pointer", padding:"0.28rem 0.6rem", fontSize:"0.67rem", fontFamily:"'Lato',sans-serif" }}>
            🗑 Supprimer
          </button>
        )}
      </div>

      {/* Infos */}
      <div style={{ padding:"0.9rem 1rem 0.5rem", flex:1, display:"flex", flexDirection:"column", gap:"0.3rem" }}>
        <h3 style={{ margin:0, color:"white", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem", lineHeight:1.3 }}>{dream.title}</h3>
        {dream.done && dream.date && (
          <p style={{ margin:0, color:"#666", fontSize:"0.71rem" }}>
            📅 {new Date(dream.date).toLocaleDateString("fr-FR",{ day:"numeric", month:"long", year:"numeric" })}
          </p>
        )}
        {dream.location && (
          <button onClick={() => onMap(dream)} style={{ background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:"0.3rem" }}>
            <span style={{ color:"#d4af37", fontSize:"0.68rem" }}>📍</span>
            <span style={{ color:"#d4af37", fontSize:"0.71rem", textDecoration:"underline dotted #d4af3770" }}>{dream.location.name}</span>
          </button>
        )}
        {dream.note && (
          <p style={{ margin:"0.2rem 0 0", color:"#555", fontSize:"0.77rem", fontStyle:"italic", lineHeight:1.4 }}>« {dream.note} »</p>
        )}
      </div>

      {/* Bouton accomplir */}
      {!dream.done && (
        <div style={{ padding:"0.5rem 1rem 0.9rem" }}>
          <button onClick={() => onComplete(dream)} style={{
            width:"100%", padding:"0.58rem",
            background: hover ? "rgba(212,175,55,0.12)" : "transparent",
            border:"1px solid rgba(212,175,55,0.28)", borderRadius:"0.5rem",
            color:"#d4af37", cursor:"pointer", fontFamily:"'Lato',sans-serif", fontSize:"0.81rem",
            transition:"background 0.2s",
          }}>✓ Marquer accompli</button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   APP PRINCIPALE
══════════════════════════════════════════════ */
export default function App() {
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dreams, setDreams]       = useState([]);
  const [dreamsLoading, setDreamsLoading] = useState(false);
  const [catFilter, setCatFilter] = useState("all");
  const [status, setStatus]       = useState("all");
  const [showAdd, setShowAdd]     = useState(false);
  const [completing, setCompleting] = useState(null);
  const [mapping, setMapping]     = useState(null);
  const [toast, setToast]         = useState("");

  /* ── Auth listener ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ── Charger les rêves quand connecté ── */
  useEffect(() => {
    if (!user) { setDreams([]); return; }
    setDreamsLoading(true);
    supabase
      .from("dreams")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setDreams(data);
        setDreamsLoading(false);
      });
  }, [user]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  /* ── CRUD Supabase ── */
  const handleAdd = async ({ title, category, photo, note }) => {
    const { data, error } = await supabase.from("dreams").insert([{
      user_id: user.id, title, category, photo, note,
      done: false, date: null, location: null,
    }]).select().single();
    if (!error && data) {
      setDreams(p => [data, ...p]);
      showToast("✨ Rêve ajouté !");
    } else {
      showToast("❌ Erreur lors de l'ajout.");
    }
  };

  const handleDelete = async id => {
    const { error } = await supabase.from("dreams").delete().eq("id", id);
    if (!error) {
      setDreams(p => p.filter(d => d.id !== id));
      showToast("🗑 Rêve supprimé.");
    }
  };

  const handleComplete = async updated => {
    const { error } = await supabase.from("dreams").update({
      done: true,
      date: updated.date,
      location: updated.location,
      note: updated.note,
    }).eq("id", updated.id);
    if (!error) {
      setDreams(p => p.map(x => x.id === updated.id ? { ...x, ...updated } : x));
      showToast("🏆 Rêve accompli !");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDreams([]);
  };

  /* ── Loading initial ── */
  if (authLoading) {
    return (
      <div style={{ minHeight:"100vh", background:"#060609", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:40, height:40, border:"3px solid #1a1a2e", borderTopColor:"#d4af37", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 1rem" }} />
          <p style={{ color:"#555", fontFamily:"'Lato',sans-serif", fontSize:"0.85rem" }}>Chargement…</p>
        </div>
      </div>
    );
  }

  /* ── Page Auth ── */
  if (!user) return <AuthPage onAuth={setUser} />;

  /* ── App principale ── */
  const filtered = dreams.filter(d => {
    const catOk = catFilter === "all" || d.category === catFilter;
    const stOk  = status === "all"    || (status === "done" ? d.done : !d.done);
    return catOk && stOk;
  });

  const total = dreams.length;
  const done  = dreams.filter(d => d.done).length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight:"100vh", background:"#060609", color:"white", fontFamily:"'Lato',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:#0a0a0f; } ::-webkit-scrollbar-thumb { background:#222; border-radius:2px; }
      `}</style>

      {/* ══ HEADER ══ */}
      <header style={{ background:"linear-gradient(160deg,#080812 0%,#0c0c1e 55%,#08080e 100%)", borderBottom:"1px solid #131326", padding:"2.5rem 2rem 2rem", position:"relative", overflow:"hidden" }}>
        {[...Array(20)].map((_,i) => (
          <div key={i} style={{ position:"absolute", left:`${(i*5.1)%100}%`, top:`${(i*7.3)%100}%`, width:i%4===0?3:1.5, height:i%4===0?3:1.5, borderRadius:"50%", background:"#d4af37", opacity:0.05+(i%6)*0.05 }} />
        ))}

        <div style={{ maxWidth:1120, margin:"0 auto" }}>
          {/* Titre + user */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.5rem" }}>
            <div>
              <p style={{ color:"#d4af37", fontSize:"0.6rem", letterSpacing:"4px", textTransform:"uppercase", marginBottom:"0.4rem", fontWeight:300 }}>✦ mes rêves à accomplir ✦</p>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:700, background:"linear-gradient(135deg,#fff 20%,#d4af37 55%,#f5d98e 78%,#fff 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Bucket List</h1>
            </div>
            {/* Profil + déconnexion */}
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", flexShrink:0 }}>
              <div style={{ textAlign:"right" }}>
                <p style={{ margin:0, color:"#888", fontSize:"0.68rem", letterSpacing:"1px" }}>Connecté en tant que</p>
                <p style={{ margin:0, color:"#d4af37", fontSize:"0.78rem", fontWeight:700, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</p>
              </div>
              <button onClick={handleSignOut} style={{
                padding:"0.5rem 0.9rem", background:"transparent",
                border:"1px solid #2a2a3a", borderRadius:"0.5rem",
                color:"#666", cursor:"pointer", fontFamily:"'Lato',sans-serif",
                fontSize:"0.75rem", whiteSpace:"nowrap",
              }}>Déconnexion</button>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"2rem", flexWrap:"wrap" }}>
            {/* Progression */}
            <div style={{ minWidth:200 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.4rem" }}>
                <span style={{ color:"#555", fontSize:"0.63rem", letterSpacing:"1.5px", textTransform:"uppercase" }}>Progression</span>
                <span style={{ color:"#d4af37", fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem" }}>{pct}%</span>
              </div>
              <div style={{ height:5, background:"#13132a", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#9a7209,#d4af37,#f5d169)", borderRadius:3, transition:"width 0.5s ease" }} />
              </div>
            </div>

            {/* Compteurs */}
            <div style={{ display:"flex", gap:"1.5rem" }}>
              {[[done,"Accomplis",true],[total-done,"Restants",false],[total,"Total",false]].map(([v,l,g]) => (
                <div key={l}>
                  <p style={{ margin:0, color:g?"#d4af37":"#888", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontWeight:600, lineHeight:1 }}>{v}</p>
                  <p style={{ margin:"0.2rem 0 0", color:"#444", fontSize:"0.58rem", letterSpacing:"1.5px", textTransform:"uppercase" }}>{l}</p>
                </div>
              ))}
            </div>

            <button onClick={() => setShowAdd(true)} style={{ marginLeft:"auto", padding:"0.7rem 1.4rem", background:"linear-gradient(135deg,#d4af37,#b8960f)", border:"none", borderRadius:"0.6rem", color:"#000", cursor:"pointer", fontWeight:700, fontFamily:"'Lato',sans-serif", fontSize:"0.88rem", boxShadow:"0 4px 24px rgba(212,175,55,0.33)", display:"flex", alignItems:"center", gap:"0.5rem", whiteSpace:"nowrap" }}>
              ＋ Nouveau rêve
            </button>
          </div>
        </div>
      </header>

      {/* ══ FILTRES ══ */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(6,6,9,0.93)", backdropFilter:"blur(14px)", borderBottom:"1px solid #131326", padding:"0.65rem 2rem" }}>
        <div style={{ maxWidth:1120, margin:"0 auto", display:"flex", gap:"1.25rem", alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:"0.35rem", overflowX:"auto", flex:1, paddingBottom:2 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCatFilter(c.id)}
                style={{ ...S.pill, ...(catFilter===c.id?S.pillOn:{}), whiteSpace:"nowrap" }}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:"0.3rem", flexShrink:0 }}>
            {[["all","Tous"],["todo","À faire"],["done","✓ Faits"]].map(([v,l]) => (
              <button key={v} onClick={() => setStatus(v)} style={{ padding:"0.35rem 0.7rem", border:"none", background:status===v?"rgba(255,255,255,0.09)":"transparent", color:status===v?"white":"#555", cursor:"pointer", fontSize:"0.74rem", borderRadius:"0.4rem", fontFamily:"'Lato',sans-serif" }}>{l}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* ══ GRILLE ══ */}
      <main style={{ maxWidth:1120, margin:"0 auto", padding:"2rem" }}>
        {dreamsLoading ? (
          <div style={{ textAlign:"center", padding:"4rem" }}>
            <div style={{ width:36, height:36, border:"3px solid #1a1a2e", borderTopColor:"#d4af37", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 1rem" }} />
            <p style={{ color:"#555", fontFamily:"'Lato',sans-serif", fontSize:"0.85rem" }}>Chargement de tes rêves…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"5rem 2rem" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>🌟</div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", color:"#444" }}>
              {dreams.length === 0 ? "Ajoute ton premier rêve !" : "Aucun rêve dans cette sélection."}
            </p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:"1.4rem" }}>
            {filtered.map((d,i) => (
              <div key={d.id} style={{ animation:`fadeUp 0.4s ease ${i*0.06}s both` }}>
                <DreamCard dream={d} onComplete={setCompleting} onDelete={handleDelete} onMap={setMapping} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ══ TOAST ══ */}
      <div style={{
        position:"fixed", bottom:"2rem", left:"50%",
        transform:`translateX(-50%) translateY(${toast ? 0 : "80px"})`,
        opacity: toast ? 1 : 0,
        transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        zIndex:400,
        background:"linear-gradient(135deg,#1a1a2e,#0d0d18)",
        border:"1px solid rgba(212,175,55,0.4)",
        borderRadius:"2rem", padding:"0.75rem 1.5rem",
        display:"flex", alignItems:"center", gap:"0.6rem",
        boxShadow:"0 8px 32px rgba(0,0,0,0.5)", whiteSpace:"nowrap",
        pointerEvents:"none",
      }}>
        <span style={{ color:"white", fontFamily:"'Lato',sans-serif", fontSize:"0.88rem" }}>{toast}</span>
      </div>

      {/* ══ MODALES ══ */}
      {showAdd    && <AddModal      onClose={() => setShowAdd(false)}    onAdd={handleAdd} />}
      {completing && <CompleteModal dream={completing} onClose={() => setCompleting(null)} onComplete={handleComplete} />}
      {mapping    && <MapModal      dream={mapping}    onClose={() => setMapping(null)} />}
    </div>
  );
}

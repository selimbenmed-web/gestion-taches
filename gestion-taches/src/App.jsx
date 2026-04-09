import { useState, useRef, useEffect } from "react";

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const STATUTS = ["À faire", "En cours", "En révision", "Terminé"];
const PRIORITES = ["Faible", "Moyenne", "Haute"];
const COULEURS_STATUT = {
  "À faire": { bg: "#F1EFE8", text: "#5F5E5A", border: "#B4B2A9" },
  "En cours": { bg: "#E6F1FB", text: "#185FA5", border: "#85B7EB" },
  "En révision": { bg: "#FAEEDA", text: "#854F0B", border: "#EF9F27" },
  "Terminé": { bg: "#EAF3DE", text: "#3B6D11", border: "#97C459" },
};
const COULEURS_PRIORITE = {
  "Faible": { bg: "#EAF3DE", text: "#3B6D11" },
  "Moyenne": { bg: "#FAEEDA", text: "#854F0B" },
  "Haute": { bg: "#FCEBEB", text: "#A32D2D" },
};

const INITIAL_TASKS = [
  { id: 1, titre: "Concevoir la maquette UI", responsable: "Alice", statut: "Terminé", priorite: "Haute", progression: 100, dateEcheance: "2026-04-01", description: "Créer les wireframes et prototypes" },
  { id: 2, titre: "Développer l'API REST", responsable: "Bob", statut: "En cours", priorite: "Haute", progression: 65, dateEcheance: "2026-04-15", description: "Endpoints pour users, tasks, auth" },
  { id: 3, titre: "Rédiger la documentation", responsable: "Claire", statut: "En révision", priorite: "Moyenne", progression: 80, dateEcheance: "2026-04-20", description: "Docs techniques et utilisateur" },
  { id: 4, titre: "Tests unitaires", responsable: "David", statut: "À faire", priorite: "Moyenne", progression: 0, dateEcheance: "2026-04-30", description: "Couverture > 80%" },
  { id: 5, titre: "Déploiement production", responsable: "Alice", statut: "À faire", priorite: "Haute", progression: 0, dateEcheance: "2026-05-05", description: "CI/CD pipeline + monitoring" },
];

function Avatar({ nom, size = 32 }) {
  const initiales = nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
  const colors = [
    { bg: "#CECBF6", text: "#3C3489" }, { bg: "#9FE1CB", text: "#085041" },
    { bg: "#F5C4B3", text: "#712B13" }, { bg: "#B5D4F4", text: "#0C447C" },
    { bg: "#C0DD97", text: "#27500A" },
  ];
  const c = colors[nom.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 500, flexShrink: 0 }}>
      {initiales}
    </div>
  );
}

function ProgressBar({ value, color = "#1D9E75" }) {
  return (
    <div style={{ background: "#F1EFE8", borderRadius: 99, height: 6, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s" }} />
    </div>
  );
}

function Badge({ label, style }) {
  return <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, ...style }}>{label}</span>;
}

function TaskCard({ task, onEdit, onDelete, onStatutChange }) {
  const sc = COULEURS_STATUT[task.statut];
  const pc = COULEURS_PRIORITE[task.priorite];
  const progColor = task.progression >= 100 ? "#3B6D11" : task.progression >= 50 ? "#185FA5" : "#854F0B";
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Badge label={task.statut} style={{ background: sc.bg, color: sc.text, border: `0.5px solid ${sc.border}` }} />
          <Badge label={task.priorite} style={{ background: pc.bg, color: pc.text }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onEdit(task)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 6px" }}>✏️</button>
          <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 6px" }}>🗑️</button>
        </div>
      </div>
      <p style={{ fontWeight: 500, fontSize: 15, margin: "0 0 4px" }}>{task.titre}</p>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 10px" }}>{task.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Avatar nom={task.responsable} size={24} />
        <span style={{ fontSize: 13, color: "#666" }}>{task.responsable}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#999" }}>📅 {task.dateEcheance}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1 }}><ProgressBar value={task.progression} color={progColor} /></div>
        <span style={{ fontSize: 12, fontWeight: 500, color: progColor, minWidth: 32, textAlign: "right" }}>{task.progression}%</span>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {STATUTS.filter(s => s !== task.statut).map(s => (
          <button key={s} onClick={() => onStatutChange(task.id, s)} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, border: `0.5px solid ${COULEURS_STATUT[s].border}`, background: COULEURS_STATUT[s].bg, color: COULEURS_STATUT[s].text, cursor: "pointer" }}>→ {s}</button>
        ))}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 500 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#666" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function TaskForm({ task, onSave, onClose }) {
  const [form, setForm] = useState(task || { titre: "", responsable: "", statut: "À faire", priorite: "Moyenne", progression: 0, dateEcheance: "", description: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div>
      <Field label="Titre"><input style={inputStyle} value={form.titre} onChange={e => set("titre", e.target.value)} placeholder="Titre de la tâche" /></Field>
      <Field label="Description"><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.description} onChange={e => set("description", e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Responsable"><input style={inputStyle} value={form.responsable} onChange={e => set("responsable", e.target.value)} /></Field>
        <Field label="Échéance"><input type="date" style={inputStyle} value={form.dateEcheance} onChange={e => set("dateEcheance", e.target.value)} /></Field>
        <Field label="Statut"><select style={inputStyle} value={form.statut} onChange={e => set("statut", e.target.value)}>{STATUTS.map(s => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Priorité"><select style={inputStyle} value={form.priorite} onChange={e => set("priorite", e.target.value)}>{PRIORITES.map(p => <option key={p}>{p}</option>)}</select></Field>
      </div>
      <Field label={`Progression : ${form.progression}%`}>
        <input type="range" min="0" max="100" step="5" value={form.progression} onChange={e => set("progression", Number(e.target.value))} style={{ width: "100%" }} />
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #ddd", background: "none", cursor: "pointer" }}>Annuler</button>
        <button onClick={() => { if (form.titre && form.responsable) onSave(form); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", cursor: "pointer", fontWeight: 500 }}>Enregistrer</button>
      </div>
    </div>
  );
}

function AiPanel({ tasks }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Bonjour ! Posez-moi des questions sur vos tâches." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const taskSummary = tasks.map(t => `- "${t.titre}" (${t.responsable}) : ${t.statut}, ${t.progression}%, priorité ${t.priorite}, échéance ${t.dateEcheance}`).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-calls": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Tu es un assistant de gestion de projet. Tâches :\n${taskSummary}\nRéponds en français, de façon concise.`,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Désolé, erreur.";
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Erreur de connexion." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 360 }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "85%", padding: "8px 12px", borderRadius: 10, background: m.role === "user" ? "#E6F1FB" : "#f5f5f5", color: m.role === "user" ? "#185FA5" : "#333", fontSize: 13, lineHeight: 1.5 }}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{ fontSize: 13, color: "#999", textAlign: "center" }}>L'IA réfléchit...</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8, borderTop: "1px solid #eee", paddingTop: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Posez une question…" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={send} disabled={loading} style={{ padding: "7px 14px", borderRadius: 8, background: "#185FA5", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500 }}>Envoyer</button>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtrePriorite, setFiltrePriorite] = useState("Tous");
  const [recherche, setRecherche] = useState("");
  const [modalEdit, setModalEdit] = useState(null);
  const [ajoutOpen, setAjoutOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const nextId = useRef(100);

  const saveTask = (form) => {
    if (modalEdit?.id) setTasks(ts => ts.map(t => t.id === modalEdit.id ? { ...t, ...form } : t));
    else setTasks(ts => [...ts, { ...form, id: nextId.current++ }]);
    setModalEdit(null); setAjoutOpen(false);
  };
  const deleteTask = (id) => setTasks(ts => ts.filter(t => t.id !== id));
  const changeStatut = (id, statut) => setTasks(ts => ts.map(t => t.id === id ? { ...t, statut, progression: statut === "Terminé" ? 100 : t.progression } : t));

  const filtered = tasks.filter(t =>
    (filtreStatut === "Tous" || t.statut === filtreStatut) &&
    (filtrePriorite === "Tous" || t.priorite === filtrePriorite) &&
    (t.titre.toLowerCase().includes(recherche.toLowerCase()) || t.responsable.toLowerCase().includes(recherche.toLowerCase()))
  );

  const stats = {
    total: tasks.length,
    terminees: tasks.filter(t => t.statut === "Terminé").length,
    enCours: tasks.filter(t => t.statut === "En cours").length,
    avgProg: tasks.length ? Math.round(tasks.reduce((a, t) => a + t.progression, 0) / tasks.length) : 0,
  };

  const sel = { padding: "5px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Gestion des tâches</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{stats.total} tâches · {stats.terminees} terminées</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setAiOpen(true)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#f5f5f5", cursor: "pointer", fontSize: 13 }}>✨ Assistant IA</button>
          <button onClick={() => { setModalEdit({}); setAjoutOpen(true); }} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>+ Nouvelle tâche</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
        {[
          { label: "Total", val: stats.total, color: "#333" },
          { label: "En cours", val: stats.enCours, color: "#185FA5" },
          { label: "Terminées", val: stats.terminees, color: "#3B6D11" },
          { label: "Avancement", val: `${stats.avgProg}%`, color: "#854F0B" },
        ].map(s => (
          <div key={s.label} style={{ background: "#f5f5f5", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#666", marginBottom: 4 }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 600, color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher…" style={{ ...sel, minWidth: 160 }} />
        <select style={sel} value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option>Tous</option>{STATUTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={sel} value={filtrePriorite} onChange={e => setFiltrePriorite(e.target.value)}>
          <option>Tous</option>{PRIORITES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {filtered.map(t => <TaskCard key={t.id} task={t} onEdit={t => { setModalEdit(t); setAjoutOpen(true); }} onDelete={deleteTask} onStatutChange={changeStatut} />)}

      {ajoutOpen && (
        <Modal title={modalEdit?.titre ? "Modifier" : "Nouvelle tâche"} onClose={() => { setAjoutOpen(false); setModalEdit(null); }}>
          <TaskForm task={modalEdit} onSave={saveTask} onClose={() => { setAjoutOpen(false); setModalEdit(null); }} />
        </Modal>
      )}
      {aiOpen && (
        <Modal title="✨ Assistant IA" onClose={() => setAiOpen(false)}>
          <AiPanel tasks={tasks} />
        </Modal>
      )}
    </div>
  );
}

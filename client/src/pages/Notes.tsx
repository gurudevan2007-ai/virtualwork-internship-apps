import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, LoaderCircle, NotebookPen, Plus, Sparkles } from "lucide-react";
import { api, formatDate, type Note } from "@/lib/api";

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotes() {
    setError("");
    try { setNotes((await api.notes()).notes); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load notes."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadNotes(); }, []);

  async function saveNote(event: FormEvent) {
    event.preventDefault();
    const value = body.trim();
    if (!value) return;
    setBusy(true); setError("");
    try {
      const { note } = await api.createNote(value);
      setNotes(current => [note, ...current]); setBody("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save this note."); }
    finally { setBusy(false); }
  }

  return <section className="task-page">
    <div className="task-intro"><div className="task-title-icon icon-lime"><NotebookPen size={22} /></div><div><span className="task-eyebrow">TASK 01 · REQUEST / RESPONSE</span><h1>Quick Note</h1><p>Catch the thought before it wanders off.</p></div><span className="stack-badge">PYTHON BACKEND</span></div>
    <div className="note-workbench">
      <form className="note-composer" onSubmit={saveNote}>
        <label htmlFor="note-body">A thought to keep</label>
        <textarea id="note-body" maxLength={500} placeholder="Write something worth remembering…" value={body} onChange={e => setBody(e.target.value)} />
        <div className="composer-bottom"><span>{body.length} / 500</span><button className="button-primary" type="submit" disabled={busy || !body.trim()}>{busy ? <LoaderCircle className="spin" size={16} /> : <Plus size={16} />} {busy ? "Saving…" : "Save note"}</button></div>
      </form>
      <aside className="flow-card"><span className="flow-icon"><Sparkles size={16} /></span><span className="flow-label">UNDER THE HOOD</span><strong>Browser → Python → MySQL</strong><p>Your note takes a short trip through a Python service before it returns to this page.</p><span className="flow-status"><i /> SAVE FLOW READY</span></aside>
    </div>
    <div className="feed-heading"><div><span className="section-kicker">YOUR NOTEBOOK</span><h2>Kept thoughts <span className="count-pill">{notes.length}</span></h2></div><button className="text-button" onClick={() => void loadNotes()} type="button">Refresh <ArrowUpRight size={14} /></button></div>
    {error && <div role="alert" className="error-box">{error}</div>}
    {loading ? <div className="loading-state"><LoaderCircle className="spin" /> Loading saved notes…</div> : notes.length ? <div className="note-list">{notes.map((note, index) => <article className="note-card" key={note.id}><div className="note-card-top"><span className="note-index">Nº {String(notes.length - index).padStart(2, "0")}</span><time>{formatDate(note.createdAt)}</time></div><p>{note.body}</p><span className="saved-label">SAVED <i /></span></article>)}</div> : <div className="empty-state"><NotebookPen size={25} /><strong>Your notebook is waiting.</strong><p>Save a first thought above and it will show up here.</p></div>}
  </section>;
}

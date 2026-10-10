import { FormEvent, useState } from "react";
import { ArrowUpRight, FileUser, ImagePlus, LoaderCircle, Send } from "lucide-react";
import { api, formatDate, type ProfileCard } from "@/lib/api";

export default function Profiles() {
  const [form, setForm] = useState({ name: "", bio: "", imageUrl: "" });
  const [profile, setProfile] = useState<ProfileCard | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function createCard(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { setProfile((await api.createProfile(form)).profile); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not create the card."); }
    finally { setBusy(false); }
  }

  return <section className="task-page">
    <div className="task-intro"><div className="task-title-icon icon-peach"><FileUser size={22} /></div><div><span className="task-eyebrow">TASK 02 · FORM / POST</span><h1>Profile Cards</h1><p>A few details in. A profile card out.</p></div><span className="stack-badge">POST REQUEST</span></div>
    <div className="profile-layout">
      <form className="form-panel" onSubmit={createCard}>
        <div className="panel-heading"><span className="section-kicker">CARD DETAILS</span><span className="step-dot">01</span></div>
        <label htmlFor="profile-name">Name</label><input id="profile-name" maxLength={80} required placeholder="e.g. Riley Morgan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <label htmlFor="profile-bio">A short bio</label><textarea id="profile-bio" maxLength={240} required placeholder="What are you curious about?" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
        <label htmlFor="profile-image">Image URL</label><div className="input-with-icon"><ImagePlus size={16} /><input id="profile-image" type="url" required placeholder="https://example.com/photo.jpg" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} /></div>
        {error && <div role="alert" className="error-box">{error}</div>}
        <button className="button-primary full-button" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Send size={15} />} {busy ? "Building card…" : "Generate profile card"}</button>
        <p className="form-footnote">Submitted details are processed and saved by the backend.</p>
      </form>
      <div className="preview-panel"><div className="panel-heading"><span className="section-kicker">LIVE RESULT</span><span className="preview-dots"><i /><i /><i /></span></div>
        {profile ? <article className="profile-card"><div className="profile-image-wrap"><img src={profile.imageUrl} alt={`${profile.name} profile`} onError={e => { e.currentTarget.style.visibility = "hidden"; }} /><span className="profile-monogram">{profile.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase()}</span></div><span className="profile-card-tag">FIELDWORK MEMBER</span><h2>{profile.name}</h2><p>{profile.bio}</p><div className="profile-card-foot"><span>CREATED {formatDate(profile.createdAt)}</span><ArrowUpRight size={14} /></div></article> : <div className="profile-placeholder"><span className="placeholder-orbit"><FileUser size={26} /></span><strong>Your card will land here.</strong><p>Fill out the form and send a POST request to create it.</p></div>}
      </div>
    </div>
  </section>;
}

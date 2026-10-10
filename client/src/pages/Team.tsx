import { useEffect, useState } from "react";
import { ArrowUpRight, LoaderCircle, UsersRound } from "lucide-react";
import { api, type TeamMember } from "@/lib/api";

const initials = (name: string) => name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.team().then(result => setMembers(result.members)).catch(e => setError(e instanceof Error ? e.message : "Could not load the team.")).finally(() => setLoading(false)); }, []);

  async function toggle(member: TeamMember) {
    setBusyId(member.id); setError("");
    try { const { member: updated } = await api.setAvailability(member.id, !member.available); setMembers(current => current.map(row => row.id === updated.id ? updated : row)); }
    catch (e) { setError(e instanceof Error ? e.message : "The availability update was not saved."); }
    finally { setBusyId(null); }
  }

  const available = members.filter(member => member.available).length;
  return <section className="task-page">
    <div className="task-intro"><div className="task-title-icon icon-yellow"><UsersRound size={22} /></div><div><span className="task-eyebrow">TASK 05 · BOOLEAN / SYNC</span><h1>Team Status</h1><p>A quick read on who’s around.</p></div><span className="stack-badge">DATABASE SYNC</span></div>
    <div className="team-summary"><div><span className="section-kicker">RIGHT NOW</span><h2><strong>{available}</strong><span>of {members.length} available</span></h2></div><div className="availability-meter" aria-label={`${available} of ${members.length} available`}><span style={{ width: `${members.length ? (available / members.length) * 100 : 0}%` }} /></div><div className="team-summary-foot"><span><i /> STATUS SAVES AUTOMATICALLY</span><span>TEAM BOARD <b>↗</b></span></div></div>
    <div className="feed-heading"><div><span className="section-kicker">THE CREW</span><h2>People & availability</h2></div><span className="saved-inline"><i /> LIVE BOOLEAN STATE</span></div>
    {error && <div role="alert" className="error-box">{error}</div>}
    {loading ? <div className="loading-state"><LoaderCircle className="spin" /> Checking the team…</div> : <div className="team-list">{members.map(member => <article className={`team-row ${member.available ? "is-available" : "is-away"}`} key={member.id}><div className={`avatar avatar-${member.id % 5}`}>{initials(member.name)}</div><div className="team-copy"><h3>{member.name}</h3><p>{member.role}</p></div><span className={`availability-label ${member.available ? "online" : "offline"}`}><i /> {member.available ? "Available" : "Away"}</span><button className={`toggle ${member.available ? "on" : ""}`} role="switch" aria-checked={member.available} aria-label={`Set ${member.name} ${member.available ? "away" : "available"}`} disabled={busyId !== null} onClick={() => void toggle(member)} type="button"><span>{busyId === member.id ? <LoaderCircle className="spin" size={12} /> : null}</span></button><ArrowUpRight className="team-row-arrow" size={15} /></article>)}</div>}
    <p className="team-hint">Tap a switch to update a teammate’s availability. Changes are saved to the database.</p>
  </section>;
}

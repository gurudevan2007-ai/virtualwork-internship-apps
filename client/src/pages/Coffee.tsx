import { useEffect, useState } from "react";
import { ArrowUpRight, Coffee as CoffeeIcon, LoaderCircle, ThumbsUp } from "lucide-react";
import { api, type CoffeeItem } from "@/lib/api";

const glyphs: Record<string, string> = { espresso: "◉", flatwhite: "◒", cappuccino: "◍", coldbrew: "▤" };

export default function Coffee() {
  const [items, setItems] = useState<CoffeeItem[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.coffees().then(result => setItems(result.items)).catch(e => setError(e instanceof Error ? e.message : "Could not load the coffee list.")).finally(() => setLoading(false)); }, []);

  async function vote(id: number) {
    setBusyId(id); setError("");
    try { const { item } = await api.voteCoffee(id); setItems(current => current.map(row => row.id === id ? item : row)); }
    catch (e) { setError(e instanceof Error ? e.message : "Your vote could not be saved."); }
    finally { setBusyId(null); }
  }

  const total = items.reduce((sum, item) => sum + item.voteCount, 0);
  return <section className="task-page">
    <div className="task-intro"><div className="task-title-icon icon-blue"><CoffeeIcon size={22} /></div><div><span className="task-eyebrow">TASK 03 · DATABASE / UPDATE</span><h1>Coffee Ratings</h1><p>Pick the cup that makes the day.</p></div><span className="stack-badge">{total} VOTES CAST</span></div>
    <div className="coffee-banner"><div><span className="section-kicker">THE DAILY POUR</span><h2>What’s your<br /><em>go-to</em> brew?</h2><p>Choose a favorite. Every click updates the shared count.</p></div><div className="coffee-banner-art">☕<span>GOOD<br />IDEAS<br />BREW HERE</span></div></div>
    <div className="feed-heading"><div><span className="section-kicker">THE LINEUP</span><h2>Cast your vote</h2></div><span className="saved-inline"><i /> COUNT STORED LIVE</span></div>
    {error && <div role="alert" className="error-box">{error}</div>}
    {loading ? <div className="loading-state"><LoaderCircle className="spin" /> Loading the lineup…</div> : <div className="coffee-list">{items.map((item, index) => <article className="coffee-row" key={item.id}><div className={`coffee-glyph coffee-glyph-${index % 4}`}>{glyphs[item.slug] || "◉"}</div><div className="coffee-copy"><span className="coffee-number">BREW Nº 0{index + 1}</span><h3>{item.name}</h3><p>{item.description}</p></div><div className="vote-count"><strong>{item.voteCount}</strong><span>VOTES</span></div><button className="vote-button" type="button" onClick={() => void vote(item.id)} disabled={busyId !== null} aria-label={`Vote for ${item.name}`}>{busyId === item.id ? <LoaderCircle className="spin" size={17} /> : <ThumbsUp size={16} />}<span>{busyId === item.id ? "Saving" : "Vote"}</span><ArrowUpRight size={14} /></button></article>)}</div>}
  </section>;
}

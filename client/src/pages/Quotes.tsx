import { useEffect, useState } from "react";
import { ArrowUpRight, LoaderCircle, Quote as QuoteIcon, Sparkles } from "lucide-react";
import { api, formatDate, type QuoteEntry } from "@/lib/api";

export default function Quotes() {
  const [history, setHistory] = useState<QuoteEntry[]>([]);
  const [current, setCurrent] = useState<QuoteEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { api.history().then(result => { setHistory(result.quotes); if (result.quotes[0]) setCurrent(result.quotes[0]); }).catch(e => setError(e instanceof Error ? e.message : "Could not load your history.")); }, []);

  async function getQuote() {
    setBusy(true); setError("");
    try { const { quote } = await api.randomQuote(); setCurrent(quote); setHistory(rows => [quote, ...rows.filter(row => row.id !== quote.id)]); }
    catch (e) { setError(e instanceof Error ? e.message : "The quote service is unavailable. Try again in a moment."); }
    finally { setBusy(false); }
  }

  return <section className="task-page">
    <div className="task-intro"><div className="task-title-icon icon-lavender"><QuoteIcon size={22} /></div><div><span className="task-eyebrow">TASK 04 · API / HISTORY</span><h1>Quote Journal</h1><p>A little perspective, delivered fresh.</p></div><span className="stack-badge">EXTERNAL API</span></div>
    <div className="quote-stage"><div className="quote-stage-top"><span className="quote-source"><span className="live-dot" /> RANDOM QUOTE SERVICE</span><Sparkles size={18} /></div>
      {current ? <blockquote><span className="big-quote-mark">“</span><p>{current.text}</p><footer>— {current.author}</footer></blockquote> : <div className="quote-empty"><QuoteIcon size={30} /><p>Your next good line is one click away.</p></div>}
      <div className="quote-stage-bottom"><span>EVERY QUOTE JOINS YOUR HISTORY</span><button className="button-primary" type="button" onClick={() => void getQuote()} disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Sparkles size={15} />} {busy ? "Finding one…" : "Get a random quote"} <ArrowUpRight size={14} /></button></div>
    </div>
    {error && <div role="alert" className="error-box">{error}</div>}
    <div className="feed-heading"><div><span className="section-kicker">YOUR ARCHIVE</span><h2>Saved quotes <span className="count-pill">{history.length}</span></h2></div><span className="saved-inline"><i /> PERSISTENT HISTORY</span></div>
    {history.length ? <div className="quote-history">{history.map((item, index) => <article className="history-row" key={item.id}><span className="history-index">{String(history.length - index).padStart(2, "0")}</span><div><p>“{item.text}”</p><span>— {item.author}</span></div><time>{formatDate(item.createdAt)}</time></article>)}</div> : <div className="empty-state"><QuoteIcon size={25} /><strong>No saved quotes yet.</strong><p>Fetch your first quote and it’ll stay in the archive.</p></div>}
  </section>;
}

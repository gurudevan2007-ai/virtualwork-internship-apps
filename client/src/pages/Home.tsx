import { ArrowDownRight, ArrowUpRight, Coffee, FileUser, NotebookPen, Quote, UsersRound } from "lucide-react";
import { Link } from "wouter";

const projects = [
  { number: "01", title: "Quick Note", description: "Capture a thought and keep it safe in your notes stream.", href: "/notes", label: "Open notes", icon: NotebookPen, tone: "lime", tag: "PYTHON · DATABASE" },
  { number: "02", title: "Profile Cards", description: "Turn a few details into a clean, shareable profile card.", href: "/profiles", label: "Build a card", icon: FileUser, tone: "peach", tag: "POST · BACKEND" },
  { number: "03", title: "Coffee Ratings", description: "Pick a favorite and see the vote count update live.", href: "/coffee", label: "Cast a vote", icon: Coffee, tone: "blue", tag: "DATABASE · VOTES" },
  { number: "04", title: "Quote Journal", description: "Find a fresh line, then keep it in your history.", href: "/quotes", label: "Find a quote", icon: Quote, tone: "lavender", tag: "API · HISTORY" },
  { number: "05", title: "Team Status", description: "A simple view of who's around and ready to help.", href: "/team", label: "View the team", icon: UsersRound, tone: "yellow", tag: "STATE · DATABASE" },
];

export default function Home() {
  return (
    <div className="home-shell">
      <header className="topbar home-topbar">
        <Link href="/" className="brand"><span className="brand-mark">F<span>·</span></span><span className="brand-name">FIELDWORK <small>INTERNSHIP LAB</small></span></Link>
        <div className="topbar-note"><span className="live-dot" /> YOUR PROJECT WORKBENCH</div>
        <a className="top-link" href="https://virtualwork.in/student/dashboard" target="_blank" rel="noreferrer">VIRTUALWORK <ArrowUpRight size={14} /></a>
      </header>
      <main className="home-main">
        <section className="hero-block">
          <div className="eyebrow"><span className="eyebrow-line" /> VIRTUALWORK · INTERNSHIP PROJECTS <span className="eyebrow-index">VW / 05</span></div>
          <h1>Small builds.<br /><em>Real</em> momentum.</h1>
          <div className="hero-foot"><p>Five practical apps for learning how ideas travel from interface to backend—and stay saved.</p><a href="#projects" className="circle-arrow" aria-label="Browse the apps"><ArrowDownRight size={21} /></a></div>
          <div className="hero-stamp"><span>FIELD<br />NOTES</span><i>✳</i></div>
        </section>
        <section id="projects" className="projects-section">
          <div className="section-heading"><div><span className="section-kicker">THE WORKSHOP</span><h2>Choose a build</h2></div><span className="project-count">05 / 05</span></div>
          <div className="project-list">
            {projects.map(({ number, title, description, href, label, icon: Icon, tone, tag }) => (
              <article className={`project-card tone-${tone}`} key={number}>
                <div className="project-id">{number}<span> / APP</span></div>
                <div className="project-icon"><Icon size={21} strokeWidth={1.7} /></div>
                <div className="project-copy"><span className="project-tag">{tag}</span><h3>{title}</h3><p>{description}</p></div>
                <Link className="project-action" href={href}><span>{label}</span><ArrowUpRight size={15} /></Link>
              </article>
            ))}
          </div>
        </section>
        <section className="home-note"><span className="note-symbol">✳</span><p>Every interaction is backed by a real request. Updates persist between visits.</p><span className="note-tail">BUILT TO LEARN</span></section>
      </main>
      <footer className="home-footer"><span>FIELDWORK LAB · 2026</span><span>ONE STEP AT A TIME</span></footer>
    </div>
  );
}

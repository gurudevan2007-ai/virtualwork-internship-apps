import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Check, ChevronLeft, Coffee, FileUser, NotebookPen, Quote, UsersRound } from "lucide-react";

const tasks = [
  { id: "notes", number: "01", label: "Quick notes", href: "/notes", icon: NotebookPen },
  { id: "profiles", number: "02", label: "Profile cards", href: "/profiles", icon: FileUser },
  { id: "coffee", number: "03", label: "Coffee ratings", href: "/coffee", icon: Coffee },
  { id: "quotes", number: "04", label: "Quote journal", href: "/quotes", icon: Quote },
  { id: "team", number: "05", label: "Team status", href: "/team", icon: UsersRound },
] as const;

export type TaskId = (typeof tasks)[number]["id"];

export default function TaskFrame({ task, children }: { task: TaskId; children: ReactNode }) {
  const current = tasks.find(item => item.id === task)!;
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Fieldwork home">
          <span className="brand-mark">F<span>·</span></span>
          <span className="brand-name">FIELDWORK <small>INTERNSHIP LAB</small></span>
        </Link>
        <div className="topbar-note"><span className="live-dot" /> FIVE BUILDS, ONE WORKSHOP</div>
        <a className="top-link" href="https://virtualwork.in/student/dashboard" target="_blank" rel="noreferrer">VIRTUALWORK <ArrowUpRight size={14} /></a>
      </header>
      <div className="app-layout">
        <aside className="side-nav" aria-label="Internship apps">
          <Link href="/" className="back-link"><ChevronLeft size={14} /> ALL PROJECTS</Link>
          <div className="nav-caption">YOUR ASSIGNMENTS</div>
          {tasks.map(({ id, number, label, href, icon: Icon }) => (
            <Link key={id} href={href} className={`nav-item ${task === id ? "active" : ""}`}>
              <span className="nav-number">{number}</span><Icon size={16} strokeWidth={1.8} /><span>{label}</span>
              {task === id && <Check className="nav-check" size={14} />}
            </Link>
          ))}
          <div className="sidebar-foot"><span className="status-orb" /> Workspace ready<br /><small>Each app saves its own work.</small></div>
        </aside>
        <main className="workspace">
          <div className="crumb"><span>WORKSHOP</span><span className="crumb-slash">/</span><span>{current.number} — {current.label.toUpperCase()}</span></div>
          {children}
          <footer className="page-foot"><span>FIELDWORK LAB</span><span>Built for learning · Saved to the database</span></footer>
        </main>
      </div>
    </div>
  );
}

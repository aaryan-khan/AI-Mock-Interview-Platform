import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, CircleHelp, History, LayoutDashboard, LogOut, Plus, Sparkles, UserCircle } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/interviews/new", label: "New Interview", icon: Plus },
  { href: "/history", label: "Interview History", icon: History },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/about", label: "How It Works", icon: CircleHelp },
];

export default function StudentShell({ children, email, title, subtitle }: { children: ReactNode; email?: string; title?: string; subtitle?: string; }) {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><Sparkles size={17} /></div>
          <div><div className="brand-name">InterviewAI</div><div className="brand-caption">Student Edition</div></div>
        </div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navItems.map(({ href, label, icon: Icon }) => <Link href={href} className="nav-item" key={href}><Icon size={18} strokeWidth={2}/><span>{label}</span></Link>)}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/profile" className="profile-mini"><span className="avatar"><UserCircle size={19}/></span><span className="profile-mini-copy"><strong>My profile</strong><small>{email ?? "Signed in"}</small></span></Link>
          <form action="/api/student/logout" method="post"><button className="nav-item nav-button" type="submit"><LogOut size={18}/><span>Sign out</span></button></form>
        </div>
      </aside>
      <section className="app-content">
        <div className="mobile-topbar"><div className="brand-lockup"><div className="brand-mark"><Sparkles size={16}/></div><div className="brand-name">InterviewAI</div></div><Link href="/profile" className="icon-button" aria-label="Profile"><UserCircle size={20}/></Link></div>
        {title && <header className="page-heading"><div><div className="eyebrow">AI MOCK INTERVIEW PLATFORM</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div></header>}
        {children}
      </section>
    </main>
  );
}

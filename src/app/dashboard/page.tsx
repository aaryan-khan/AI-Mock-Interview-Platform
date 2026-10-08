import Link from "next/link";
import { ArrowRight, Award, BrainCircuit, CheckCircle2, Clock3, History, Plus, Sparkles, Target } from "lucide-react";
import StudentShell from "@/components/student-shell";
import { requireUser } from "@/lib/student-auth";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const { data: interviews } = await (supabase.from("student_interviews") as any).select("*").eq("user_id", user.id).order("created_at", { ascending:false });
  const { data: sessions } = await (supabase.from("student_sessions") as any).select("*").eq("user_id", user.id).not("completed_at", "is", null).order("completed_at", { ascending:false });
  const completed=sessions??[];
  const average=completed.length?completed.reduce((sum:number,s:any)=>sum+Number(s.overall_score??0),0)/completed.length:0;
  const best=completed.length?Math.max(...completed.map((s:any)=>Number(s.overall_score??0))):0;
  const recent=(interviews??[]).slice(0,4);

  return <StudentShell email={user.email} title="Welcome back" subtitle="Turn interview practice into measurable progress, one session at a time.">
    <section className="dashboard-hero">
      <div><span className="eyebrow light">YOUR NEXT PRACTICE</span><h2>Ready for another round?</h2><p>Choose a role and let Gemini build a tailored interview in seconds.</p><Link href="/interviews/new" className="button button-light"><Plus size={17}/> Create interview <ArrowRight size={16}/></Link></div>
      <div className="hero-visual"><div className="floating-badge badge-one"><Sparkles size={15}/> Gemini powered</div><div className="hero-orbit-large"><BrainCircuit size={52}/></div><div className="floating-badge badge-two"><CheckCircle2 size={15}/> Instant feedback</div></div>
    </section>

    <section className="metric-grid metric-grid-4">
      <div className="metric-card"><span className="metric-icon blue"><History size={19}/></span><small>Interviews created</small><strong>{interviews?.length??0}</strong></div>
      <div className="metric-card"><span className="metric-icon green"><CheckCircle2 size={19}/></span><small>Completed</small><strong>{completed.length}</strong></div>
      <div className="metric-card"><span className="metric-icon purple"><Target size={19}/></span><small>Average score</small><strong>{average.toFixed(1)}<em>/10</em></strong></div>
      <div className="metric-card"><span className="metric-icon orange"><Award size={19}/></span><small>Best score</small><strong>{best.toFixed(1)}<em>/10</em></strong></div>
    </section>

    <section className="dashboard-grid">
      <div className="section-card">
        <div className="section-title-row"><div><h2>Recent interviews</h2><p>Your newest practice setups.</p></div><Link href="/history" className="text-link">View all <ArrowRight size={14}/></Link></div>
        {!recent.length ? <div className="empty-state compact"><Clock3 size={27}/><h3>No sessions yet</h3><p>Create a mock interview to see it here.</p><Link href="/interviews/new" className="button button-primary">Start practicing</Link></div> : <div className="compact-list">{recent.map((i:any)=><div className="compact-row" key={i.id}><div className="compact-icon"><BriefcaseIcon/></div><div><strong>{i.role}</strong><span>{i.interview_type} · {i.question_count} questions</span></div><Link href={`/interviews/${i.id}`} className="icon-button"><ArrowRight size={17}/></Link></div>)}</div>}
      </div>
      <div className="section-card progress-mini-card"><div className="section-title-row"><div><h2>Quick progress</h2><p>Latest completed score.</p></div></div><div className="ring-wrap"><div className="score-ring" style={{'--score':`${Math.round((Number(completed[0]?.overall_score??0))*10)}%`} as React.CSSProperties}><div><strong>{Number(completed[0]?.overall_score??0).toFixed(1)}</strong><span>/ 10</span></div></div></div><Link href="/progress" className="button button-secondary full-button">Open progress dashboard</Link></div>
    </section>
  </StudentShell>;
}

function BriefcaseIcon(){return <span className="briefcase-dot"><span/></span>}

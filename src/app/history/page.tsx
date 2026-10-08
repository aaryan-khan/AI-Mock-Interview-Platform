import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck } from "lucide-react";
import StudentShell from "@/components/student-shell";
import { requireUser } from "@/lib/student-auth";

export default async function HistoryPage() {
  const { supabase, user } = await requireUser();
  const { data: interviews } = await (supabase.from("student_interviews") as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const { data: sessions } = await (supabase.from("student_sessions") as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const sessionByInterview = new Map<string, any>();
  for (const session of sessions ?? []) if (!sessionByInterview.has(session.interview_id)) sessionByInterview.set(session.interview_id, session);

  return <StudentShell email={user.email} title="Interview history" subtitle="Every practice session in one place, with quick access to your latest results.">
    <section className="section-card">
      <div className="section-title-row"><div><h2>Past interviews</h2><p>Review completed sessions or start the same interview again.</p></div><Link href="/interviews/new" className="button button-primary">New interview <ArrowRight size={17}/></Link></div>
      {!interviews?.length ? <div className="empty-state"><ClipboardCheck size={28}/><h3>No interviews yet</h3><p>Create your first mock interview to start building your history.</p><Link href="/interviews/new" className="button button-primary">Start practicing</Link></div> :
      <div className="history-list">{interviews.map((interview: any) => { const session = sessionByInterview.get(interview.id); const completed = Boolean(session?.completed_at); return <div className="history-row" key={interview.id}>
        <div className="history-icon"><ClipboardCheck size={19}/></div><div className="history-main"><strong>{interview.role}</strong><span>{interview.interview_type} · {interview.experience_level} · {interview.question_count} questions</span><small><CalendarDays size={13}/> {new Date(interview.created_at).toLocaleDateString()}</small></div>
        <div className="history-score">{completed ? <><strong>{Number(session.overall_score ?? 0).toFixed(1)}/10</strong><span className="status-pill success-pill">Completed</span></> : <span className="status-pill">Not completed</span>}</div>
        <div className="history-action">{completed ? <Link href={`/results/${session.id}`} className="button button-secondary">View result</Link> : <Link href={`/interviews/${interview.id}`} className="button button-secondary">Continue</Link>}</div>
      </div>; })}</div>}
    </section>
  </StudentShell>;
}

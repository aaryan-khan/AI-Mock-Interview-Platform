import Link from "next/link";
import { Award, BarChart3, Target, TrendingUp } from "lucide-react";
import StudentShell from "@/components/student-shell";
import { requireUser } from "@/lib/student-auth";

export default async function ProgressPage() {
  const { supabase, user } = await requireUser();
  const { data: sessions } = await (supabase.from("student_sessions") as any)
    .select("*")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("created_at", { ascending: false });

  const scores = (sessions ?? []).map((s: any) => Number(s.overall_score ?? 0));
  const average = scores.length ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
  const best = scores.length ? Math.max(...scores) : 0;
  const latest = scores[0] ?? 0;

  return (
    <StudentShell email={user.email} title="Progress dashboard" subtitle="See how your mock-interview performance changes across practice sessions.">
      <section className="metric-grid metric-grid-3">
        <div className="metric-card"><span className="metric-icon purple"><BarChart3 size={19} /></span><small>Completed interviews</small><strong>{sessions?.length ?? 0}</strong></div>
        <div className="metric-card"><span className="metric-icon blue"><Target size={19} /></span><small>Average score</small><strong>{average.toFixed(1)}/10</strong></div>
        <div className="metric-card"><span className="metric-icon green"><Award size={19} /></span><small>Best score</small><strong>{best.toFixed(1)}/10</strong></div>
      </section>

      <section className="section-card progress-card">
        <div className="section-title-row">
          <div><h2>Performance snapshot</h2><p>Your latest completed sessions, from newest to oldest.</p></div>
          <span className="mini-trend"><TrendingUp size={16} /> Latest {latest.toFixed(1)}/10</span>
        </div>
        {!sessions?.length ? (
          <div className="empty-state compact">
            <BarChart3 size={28} />
            <h3>Your progress starts here</h3>
            <p>Complete one interview and the dashboard will begin tracking your scores.</p>
            <Link href="/interviews/new" className="button button-primary">Take an interview</Link>
          </div>
        ) : (
          <div className="score-history">
            {sessions.map((session: any, index: number) => {
              const score = Number(session.overall_score ?? 0);
              return (
                <div className="score-row" key={session.id}>
                  <div className="score-index">{index + 1}</div>
                  <div className="score-row-main">
                    <strong>Practice session {sessions.length - index}</strong>
                    <span>{new Date(session.completed_at ?? session.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="score-bar"><span style={{ width: `${Math.max(0, Math.min(100, score * 10))}%` }} /></div>
                  <strong className="score-value">{score.toFixed(1)}/10</strong>
                  <Link href={`/results/${session.id}`} className="text-link">Review</Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </StudentShell>
  );
}

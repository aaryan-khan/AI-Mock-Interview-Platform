import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, MessageSquareText, Target, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import VoiceButton from "@/components/voice-button";
import { requireUser } from "@/lib/student-auth";

export default async function ResultPage({params}:{params:Promise<{id:string}>}){
  const {supabase,user}=await requireUser();
  const {id}=await params;
  const {data:session}=await (supabase.from("student_sessions") as any).select("*").eq("id",id).eq("user_id",user.id).single();
  if(!session)notFound();
  const {data:answers}=await (supabase.from("student_answers") as any).select("*, student_questions(question_text,question_number)").eq("session_id",id).order("created_at");
  const rows=answers??[];
  const avg=rows.length?(rows.reduce((s:number,a:any)=>s+Number(a.overall_score),0)/rows.length):0;
  const summary=session.summary||`Your average performance score is ${avg.toFixed(1)} out of 10.`;
  const scoreLabel=avg>=8?"Strong performance":avg>=6?"Good foundation":"Room to improve";
  return <main className="results-page"><div className="results-container">
    <div className="results-topbar"><Link href="/dashboard" className="back-link"><ArrowLeft size={17}/> Dashboard</Link><span className="soft-badge">Interview report</span><Link href="/interviews/new" className="button button-secondary">New interview</Link></div>
    <section className="results-hero"><div><span className="eyebrow light">SESSION COMPLETE</span><h1>{scoreLabel}. Keep practicing.</h1><p>{summary}</p><div className="results-actions"><VoiceButton text={summary} label="Hear overall feedback"/><Link href="/progress" className="button button-light">View progress <ArrowRight size={16}/></Link></div></div><div className="trophy-wrap"><Trophy size={38}/><strong>{Number(session.overall_score??avg).toFixed(1)}</strong><span>out of 10</span></div></section>
    <section className="metric-grid metric-grid-3"><div className="metric-card"><span className="metric-icon blue"><Target size={18}/></span><small>Questions answered</small><strong>{rows.length}</strong></div><div className="metric-card"><span className="metric-icon green"><CheckCircle2 size={18}/></span><small>Average score</small><strong>{avg.toFixed(1)}<em>/10</em></strong></div><div className="metric-card"><span className="metric-icon purple"><MessageSquareText size={18}/></span><small>Feedback items</small><strong>{rows.length}</strong></div></section>
    <section className="section-card"><div className="section-title-row"><div><h2>Question-by-question feedback</h2><p>See exactly where your answer was strong and where you can improve.</p></div></div><div className="result-list">{rows.map((a:any)=><article className="result-item" key={a.id}><div className="result-number">{a.student_questions?.question_number}</div><div className="result-body"><div className="result-question"><span>Question {a.student_questions?.question_number}</span><h3>{a.student_questions?.question_text}</h3></div><div className="score-grid result-scores"><div><span>Relevance</span><strong>{a.relevance_score}/10</strong></div><div><span>Technical accuracy</span><strong>{a.technical_score}/10</strong></div><div><span>Clarity</span><strong>{a.clarity_score}/10</strong></div><div><span>Overall</span><strong>{a.overall_score}/10</strong></div></div><div className="answer-review"><span>Your answer</span><p>{a.answer_text}</p></div><div className="feedback-copy"><CheckCircle2 size={18}/><p>{a.feedback}</p></div><VoiceButton text={a.feedback} label="Hear this feedback"/></div></article>)}</div></section>
  </div></main>;
}

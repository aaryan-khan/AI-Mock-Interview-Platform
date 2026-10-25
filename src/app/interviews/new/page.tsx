"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, BrainCircuit, Clock3, Layers3, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewInterviewPage(){
  const router=useRouter();
  const [role,setRole]=useState("Software Developer");
  const [experience,setExperience]=useState("Fresher");
  const [type,setType]=useState("Technical");
  const [count,setCount]=useState("5");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault(); setLoading(true); setError("");
    try {
      const r=await fetch("/api/student/interviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({role,experienceLevel:experience,interviewType:type,questionCount:Number(count)})});
      const data=await r.json().catch(()=>({}));
      if(!r.ok){setError(data.error||"Unable to create interview");return;}
      router.push(`/interviews/${data.interviewId}`);
    } catch { setError("Could not reach the interview service. Please try again."); }
    finally { setLoading(false); }
  }

  return <main className="app-shell single-page-shell">
    <section className="app-content full-width-content">
      <div className="simple-topbar"><Link href="/dashboard" className="back-link"><ArrowLeft size={17}/> Dashboard</Link><div className="interview-brand"><div className="brand-mark"><Sparkles size={16}/></div><strong>InterviewAI</strong></div><span className="soft-badge">AI powered</span></div>
      <div className="create-layout">
        <section className="create-hero">
          <div className="eyebrow light">BUILD YOUR PRACTICE SESSION</div>
          <h1>Create an interview that matches your goal.</h1>
          <p>Choose the role, difficulty, format, and question count. AI will generate a focused interview for you.</p>
          <div className="create-highlights"><span><BrainCircuit size={16}/> AI-generated questions</span><span><Clock3 size={16}/> 5–20 questions</span><span><Layers3 size={16}/> Instant feedback</span></div>
        </section>

        <section className="form-card">
          <div className="form-card-head"><div><span className="panel-kicker">INTERVIEW SETUP</span><h2>Choose your settings</h2></div><span className="setup-step">01 / 01</span></div>
          <form onSubmit={submit} className="setup-form">
            <div className="field field-large"><label><BriefcaseBusiness size={15}/> Job role</label><select value={role} onChange={e=>setRole(e.target.value)}><option>Software Developer</option><option>Data Analyst</option><option>Web Developer</option><option>Backend Developer</option><option>Frontend Developer</option><option>HR</option><option>Marketing</option></select></div>
            <div className="setup-two"><div className="field"><label>Experience level</label><select value={experience} onChange={e=>setExperience(e.target.value)}><option>Fresher</option><option>1-2 years</option><option>3-5 years</option></select></div><div className="field"><label>Interview type</label><select value={type} onChange={e=>setType(e.target.value)}><option>Technical</option><option>HR</option><option>Behavioral</option><option>Mixed</option></select></div></div>
            <div className="field"><label>Number of questions</label><div className="question-options">{[5,10,15,20].map((n)=><button key={n} type="button" className={`question-option ${count===String(n)?"selected":""}`} onClick={()=>setCount(String(n))}><strong>{n}</strong><span>{n===5?"Quick":n===10?"Standard":n===15?"Deep":"Full"}</span></button>)}</div></div>
            {error&&<div className="error">{error}</div>}
            <button className="button button-primary large-button" disabled={loading}>{loading?<><Sparkles size={17}/> Generating questions...</>:<>Generate interview <ArrowRight size={17}/></>}</button>
          </form>
        </section>
      </div>
    </section>
  </main>;
}

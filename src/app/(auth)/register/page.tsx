"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, BrainCircuit, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router=useRouter(); const supabase=createClient();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setLoading(true);setError("");const {data,error}=await supabase.auth.signUp({email,password});if(error){setError(error.message);}else if(data.session){router.push("/dashboard");}else{setError("Account created. Check your email to confirm the account, then sign in.");}setLoading(false);}
  return <div className="auth-card"><div className="auth-brand"><span className="brand-mark"><Sparkles size={17}/></span><div><strong>InterviewAI</strong><small>Student Edition</small></div></div><div className="auth-layout"><section className="auth-form"><span className="eyebrow">START PRACTICING</span><h1>Build confidence<br/><span>before the interview.</span></h1><p className="auth-copy">Create a student account and start rehearsing technical, HR, behavioral, or mixed interviews.</p><form onSubmit={submit} className="auth-form-grid"><div className="field"><label>Email</label><div className="input-icon"><Mail size={16}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div></div><div className="field"><label>Password</label><div className="input-icon"><LockKeyhole size={16}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 8 characters" minLength={8} required/></div></div>{error&&<div className="error">{error}</div>}<button className="button button-primary large-button" disabled={loading}>{loading?"Creating account...":<>Create account <ArrowRight size={17}/></>}</button></form><p className="auth-switch">Already registered? <Link href="/login">Sign in</Link></p></section><section className="auth-feature-panel"><div className="feature-orb"><BrainCircuit size={42}/></div><h2>One platform. Four simple steps.</h2><p>Set your role, answer naturally, get AI feedback, and review your progress after every practice session.</p><div className="auth-feature-list"><span><Sparkles size={15}/> 5, 10, 15, or 20 questions</span><span><LockKeyhole size={15}/> Browser camera and microphone</span><span><ArrowRight size={15}/> Voice playback for feedback</span></div></section></div></div>;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, BrainCircuit, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router=useRouter(); const supabase=createClient();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setLoading(true);setError("");const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);else router.push("/dashboard");setLoading(false);}
  return <div className="auth-card"><div className="auth-brand"><span className="brand-mark"><Sparkles size={17}/></span><div><strong>InterviewAI</strong><small>Student Edition</small></div></div><div className="auth-layout"><section className="auth-form"><span className="eyebrow">WELCOME BACK</span><h1>Practice smarter.<br/><span>Interview better.</span></h1><p className="auth-copy">A simple AI mock interview platform for students to prepare with realistic questions and instant feedback.</p><form onSubmit={submit} className="auth-form-grid"><div className="field"><label>Email</label><div className="input-icon"><Mail size={16}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div></div><div className="field"><label>Password</label><div className="input-icon"><LockKeyhole size={16}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/></div></div>{error&&<div className="error">{error}</div>}<button className="button button-primary large-button" disabled={loading}>{loading?"Signing in...":<>Sign in <ArrowRight size={17}/></>}</button></form><p className="auth-switch">New to InterviewAI? <Link href="/register">Create an account</Link></p></section><section className="auth-feature-panel"><div className="feature-orb"><BrainCircuit size={42}/></div><h2>Your interview room is ready.</h2><p>Generate role-specific questions, practice with voice and camera, and get a clear performance report.</p><div className="auth-feature-list"><span><Sparkles size={15}/> Gemini-generated questions</span><span><LockKeyhole size={15}/> Secure Supabase login</span><span><ArrowRight size={15}/> Instant answer evaluation</span></div></section></div></div>;
}

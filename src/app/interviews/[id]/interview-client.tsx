"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, Mic, MicOff, Send, Sparkles, Video, VideoOff, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import VoiceButton from "@/components/voice-button";

type Question={id:string;question_number:number;question_text:string};
type Interview={id:string;role:string;experience_level:string;interview_type:string;question_count:number};

declare global { interface Window { SpeechRecognition?: any; webkitSpeechRecognition?: any; } }

function appendTranscript(existing:string, incoming:string) {
  const clean = incoming.replace(/\s+/g, " ").trim();
  if (!clean) return existing;
  if (!existing.trim()) return clean;
  return `${existing.trim()} ${clean}`;
}

export default function InterviewClient({interview,questions}:{interview:Interview;questions:Question[]}){
  const router=useRouter();
  const videoRef=useRef<HTMLVideoElement>(null);
  const recognitionRef=useRef<any>(null);
  const [sessionId,setSessionId]=useState("");
  const [index,setIndex]=useState(0);
  const [answer,setAnswer]=useState("");
  const [interim,setInterim]=useState("");
  const [listening,setListening]=useState(false);
  const [camera,setCamera]=useState(false);
  const [error,setError]=useState("");
  const [feedback,setFeedback]=useState<any>(null);
  const [submitting,setSubmitting]=useState(false);
  const [autoRead,setAutoRead]=useState(false);
  const q=questions[index];

  useEffect(()=>{
    (async()=>{
      const r=await fetch("/api/student/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({interviewId:interview.id})});
      const d=await r.json().catch(()=>({}));
      if(r.ok)setSessionId(d.sessionId);else setError(d.error||"Could not start session");
    })();
  },[interview.id]);

  useEffect(()=>{
    if(!autoRead || !q?.question_text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(q.question_text);
    utterance.lang="en-US"; utterance.rate=0.96;
    window.speechSynthesis.speak(utterance);
  },[index,q?.question_text,autoRead]);

  useEffect(()=>()=>{
    recognitionRef.current?.stop();
    const stream=videoRef.current?.srcObject as MediaStream|null;
    stream?.getTracks().forEach((track)=>track.stop());
    if(typeof window!=="undefined") window.speechSynthesis?.cancel();
  },[]);

  async function toggleCamera(){
    if(camera){
      const stream=videoRef.current?.srcObject as MediaStream|null;
      stream?.getTracks().forEach(t=>t.stop());
      if(videoRef.current) videoRef.current.srcObject=null;
      setCamera(false); return;
    }
    setError("");
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:true});
      if(videoRef.current){videoRef.current.srcObject=stream; await videoRef.current.play();}
      setCamera(true);
    }catch{setError("Camera permission was not granted. You can continue without video.");}
  }

  function stopRecognition(){
    recognitionRef.current?.stop();
    recognitionRef.current=null;
    setListening(false);
    setInterim("");
  }

  function toggleSpeech(){
    if(listening){stopRecognition();return;}
    setError("");
    const C=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!C){setError("Speech recognition is not supported in this browser. Type your answer instead.");return;}
    const recognition=new C();
    recognition.lang="en-US";
    recognition.continuous=true;
    recognition.interimResults=true;
    recognition.maxAlternatives=1;
    recognition.onresult=(event:any)=>{
      let pending="";
      let finalized="";
      for(let i=event.resultIndex;i<event.results.length;i++){
        const result=event.results[i];
        const transcript=String(result?.[0]?.transcript ?? "").trim();
        if(!transcript) continue;
        if(result.isFinal) finalized=appendTranscript(finalized,transcript);
        else pending=appendTranscript(pending,transcript);
      }
      if(finalized){
        setAnswer(prev=>appendTranscript(prev,finalized));
        setInterim("");
      } else {
        setInterim(pending);
      }
    };
    recognition.onerror=(event:any)=>{
      if(event?.error!=="aborted" && event?.error!=="no-speech") setError(`Microphone error: ${event.error}. You can type instead.`);
      setListening(false); setInterim("");
    };
    recognition.onend=()=>{setListening(false);setInterim("");recognitionRef.current=null;};
    recognitionRef.current=recognition;
    try{recognition.start();setListening(true);}catch{setError("Could not start the microphone. Please try again.");}
  }

  async function submitAnswer(){
    if(!sessionId||!q||!answer.trim())return;
    stopRecognition(); setSubmitting(true); setError("");
    const r=await fetch("/api/student/evaluate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId,questionId:q.id,answer:answer.trim(),isLast:index===questions.length-1})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok){setError(d.error||"Evaluation failed");setSubmitting(false);return;}
    setFeedback(d.evaluation);
    setSubmitting(false);
  }

  function nextQuestion(){
    if(index===questions.length-1){router.push(`/results/${sessionId}`);return;}
    setIndex((i)=>i+1);setAnswer("");setInterim("");setFeedback(null);setError("");window.scrollTo({top:0,behavior:"smooth"});
  }

  return <main className="interview-page">
    <div className="interview-topbar">
      <Link href="/dashboard" className="back-link"><ArrowLeft size={17}/> Exit</Link>
      <div className="interview-brand"><div className="brand-mark"><Sparkles size={16}/></div><div><strong>InterviewAI</strong><span>{interview.role} · {interview.interview_type}</span></div></div>
      <span className="question-counter">Question {index+1}<span>/ {questions.length}</span></span>
    </div>

    <div className="interview-progress"><span style={{width:`${((index+1)/questions.length)*100}%`}}/></div>

    <div className="interview-layout">
      <section className="question-panel">
        <div className="panel-kicker">AI INTERVIEWER</div>
        <div className="question-number">0{index+1}</div>
        <h1>{q?.question_text}</h1>
        <div className="question-actions">
          <VoiceButton text={q?.question_text ?? ""} label="Read question aloud" />
          <label className="switch-control"><input type="checkbox" checked={autoRead} onChange={(e)=>setAutoRead(e.target.checked)}/><span className="switch-ui"/> Auto-read questions</label>
        </div>
        <div className="tip-box"><Sparkles size={17}/><div><strong>Interview tip</strong><p>Keep the answer structured: explain your approach, give a concrete example, then close with the result.</p></div></div>
      </section>

      <section className="response-column">
        <div className="camera-card">
          <div className="camera-header"><div><span className="panel-kicker">LIVE PRESENCE</span><h2>Camera preview</h2></div><span className={`live-dot ${camera?"on":""}`}>{camera?"Live":"Off"}</span></div>
          <div className="video-wrap"><video ref={videoRef} muted playsInline className="video"/><div className="camera-overlay"><Video size={18}/>{camera?"Camera active":"Camera is off"}</div></div>
          <button className="button button-secondary full-button" onClick={toggleCamera}>{camera?<><VideoOff size={17}/> Turn camera off</>:<><Video size={17}/> Turn camera on</>}</button>
        </div>

        <div className="answer-card">
          <div className="answer-header"><div><span className="panel-kicker">YOUR RESPONSE</span><h2>Answer the interviewer</h2></div><span className={`mic-status ${listening?"active":""}`}>{listening?<><span className="pulse-dot"/> Listening</>:"Ready"}</span></div>
          <textarea value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type your response here, or use the microphone to speak naturally..."/>
          {interim && <div className="interim-text"><span>Live transcript</span>{interim}</div>}
          <div className="answer-toolbar"><button className={`button ${listening?"button-danger":"button-secondary"}`} onClick={toggleSpeech}>{listening?<><MicOff size={17}/> Stop microphone</>:<><Mic size={17}/> Use microphone</>}</button><button className="text-button" type="button" onClick={()=>{setAnswer("");setInterim("");}}>Clear</button></div>
          <div className="submit-row"><div className="answer-hint"><CircleAlert size={15}/> Your answer is evaluated only after you submit it.</div><button className="button button-primary large-button" onClick={submitAnswer} disabled={submitting||!answer.trim()||!sessionId}>{submitting?<><Sparkles size={17}/> Evaluating...</>:<><Send size={17}/> Submit answer</>}</button></div>
          {error&&<div className="error" style={{marginTop:14}}>{error}</div>}
        </div>

        {feedback && <section className="feedback-card">
          <div className="feedback-head"><div><span className="panel-kicker">AI FEEDBACK</span><h2>Your answer was evaluated</h2></div><div className="overall-score"><strong>{feedback.overall_score}</strong><span>/10</span></div></div>
          <div className="score-grid"><div><span>Relevance</span><strong>{feedback.relevance_score}/10</strong></div><div><span>Technical accuracy</span><strong>{feedback.technical_score}/10</strong></div><div><span>Clarity</span><strong>{feedback.clarity_score}/10</strong></div></div>
          <div className="feedback-copy"><CheckCircle2 size={18}/><p>{feedback.feedback}</p></div>
          <div className="feedback-actions"><VoiceButton text={feedback.feedback} label="Hear AI feedback" /><button className="button button-primary" onClick={nextQuestion}>{index===questions.length-1?"View final report":"Next question"} <span>→</span></button></div>
        </section>}
      </section>
    </div>
  </main>;
}

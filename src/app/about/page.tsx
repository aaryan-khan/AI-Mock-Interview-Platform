import { BrainCircuit, Camera, Mic, Sparkles, Volume2 } from "lucide-react";
import StudentShell from "@/components/student-shell";
import { requireUser } from "@/lib/student-auth";

const steps = [
  ["1", "Choose your interview", "Pick the job role, experience level, interview type, and number of questions."],
  ["2", "Answer naturally", "Use the webcam, type an answer, or speak using your browser microphone."],
  ["3", "Get AI feedback", "AI evaluates relevance, technical accuracy, clarity, and overall performance."],
  ["4", "Review and improve", "Listen to feedback aloud, review the report, and practice again."],
];

export default async function AboutPage() {
  const { user } = await requireUser();
  return (
    <StudentShell email={user.email} title="How the platform works" subtitle="A student-friendly AI interview workflow built around practice, feedback, and repetition.">
      <section className="hero-card compact-hero">
        <div className="hero-orbit"><Sparkles size={28} /></div>
        <div><span className="eyebrow light">BUILT FOR PRACTICE</span><h2>Practice like a real interview, without the pressure.</h2><p>InterviewAI combines intelligent AI evaluation with browser-based microphone, camera, and voice playback so you can rehearse the full experience from your laptop.</p></div>
      </section>

      <section className="feature-grid">
        <div className="feature-card"><BrainCircuit size={21} /><h3>Intelligent AI evaluation</h3><p>Questions are generated for the role you select, then your answers are scored against simple interview criteria.</p></div>
        <div className="feature-card"><Mic size={21} /><h3>Speech input</h3><p>Speak directly into the interview page and see your transcript appear in the answer box.</p></div>
        <div className="feature-card"><Camera size={21} /><h3>Camera preview</h3><p>Turn on your webcam to practice the same presentation and confidence habits you need in a real interview.</p></div>
        <div className="feature-card"><Volume2 size={21} /><h3>Voice feedback</h3><p>Play questions and feedback aloud using the browser's speech synthesis controls.</p></div>
      </section>

      <section className="section-card">
        <div className="section-title-row"><div><h2>Four-step flow</h2><p>Keep the experience focused and easy to demonstrate.</p></div></div>
        <div className="steps-grid">
          {steps.map(([n, title, text]) => <div className="step-card" key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}
        </div>
      </section>
    </StudentShell>
  );
}

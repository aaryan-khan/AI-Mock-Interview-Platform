import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { askAI } from "@/lib/student-ai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { sessionId, questionId, answer, isLast } = await request.json();
  const { data: session } = await (supabase.from("student_sessions") as any)
    .select("*").eq("id", sessionId).eq("user_id", user.id).single();
  const { data: question } = await (supabase.from("student_questions") as any)
    .select("*").eq("id", questionId).single();
  if (!session || !question) return NextResponse.json({ error: "Session or question not found" }, { status: 404 });

  const prompt = `Evaluate this mock interview answer for a ${session.interview_id ? "student candidate" : "candidate"}. Return valid JSON with integer scores from 0 to 10 for relevance_score, technical_score, clarity_score, overall_score, plus a concise feedback string with one strength and one improvement suggestion. Do not use markdown and do not invent facts. Be encouraging but honest.\n\nQuestion: ${question.question_text}\n\nCandidate answer: ${String(answer).slice(0, 6000)}`;

  let evaluation: any;
  try {
    const response = await askAI(prompt);
    evaluation = JSON.parse(response.replace(/^```json\s*|\s*```$/g, "").trim());
  } catch (error) {
    console.error("AI evaluation error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "AI evaluation temporarily unavailable.";

    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }

  let feedbackText = "Good attempt. Try to make the answer more specific, structured, and evidence-based.";
  if (typeof evaluation.feedback === "string") {
    feedbackText = evaluation.feedback;
  } else if (evaluation.feedback && typeof evaluation.feedback === "object") {
    const parts: string[] = [];
    if (evaluation.feedback.strength) parts.push(`Strength: ${evaluation.feedback.strength}`);
    if (evaluation.feedback.improvement) parts.push(`Improvement: ${evaluation.feedback.improvement}`);
    feedbackText = parts.length ? parts.join(" ") : JSON.stringify(evaluation.feedback);
  }

  const clean = {
    relevance_score: Math.max(0, Math.min(10, Number(evaluation.relevance_score) || 0)),
    technical_score: Math.max(0, Math.min(10, Number(evaluation.technical_score) || 0)),
    clarity_score: Math.max(0, Math.min(10, Number(evaluation.clarity_score) || 0)),
    overall_score: Math.max(0, Math.min(10, Number(evaluation.overall_score) || 0)),
    feedback: feedbackText,
  };

  const { error } = await (supabase.from("student_answers") as any).insert({
    session_id: sessionId,
    question_id: questionId,
    answer_text: String(answer),
    ...clean,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (isLast) {
    const { data: answers } = await (supabase.from("student_answers") as any)
      .select("overall_score,feedback").eq("session_id", sessionId);
    const avg = (answers ?? []).reduce((s: number, a: any) => s + Number(a.overall_score), 0) / (answers?.length || 1);
    const summary = `Overall performance: ${avg.toFixed(1)}/10. ${clean.feedback}`;
    await (supabase.from("student_sessions") as any).update({
      overall_score: Number(avg.toFixed(2)),
      summary,
      completed_at: new Date().toISOString(),
    }).eq("id", sessionId).eq("user_id", user.id);
  }

  return NextResponse.json({ evaluation: clean });
}

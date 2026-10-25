import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { askAI } from "@/lib/student-ai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const role = String(body.role ?? "").trim();
  const experienceLevel = String(body.experienceLevel ?? "").trim();
  const interviewType = String(body.interviewType ?? "").trim();
  const questionCount = Number(body.questionCount);
  if (!role || !experienceLevel || !interviewType || ![5,10,15,20].includes(questionCount)) {
    return NextResponse.json({ error: "Please provide valid interview settings." }, { status: 400 });
  }

  const prompt = `You are an interview question generator for a student project. Generate exactly ${questionCount} interview questions for a ${role} with ${experienceLevel} experience. Interview type: ${interviewType}. Keep questions practical and moderately difficult. Return a JSON object with a "questions" key containing the list of ${questionCount} question strings, or a JSON array of strings. Do not use markdown.`;

  let response = "";
  try {
    response = await askAI(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let questions: string[] = [];
  try {
    const cleaned = response.replace(/^```json\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      questions = parsed.map(String).filter(Boolean);
    } else if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.questions)) {
        questions = parsed.questions.map(String).filter(Boolean);
      } else {
        questions = Object.values(parsed).map(String).filter(Boolean);
      }
    }
  } catch {
    return NextResponse.json({ error: "AI returned an invalid question list. Please try again." }, { status: 502 });
  }

  questions = questions.slice(0, questionCount);
  if (questions.length === 0) {
    return NextResponse.json({ error: "AI did not generate questions. Please try again." }, { status: 502 });
  }

  const { data: interview, error } = await (supabase.from("student_interviews") as any)
    .insert({
      user_id: user.id,
      role,
      experience_level: experienceLevel,
      interview_type: interviewType,
      question_count: questionCount,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = questions.map((text, index) => ({
    interview_id: interview.id,
    question_number: index + 1,
    question_text: text,
  }));

  const { error: questionError } = await (supabase.from("student_questions") as any).insert(rows);
  if (questionError) return NextResponse.json({ error: questionError.message }, { status: 500 });

  return NextResponse.json({ interviewId: interview.id });
}

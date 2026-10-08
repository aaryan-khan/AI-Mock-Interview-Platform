import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { askGemini } from "@/lib/student-ai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await request.json();
  const role = String(body.role ?? "").trim();
  const experienceLevel = String(body.experienceLevel ?? "").trim();
  const interviewType = String(body.interviewType ?? "").trim();
  const questionCount = Number(body.questionCount);
  if (!role || !experienceLevel || !interviewType || ![5,10,15,20].includes(questionCount)) return NextResponse.json({error:"Please provide valid interview settings."},{status:400});

  const prompt = `You are an interview question generator for a student project. Generate exactly ${questionCount} interview questions for a ${role} with ${experienceLevel} experience. Interview type: ${interviewType}. Keep questions practical and moderately difficult. Return ONLY a JSON array of strings, with no markdown.`;
  let response = "";
  try {
    response = await askGemini(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
  let questions: string[];
  try { questions = JSON.parse(response.replace(/^```json\s*|\s*```$/g,"")); } catch { return NextResponse.json({error:"AI returned an invalid question list. Please try again."},{status:502}); }
  questions = Array.isArray(questions) ? questions.map(String).filter(Boolean).slice(0, questionCount) : [];
  if (questions.length !== questionCount) return NextResponse.json({error:"AI did not generate the requested number of questions."},{status:502});

  const { data: interview, error } = await (supabase.from("student_interviews") as any).insert({ user_id:user.id, role, experience_level:experienceLevel, interview_type:interviewType, question_count:questionCount }).select().single();
  if (error) return NextResponse.json({error:error.message},{status:500});
  const rows=questions.map((text,index)=>({interview_id:interview.id,question_number:index+1,question_text:text}));
  const { error: questionError } = await (supabase.from("student_questions") as any).insert(rows);
  if (questionError) return NextResponse.json({error:questionError.message},{status:500});
  return NextResponse.json({interviewId:interview.id});
}

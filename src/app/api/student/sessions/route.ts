import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { interviewId } = await request.json();
  const { data: interview } = await (supabase.from("student_interviews") as any)
    .select("id").eq("id", interviewId).eq("user_id", user.id).single();
  if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

  const { data: existing } = await (supabase.from("student_sessions") as any)
    .select("*").eq("interview_id", interviewId).eq("user_id", user.id).is("completed_at", null)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existing) {
    const { count } = await (supabase.from("student_answers") as any)
      .select("id", { count: "exact", head: true }).eq("session_id", existing.id);
    if ((count ?? 0) === 0) return NextResponse.json({ sessionId: existing.id });
  }

  const { data, error } = await (supabase.from("student_sessions") as any)
    .insert({ interview_id: interviewId, user_id: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessionId: data.id });
}

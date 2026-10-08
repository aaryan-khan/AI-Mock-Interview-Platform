import { notFound } from "next/navigation";
import { requireUser } from "@/lib/student-auth";
import InterviewClient from "./interview-client";

export default async function InterviewPage({ params }: { params: Promise<{id:string}> }) {
  const {supabase,user}=await requireUser(); const {id}=await params;
  const {data:interview}=await (supabase.from("student_interviews") as any).select("*").eq("id",id).eq("user_id",user.id).single();
  if(!interview) notFound();
  const {data:questions}=await (supabase.from("student_questions") as any).select("*").eq("interview_id",id).order("question_number");
  return <InterviewClient interview={interview} questions={questions ?? []}/>;
}

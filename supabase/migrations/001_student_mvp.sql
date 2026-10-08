-- AI Mock Interview - simple student project schema

CREATE TABLE student_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  experience_level text NOT NULL,
  interview_type text NOT NULL,
  question_count integer NOT NULL CHECK (question_count IN (5, 10, 15, 20)),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE student_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES student_interviews(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (interview_id, question_number)
);

CREATE TABLE student_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES student_interviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score numeric(4,2),
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE student_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES student_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES student_questions(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  relevance_score integer NOT NULL CHECK (relevance_score BETWEEN 0 AND 10),
  technical_score integer NOT NULL CHECK (technical_score BETWEEN 0 AND 10),
  clarity_score integer NOT NULL CHECK (clarity_score BETWEEN 0 AND 10),
  overall_score integer NOT NULL CHECK (overall_score BETWEEN 0 AND 10),
  feedback text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX student_interviews_user_idx ON student_interviews(user_id, created_at DESC);
CREATE INDEX student_questions_interview_idx ON student_questions(interview_id, question_number);
CREATE INDEX student_sessions_user_idx ON student_sessions(user_id, created_at DESC);
CREATE INDEX student_answers_session_idx ON student_answers(session_id);

ALTER TABLE student_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own interviews"
  ON student_interviews FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users read their own questions"
  ON student_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM student_interviews i WHERE i.id = interview_id AND i.user_id = auth.uid()));

CREATE POLICY "Users create questions for their interviews"
  ON student_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM student_interviews i WHERE i.id = interview_id AND i.user_id = auth.uid()));

CREATE POLICY "Users manage their own sessions"
  ON student_sessions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage answers in their sessions"
  ON student_answers FOR ALL
  USING (EXISTS (SELECT 1 FROM student_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM student_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));

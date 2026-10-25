import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MockQueryBuilder } from "./mock-db";

const DEFAULT_MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "student@example.com",
  user_metadata: { name: "Student" },
  app_metadata: {},
  aud: "authenticated",
  role: "authenticated",
  created_at: new Date().toISOString(),
};

export async function createClient() {
  const cookieStore = await cookies();

  if (process.env.NEXT_PUBLIC_MOCK_SUPABASE === "true") {
    const isLoggedOut = cookieStore.get("mock_logged_out")?.value === "true";
    const customEmail = cookieStore.get("mock_user_email")?.value;
    const user = isLoggedOut
      ? null
      : {
          ...DEFAULT_MOCK_USER,
          email: customEmail || DEFAULT_MOCK_USER.email,
        };

    return {
      auth: {
        async getUser() {
          return { data: { user }, error: null };
        },
        async signOut() {
          try {
            cookieStore.set("mock_logged_out", "true");
          } catch {}
          return { error: null };
        },
      },
      from(tableName: any) {
        return new MockQueryBuilder(tableName);
      },
    } as any;
  }

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

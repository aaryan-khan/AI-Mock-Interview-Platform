import { createBrowserClient } from "@supabase/ssr";

let client: any = null;

export function createClient() {
  if (client) return client;

  if (process.env.NEXT_PUBLIC_MOCK_SUPABASE === "true") {
    client = {
      auth: {
        async getUser() {
          return {
            data: {
              user: {
                id: "00000000-0000-0000-0000-000000000001",
                email: "student@example.com",
              },
            },
            error: null,
          };
        },
        async signInWithPassword({ email }: { email?: string }) {
          if (typeof document !== "undefined") {
            document.cookie = `mock_user_email=${email || "student@example.com"}; path=/; max-age=86400`;
            document.cookie = `mock_logged_out=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
          return {
            data: {
              user: {
                id: "00000000-0000-0000-0000-000000000001",
                email: email || "student@example.com",
              },
              session: { access_token: "mock-token" },
            },
            error: null,
          };
        },
        async signUp({ email }: { email?: string }) {
          if (typeof document !== "undefined") {
            document.cookie = `mock_user_email=${email || "student@example.com"}; path=/; max-age=86400`;
            document.cookie = `mock_logged_out=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
          return {
            data: {
              user: {
                id: "00000000-0000-0000-0000-000000000001",
                email: email || "student@example.com",
              },
              session: { access_token: "mock-token" },
            },
            error: null,
          };
        },
        async signOut() {
          if (typeof document !== "undefined") {
            document.cookie = `mock_logged_out=true; path=/; max-age=86400`;
          }
          return { error: null };
        },
      },
    };
    return client;
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}

import { createClient } from "@supabase/supabase-js";

// 클라이언트 사이드용 (익명 키)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or key is not set");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 서버 사이드용 (Service Role 키 - 관리자 권한)
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;

if (!supabaseServiceKey) {
  throw new Error("Supabase Service Role key is not set");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

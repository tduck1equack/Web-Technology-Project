import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomePage from "@/components/home/HomePage";

export const metadata = {
  title: "EduTech Platform - Trang Chủ",
  description: "Nền tảng học tập trực tuyến hiện đại",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HomePage user={user} />;
}

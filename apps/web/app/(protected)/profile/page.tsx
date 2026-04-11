import { Metadata } from "next";
import ProfilePage from "@/components/profile/ProfilePage";

export const metadata: Metadata = {
  title: "Trang cá nhân - EduTech",
  description: "Quản lý thông tin cá nhân của bạn",
};

export default function Profile() {
  return <ProfilePage />;
}

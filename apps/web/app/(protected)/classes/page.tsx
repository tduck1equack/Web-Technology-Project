import { Metadata } from "next";
import ClassesPage from "@/components/classes/ClassesPage";

export const metadata: Metadata = {
  title: "Danh sách lớp học - EduTech",
  description: "Xem và quản lý các lớp học của bạn",
};

export default function Classes() {
  return <ClassesPage />;
}

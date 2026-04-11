import { Metadata } from "next";
import ClassDetailPage from "@/components/classes/ClassDetailPage";

interface ClassDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Chi tiết lớp học - EduTech",
  description: "Xem chi tiết thông tin lớp học",
};

export default async function ClassDetail({ params }: ClassDetailPageProps) {
  const { id } = await params;
  return <ClassDetailPage classId={id} />;
}

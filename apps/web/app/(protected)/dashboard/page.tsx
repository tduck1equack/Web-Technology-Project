import type { Metadata } from "next";
import DashboardPage from "@/components/dashboard/DashboardPage";

export const metadata: Metadata = {
    title: "Dashboard - EduTech",
    description: "Trang tổng quan về học tập của bạn",
};

export default function Dashboard() {
    return <DashboardPage />;
}

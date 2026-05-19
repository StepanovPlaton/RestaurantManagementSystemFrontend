import { StaffDesktopLayout } from "@/widgets/layouts/staff-desktop-layout";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffDesktopLayout>{children}</StaffDesktopLayout>;
}

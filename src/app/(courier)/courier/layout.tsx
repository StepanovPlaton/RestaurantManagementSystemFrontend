import { CourierMobileLayout } from "@/widgets/layouts/mobile-bottom-nav-layout";

export default function CourierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CourierMobileLayout>{children}</CourierMobileLayout>;
}

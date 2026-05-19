import { ClientMobileLayout } from "@/widgets/layouts/mobile-bottom-nav-layout";

export default function ClientAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientMobileLayout>{children}</ClientMobileLayout>;
}

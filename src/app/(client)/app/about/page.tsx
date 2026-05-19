import { AboutDevelopersPage } from "@/views/about";

export default function ClientAboutPage() {
  return (
    <AboutDevelopersPage
      helpHref="/app/help"
      backHref="/app/profile"
      variant="mobile"
    />
  );
}

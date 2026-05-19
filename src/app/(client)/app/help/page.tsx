import { HelpPageShell } from "@/views/help";

export default function ClientHelpPage() {
  return (
    <HelpPageShell
      aboutHref="/app/about"
      backHref="/app/profile"
      variant="mobile"
    />
  );
}

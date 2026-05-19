import { HelpPageShell } from "@/views/help";

export default function CourierHelpPage() {
  return (
    <HelpPageShell
      aboutHref="/courier/about"
      backHref="/courier/profile"
      variant="mobile"
    />
  );
}

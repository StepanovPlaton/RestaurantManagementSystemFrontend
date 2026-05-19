import { getHelpDocument } from "@/content/help/get-help-document";

import {
  HelpDocumentPage,
  type HelpDocumentPageProps,
} from "./help-document-page";

export function HelpPageShell(
  props: Omit<HelpDocumentPageProps, "markdown" | "toc">,
) {
  const { markdown, toc } = getHelpDocument();
  return <HelpDocumentPage markdown={markdown} toc={toc} {...props} />;
}

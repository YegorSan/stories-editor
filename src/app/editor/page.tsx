import { EditorApp } from "@/components/editor/EditorApp";

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; draft?: string }>;
}) {
  const { template, draft } = await searchParams;
  return (
    <EditorApp
      key={draft ?? `t:${template ?? ""}`}
      templateId={template}
      draftId={draft}
    />
  );
}

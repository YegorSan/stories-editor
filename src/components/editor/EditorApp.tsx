"use client";

import { useEffect, useRef, useState } from "react";
import {
  countEmptyPhotoSlots,
  downloadBlob,
  exportStoryPng,
  fileToDataUrl,
} from "@/lib/exportStory";
import { getDraft, saveDraft } from "@/lib/drafts";
import { uid } from "@/lib/ids";
import { createStory } from "@/lib/templates";
import type { StoryDoc } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import {
  IconDelete,
  IconDown,
  IconDuplicate,
  IconUp,
} from "@/components/ui/icons";
import { ScrubField } from "@/components/ui/ScrubField";
import { Inspector } from "./Inspector";
import { LibraryDrawer } from "./LibraryDrawer";
import { ProofSheet } from "./ProofSheet";
import { StatusBar } from "./StatusBar";
import { StoryStage } from "./StoryStage";
import { ToolRail } from "./ToolRail";
import { TopBar } from "./TopBar";
import type { EditorTab, SheetDetent } from "./types";
import { useStoryEditor } from "./useStoryEditor";

const NUDGE_KEYS: Record<string, { x: number; y: number } | undefined> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

export function EditorApp({
  templateId,
  draftId,
}: {
  templateId?: string;
  draftId?: string;
}) {
  const [boot, setBoot] = useState<{
    id: string;
    title: string;
    doc: StoryDoc;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      if (draftId) {
        const existing = await getDraft(draftId).catch(() => null);
        if (!alive) return;
        if (existing) {
          setBoot({ id: existing.id, title: existing.title, doc: existing.doc });
          return;
        }
      }
      if (!alive) return;
      setBoot({
        id: uid("draft"),
        title: "Без назви",
        doc: createStory(templateId),
      });
    })();
    return () => {
      alive = false;
    };
  }, [draftId, templateId]);

  if (!boot) {
    return (
      <div className="grid h-dvh place-items-center bg-table text-ash data-mono">
        Завантажуємо кадр…
      </div>
    );
  }

  return <EditorWorkspace key={boot.id} boot={boot} />;
}

function EditorWorkspace({
  boot,
}: {
  boot: { id: string; title: string; doc: StoryDoc };
}) {
  const {
    doc,
    selected,
    selectedId,
    setSelectedId,
    setBackground,
    patchElement,
    commitElement,
    finishGesture,
    applyTemplate,
    addSticker,
    addText,
    addPhoto,
    removeSelected,
    duplicateSelected,
    moveLayer,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStoryEditor(boot.doc);

  const [tab, setTab] = useState<EditorTab>("stickers");
  const [publishOpen, setPublishOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(boot.title);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [safeZones, setSafeZones] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [sheetDetent, setSheetDetent] = useState<SheetDetent>("peek");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [readout, setReadout] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [frameIndex] = useState(() => {
    // Stable per-session frame number from draft id hash.
    let hash = 0;
    for (let i = 0; i < boot.id.length; i++) {
      hash = (hash * 31 + boot.id.charCodeAt(i)) >>> 0;
    }
    return (hash % 900) + 1;
  });

  const photoInput = useRef<HTMLInputElement>(null);
  const photoTarget = useRef<string | null>(null);
  const draftId = boot.id;
  const firstSave = useRef(true);
  const latest = useRef({ title, doc });

  useEffect(() => {
    latest.current = { title, doc };
  }, [title, doc]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("draft", draftId);
    url.searchParams.delete("template");
    window.history.replaceState({}, "", url);
  }, [draftId]);

  useEffect(() => {
    const delay = firstSave.current ? 0 : 500;
    firstSave.current = false;
    const timer = window.setTimeout(() => {
      setSaveState("saving");
      void saveDraft({ id: draftId, title, doc, updatedAt: Date.now() })
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [doc, title, draftId]);

  useEffect(() => {
    return () => {
      void saveDraft({
        id: draftId,
        title: latest.current.title,
        doc: latest.current.doc,
        updatedAt: Date.now(),
      }).catch(() => undefined);
    };
  }, [draftId]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPublishOpen(false);
        setSelectedId(null);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveDraft({ id: draftId, title, doc, updatedAt: Date.now() })
          .then(() => setSaveState("saved"))
          .catch(() => setSaveState("error"));
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeSelected();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }

      const nudge = NUDGE_KEYS[event.key];
      if (nudge && selectedId && selected) {
        event.preventDefault();
        const step = event.shiftKey ? 24 : 4;
        patchElement(selectedId, {
          x: selected.x + nudge.x * step,
          y: selected.y + nudge.y * step,
        });
        finishGesture();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    doc,
    draftId,
    finishGesture,
    patchElement,
    removeSelected,
    redo,
    selected,
    selectedId,
    setSelectedId,
    title,
    undo,
  ]);

  const exportBlob = () => exportStoryPng(doc);

  const openExport = () => {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 80);
    setPublishOpen(true);
  };

  const onDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await exportBlob();
      downloadBlob(blob, `${slug(title)}-${Date.now()}.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка експорту");
    } finally {
      setBusy(false);
    }
  };

  const onShare = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await exportBlob();
      const file = new File([blob], `${slug(title)}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title });
        return;
      }
      downloadBlob(blob, `${slug(title)}.png`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Не вдалося поділитись");
    } finally {
      setBusy(false);
    }
  };

  const onTab = (next: EditorTab) => {
    setTab(next);
    setDrawerOpen(true);
    setSheetDetent((d) => (d === "peek" ? "half" : d));
  };

  const closeDrawerAfterAdd = () => {
    // On medium screens the drawer overlays the stage — close after add.
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1279px)").matches) {
      setDrawerOpen(false);
    }
  };

  const library = (
    <LibraryDrawer
      tab={tab}
      onAddSticker={(id) => {
        addSticker(id);
        closeDrawerAfterAdd();
      }}
      onAddText={() => {
        addText();
        closeDrawerAfterAdd();
      }}
      onApplyTemplate={(id) => {
        applyTemplate(id);
        setToast("Шаблон застосовано · ⌘Z");
        closeDrawerAfterAdd();
      }}
      onBackground={setBackground}
      onUploadPhoto={async (file, asCover) => {
        const src = await fileToDataUrl(file);
        addPhoto(src, asCover);
        closeDrawerAfterAdd();
      }}
      selected={selected}
      onChangeSelected={(patch) => {
        if (!selectedId) return;
        patchElement(selectedId, patch);
      }}
      onCommitSelected={finishGesture}
    />
  );

  const inspector = (
    <Inspector
      doc={doc}
      selected={selected}
      selectedId={selectedId}
      hoveredId={hoveredId}
      onHover={setHoveredId}
      onSelect={setSelectedId}
      onChangeSelected={(patch) => {
        if (!selectedId) return;
        patchElement(selectedId, patch);
      }}
      onCommitSelected={finishGesture}
      onDuplicate={duplicateSelected}
      onDelete={removeSelected}
      onLayer={moveLayer}
    />
  );

  const stage = (
    <StoryStage
      doc={doc}
      selectedId={selectedId}
      hoveredId={hoveredId}
      safeZones={safeZones}
      flash={flash}
      onSelect={setSelectedId}
      onChangeElement={patchElement}
      onCommit={finishGesture}
      onPhotoPick={(id) => {
        photoTarget.current = id;
        photoInput.current?.click();
      }}
      onReadout={setReadout}
    />
  );

  const sheetHeight =
    sheetDetent === "full" ? "85dvh" : sheetDetent === "half" ? "50dvh" : "7rem";

  return (
    <div className="flex h-dvh flex-col bg-table text-bone">
      <TopBar
        title={title}
        frameIndex={frameIndex}
        saveState={saveState}
        canUndo={canUndo}
        canRedo={canRedo}
        onTitle={setTitle}
        onUndo={undo}
        onRedo={redo}
        onExport={openExport}
      />

      {/* Desktop / tablet workspace (≥768) */}
      <div className="relative hidden min-h-0 flex-1 md:flex">
        <ToolRail tab={tab} onTab={onTab} />

        {/* Library: docked ≥1280, overlay 768–1279 */}
        <div
          className={`hidden h-full w-[304px] shrink-0 xl:block ${
            drawerOpen ? "" : "xl:hidden"
          }`}
        >
          {library}
        </div>
        {drawerOpen ? (
          <div className="absolute inset-y-0 left-16 z-30 w-[304px] border-r border-rule shadow-[0_16px_40px_-12px_#000000A6] xl:hidden">
            {library}
            <button
              type="button"
              aria-label="Закрити панель"
              className="absolute -right-8 top-2 flex h-7 w-7 items-center justify-center border border-rule bg-bench text-ash hover:text-bone"
              onClick={() => setDrawerOpen(false)}
            >
              ×
            </button>
          </div>
        ) : null}

        <div className="min-h-0 min-w-0 flex-1 bg-table">{stage}</div>

        {/* Inspector: docked ≥1024, overlay 768–1023 when selected */}
        <div className="hidden h-full w-[296px] shrink-0 lg:block">{inspector}</div>
        {selectedId ? (
          <div className="absolute inset-y-0 right-0 z-30 w-[296px] border-l border-rule shadow-[0_16px_40px_-12px_#000000A6] lg:hidden">
            {inspector}
          </div>
        ) : null}
      </div>

      {/* Mobile workspace (<768) */}
      <div className="relative flex min-h-0 flex-1 flex-col md:hidden">
        <div className="min-h-0 flex-1 bg-table pb-[env(safe-area-inset-bottom)]">
          {stage}
        </div>

        {selected ? (
          <div className="flex shrink-0 items-center gap-1 border-t border-rule bg-bench px-2 py-2">
            <div className="min-w-0 flex-1 px-1">
              <ScrubField
                label="Масштаб"
                value={selected.scale}
                min={0.2}
                max={3}
                step={0.01}
                decimals={2}
                onChange={(scale) => {
                  if (!selectedId) return;
                  patchElement(selectedId, { scale });
                }}
                onCommit={finishGesture}
              />
            </div>
            <Button variant="ghost" className="!min-h-11 !px-2" onClick={() => moveLayer("up")}>
              <IconUp />
            </Button>
            <Button variant="ghost" className="!min-h-11 !px-2" onClick={() => moveLayer("down")}>
              <IconDown />
            </Button>
            <Button variant="ghost" className="!min-h-11 !px-2" onClick={duplicateSelected}>
              <IconDuplicate />
            </Button>
            <Button variant="ghost" className="!min-h-11 !px-2 !text-danger" onClick={removeSelected}>
              <IconDelete />
            </Button>
          </div>
        ) : null}

        <div
          className="relative z-20 flex shrink-0 flex-col border-t border-rule bg-bench transition-[height] duration-[220ms] ease-[var(--ease-snap)]"
          style={{ height: sheetHeight }}
        >
          <button
            type="button"
            aria-label="Висота панелі"
            className="flex h-5 w-full items-center justify-center"
            onClick={() =>
              setSheetDetent((d) =>
                d === "peek" ? "half" : d === "half" ? "full" : "peek",
              )
            }
          >
            <span className="h-1 w-10 rounded-full bg-rule-strong" />
          </button>
          <div className="min-h-0 flex-1 overflow-hidden">
            {sheetDetent === "peek" ? (
              <div className="px-3 pb-2">
                <p className="label-condensed text-ash">{tabLabel(tab)}</p>
                <p className="mt-1 text-sm text-ash">Потягни вгору для бібліотеки</p>
              </div>
            ) : (
              <div className="h-full">{library}</div>
            )}
          </div>
        </div>
        <ToolRail tab={tab} onTab={onTab} orientation="horizontal" />
      </div>

      <StatusBar
        saveState={saveState}
        safeZones={safeZones}
        onToggleSafeZones={() => setSafeZones((v) => !v)}
        readout={readout}
        zoomLabel="fit"
      />

      {toast ? (
        <div className="pointer-events-none absolute bottom-12 left-1/2 z-40 -translate-x-1/2 border border-rule-strong bg-bench px-3 py-2 data-mono text-bone shadow-[0_16px_40px_-12px_#000000A6]">
          {toast}
        </div>
      ) : null}

      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          const id = photoTarget.current;
          event.target.value = "";
          if (!file || !id) return;
          const src = await fileToDataUrl(file);
          commitElement(id, { src });
        }}
      />

      <ProofSheet
        open={publishOpen}
        busy={busy}
        error={error}
        emptyPhotoSlots={countEmptyPhotoSlots(doc)}
        doc={doc}
        frameIndex={frameIndex}
        title={title}
        onClose={() => setPublishOpen(false)}
        onDownload={() => void onDownload()}
        onShare={() => void onShare()}
      />
    </div>
  );
}

function tabLabel(tab: EditorTab): string {
  switch (tab) {
    case "templates":
      return "Шаблони";
    case "stickers":
      return "Стікери";
    case "text":
      return "Текст";
    case "bg":
      return "Фон";
    case "media":
      return "Медіа";
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

function slug(title: string): string {
  const trimmed = title.trim().toLowerCase().replace(/\s+/g, "-");
  return trimmed || "kadr-story";
}

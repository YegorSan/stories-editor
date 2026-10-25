"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { uid } from "@/lib/ids";
import { createStory } from "@/lib/templates";
import {
  STORY_H,
  STORY_W,
  type PhotoElement,
  type StoryDoc,
  type StoryElement,
  type TextElement,
} from "@/lib/types";

export function useStoryEditor(initialDoc: StoryDoc) {
  const [doc, setDoc] = useState<StoryDoc>(initialDoc);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // History lives in refs: callers push and pop synchronously, and state
  // updaters run late (and twice under StrictMode), which corrupted the stacks.
  const history = useRef<{ past: StoryDoc[]; future: StoryDoc[] }>({
    past: [],
    future: [],
  });
  const [depth, setDepth] = useState({ past: 0, future: 0 });
  const docRef = useRef(doc);
  const snapshot = useRef(doc);

  const selected = useMemo(
    () => doc.elements.find((el) => el.id === selectedId) ?? null,
    [doc.elements, selectedId],
  );

  const syncDepth = useCallback(() => {
    const { past, future } = history.current;
    setDepth({ past: past.length, future: future.length });
  }, []);

  const pushPast = useCallback(
    (next: StoryDoc) => {
      const h = history.current;
      h.past = [...h.past.slice(-50), snapshot.current];
      h.future = [];
      snapshot.current = next;
      syncDepth();
    },
    [syncDepth],
  );

  const commit = useCallback(
    (next: StoryDoc) => {
      pushPast(next);
      docRef.current = next;
      setDoc(next);
    },
    [pushPast],
  );

  const finishGesture = useCallback(() => {
    const current = docRef.current;
    if (snapshot.current === current) return;
    pushPast(current);
  }, [pushPast]);

  const undo = useCallback(() => {
    const h = history.current;
    const prev = h.past[h.past.length - 1];
    if (!prev) return;
    h.past = h.past.slice(0, -1);
    h.future = [snapshot.current, ...h.future];
    snapshot.current = prev;
    docRef.current = prev;
    setDoc(prev);
    syncDepth();
  }, [syncDepth]);

  const redo = useCallback(() => {
    const h = history.current;
    const [next, ...rest] = h.future;
    if (!next) return;
    h.future = rest;
    h.past = [...h.past, snapshot.current];
    snapshot.current = next;
    docRef.current = next;
    setDoc(next);
    syncDepth();
  }, [syncDepth]);

  const applyTemplate = useCallback(
    (id: string) => {
      commit(createStory(id));
      setSelectedId(null);
    },
    [commit],
  );

  // docRef has to move synchronously: callers commit to history right after a
  // patch, and a state updater would not have run by then.
  const patchElement = useCallback((id: string, patch: Partial<StoryElement>) => {
    const next = {
      ...docRef.current,
      elements: docRef.current.elements.map((el) =>
        el.id === id ? ({ ...el, ...patch } as StoryElement) : el,
      ),
    };
    docRef.current = next;
    setDoc(next);
  }, []);

  const commitElement = useCallback(
    (id: string, patch: Partial<StoryElement>) => {
      const current = docRef.current;
      commit({
        ...current,
        elements: current.elements.map((el) =>
          el.id === id ? ({ ...el, ...patch } as StoryElement) : el,
        ),
      });
    },
    [commit],
  );

  const addSticker = useCallback(
    (stickerId: string) => {
      const current = docRef.current;
      const el: StoryElement = {
        id: uid("sticker"),
        type: "sticker",
        stickerId,
        x: STORY_W / 2 + (Math.random() * 80 - 40),
        y: STORY_H / 2 + (Math.random() * 80 - 40),
        scale: 1,
        rotation: Math.random() * 16 - 8,
        z: nextZ(current),
      };
      commit({ ...current, elements: [...current.elements, el] });
      setSelectedId(el.id);
    },
    [commit],
  );

  const addText = useCallback(() => {
    const current = docRef.current;
    const el: TextElement = {
      id: uid("text"),
      type: "text",
      text: "новий текст",
      fontId: "unbounded",
      fontSize: 64,
      color: "#F4EFE6",
      weight: 700,
      align: "center",
      x: STORY_W / 2,
      y: STORY_H / 2,
      scale: 1,
      rotation: 0,
      z: nextZ(current),
    };
    commit({ ...current, elements: [...current.elements, el] });
    setSelectedId(el.id);
  }, [commit]);

  const addPhoto = useCallback(
    (src: string | null, asBackground = false) => {
      const current = docRef.current;
      if (asBackground && src) {
        const cover: PhotoElement = {
          id: uid("photo"),
          type: "photo",
          src,
          width: STORY_W,
          height: STORY_H,
          radius: 0,
          x: STORY_W / 2,
          y: STORY_H / 2,
          scale: 1,
          rotation: 0,
          z: 0,
        };
        commit({
          ...current,
          elements: [
            cover,
            ...current.elements.map((el) => ({ ...el, z: el.z + 1 })),
          ],
        });
        setSelectedId(cover.id);
        return;
      }

      const el: PhotoElement = {
        id: uid("photo"),
        type: "photo",
        src,
        width: 720,
        height: 900,
        radius: 16,
        x: STORY_W / 2,
        y: STORY_H / 2,
        scale: 1,
        rotation: 0,
        z: nextZ(current),
      };
      commit({ ...current, elements: [...current.elements, el] });
      setSelectedId(el.id);
    },
    [commit],
  );

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    const current = docRef.current;
    commit({
      ...current,
      elements: current.elements.filter((el) => el.id !== selectedId),
    });
    setSelectedId(null);
  }, [commit, selectedId]);

  const duplicateSelected = useCallback(() => {
    if (!selected) return;
    const current = docRef.current;
    const copy: StoryElement = {
      ...selected,
      id: uid(selected.type),
      x: selected.x + 40,
      y: selected.y + 40,
      z: nextZ(current),
    };
    commit({ ...current, elements: [...current.elements, copy] });
    setSelectedId(copy.id);
  }, [commit, selected]);

  const moveLayer = useCallback(
    (direction: "up" | "down") => {
      const current = docRef.current;
      const order = [...current.elements].sort((a, b) => a.z - b.z);
      const index = order.findIndex((el) => el.id === selectedId);
      const neighbourIndex = direction === "up" ? index + 1 : index - 1;
      if (index === -1 || neighbourIndex < 0 || neighbourIndex >= order.length) {
        return;
      }

      const moved = order[index];
      const neighbour = order[neighbourIndex];
      commit({
        ...current,
        elements: current.elements.map((el) => {
          if (el.id === moved.id) return { ...el, z: neighbour.z };
          if (el.id === neighbour.id) return { ...el, z: moved.z };
          return el;
        }),
      });
    },
    [commit, selectedId],
  );

  const setBackground = useCallback(
    (background: StoryDoc["background"]) => {
      commit({ ...docRef.current, background });
    },
    [commit],
  );

  return {
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
    canUndo: depth.past > 0,
    canRedo: depth.future > 0,
  };
}

function nextZ(doc: StoryDoc): number {
  return doc.elements.reduce((max, el) => Math.max(max, el.z), 0) + 1;
}

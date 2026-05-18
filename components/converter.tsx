"use client";

import { useState, useCallback, useRef } from "react";
import { loadFFmpeg, convertToWhatsApp } from "@/lib/ffmpeg";
import {
  IconUpload,
  IconPictures,
  IconVideo,
  IconConverting,
} from "@/components/icons";

type FileStatus = "pending" | "done" | "error";

type FileItem = {
  id: string;
  file: File;
  status: FileStatus;
  outputUrl?: string;
  outputName?: string;
  outputSize?: number;
  errorMsg?: string;
};

type Stage = "idle" | "ready" | "busy" | "complete";

function bytes(n: number): string {
  if (n < 1_000_000) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1_000_000).toFixed(1)} MB`;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export function Converter() {
  const [stage, setStage] = useState<Stage>("idle");
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalToConvert, setTotalToConvert] = useState(0);
  const [convertIdx, setConvertIdx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setItems((prev) => [
      ...prev,
      ...arr.map((file) => ({
        id: makeId(),
        file,
        status: "pending" as FileStatus,
      })),
    ]);
    setStage("ready");
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      if (next.length === 0) setStage("idle");
      return next;
    });
  }, []);

  const convertAll = useCallback(async () => {
    const toConvert = items
      .filter((i) => i.status === "pending")
      .map((i) => ({ id: i.id, file: i.file }));

    if (toConvert.length === 0) return;

    setStage("busy");
    setTotalToConvert(toConvert.length);

    await loadFFmpeg();

    for (let idx = 0; idx < toConvert.length; idx++) {
      const { id, file } = toConvert[idx];
      setCurrentItemId(id);
      setCurrentProgress(0);
      setConvertIdx(idx);

      try {
        const blob = await convertToWhatsApp(file, (progress) => {
          setCurrentProgress(progress);
        });

        const outputName = file.name.replace(/\.[^.]+$/, "") + "_whatsapp.mp4";
        const url = URL.createObjectURL(blob);

        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, status: "done", outputUrl: url, outputName, outputSize: blob.size }
              : i
          )
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                ...i,
                status: "error",
                errorMsg: err instanceof Error ? err.message : "erro desconhecido",
              }
              : i
          )
        );
      }
    }

    setCurrentItemId(null);
    setStage("complete");
  }, [items]);

  const reset = useCallback(() => {
    items.forEach((i) => {
      if (i.outputUrl) URL.revokeObjectURL(i.outputUrl);
    });
    setItems([]);
    setStage("idle");
    setCurrentItemId(null);
    setCurrentProgress(0);
    setConvertIdx(0);
  }, [items]);

  const currentItem = currentItemId ? items.find((i) => i.id === currentItemId) : null;

  return (
    <>
      {stage === "busy" && (
        <ConvertingOverlay
          filename={currentItem?.file.name ?? null}
          progress={currentProgress}
          current={convertIdx + 1}
          total={totalToConvert}
        />
      )}

      <div className="w-full max-w-md flex flex-col gap-3">
        {stage === "idle" && (
          <DropZone
            dragging={dragging}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onClick={() => inputRef.current?.click()}
          />
        )}

        {stage === "ready" && (
          <SmallDropZone
            dragging={dragging}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onClick={() => inputRef.current?.click()}
          />
        )}

        {items.length > 0 && (
          <div className="rounded-2xl border border-ink/10 bg-white/30 overflow-hidden">
            {items.map((item) => (
              <FileRow
                key={item.id}
                item={item}
                onRemove={stage === "ready" ? () => removeItem(item.id) : undefined}
              />
            ))}
          </div>
        )}

        {stage === "ready" && items.some((i) => i.status === "pending") && (
          <button
            type="button"
            onClick={convertAll}
            className="w-full bg-accent text-sec font-bold py-3 rounded-xl hover:bg-accent-hover transition-colors text-sm"
          >
            {items.length > 1
              ? `converter ${items.length} videos`
              : "converter o video"}
          </button>
        )}

        {stage === "complete" && (
          <button
            type="button"
            onClick={reset}
            className="text-ink/40 text-xs hover:text-ink/70 transition-colors text-center py-2"
          >
            converter mais
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}

function DropZone({
  dragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
}: {
  dragging: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        "w-full rounded-2xl border-2 border-dashed p-12",
        "flex flex-col items-center gap-4 transition-colors",
        "cursor-pointer select-none",
        dragging
          ? "border-accent bg-accent/5"
          : "border-ink/20 hover:border-accent/50 hover:bg-accent/5",
      ].join(" ")}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
    >
      <IconUpload size={64} />
      <div className="text-center">
        <p className="font-semibold text-ink">arraste os videos aqui</p>
        <p className="text-ink/50 text-sm mt-1">
          ou clica pra escolher (pode selecionar varios)
        </p>
      </div>
      <span className="text-xs text-ink/40 bg-ink/5 px-3 py-1 rounded-full">
        .avi e outros formatos
      </span>
    </button>
  );
}

function SmallDropZone({
  dragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
}: {
  dragging: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        "w-full rounded-xl border border-dashed p-3",
        "flex items-center gap-3 transition-colors cursor-pointer",
        dragging
          ? "border-accent bg-accent/5"
          : "border-ink/20 hover:border-accent/40 hover:bg-accent/5",
      ].join(" ")}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
    >
      <IconPictures size={24} />
      <p className="text-sm text-ink/50">clique aqui para adicionar mais videos</p>
    </button>
  );
}

function FileRow({
  item,
  onRemove,
}: {
  item: FileItem;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-ink/5 last:border-0">
      <IconVideo size={28} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">
          {item.status === "done" ? item.outputName : item.file.name}
        </p>
        <p className="text-xs text-ink/40 mt-0.5">
          {item.status === "done" && item.outputSize
            ? bytes(item.outputSize)
            : bytes(item.file.size)}
        </p>
        {item.status === "error" && (
          <p className="text-xs text-accent mt-0.5">{item.errorMsg}</p>
        )}
      </div>

      {item.status === "done" && item.outputUrl && item.outputName && (
        <a
          href={item.outputUrl}
          download={item.outputName}
          className="flex items-center gap-1 text-xs font-bold text-sec bg-accent px-3 py-1.5 rounded-lg hover:bg-accent-hover transition-colors shrink-0"
        >
          baixar
        </a>
      )}

      {onRemove && item.status === "pending" && (
        <button
          type="button"
          onClick={onRemove}
          className="text-ink/25 hover:text-accent transition-colors shrink-0 w-5 h-5 flex items-center justify-center rounded text-xs"
          aria-label="remover"
        >
          x
        </button>
      )}
    </div>
  );
}

function ConvertingOverlay({
  filename,
  progress,
  current,
  total,
}: {
  filename: string | null;
  progress: number;
  current: number;
  total: number;
}) {
  const pct = Math.round(progress * 100);
  const loading = filename === null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-xl bg-sec/85">
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <div className="animate-glow-pulse">
          <IconConverting size={96} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-extrabold text-ink text-2xl">so aguardar amor</p>
          <p className="text-ink/50 text-sm max-w-xs truncate">
            {loading ? "preparando..." : filename}
          </p>
          {!loading && <p className="text-accent font-extrabold text-4xl">{pct}%</p>}
          {total > 1 && (
            <p className="text-ink/35 text-xs">
              {current} de {total}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

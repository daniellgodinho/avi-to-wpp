"use client";

import { useState, useCallback, useRef } from "react";
import { loadFFmpeg, convertToWhatsApp } from "@/lib/ffmpeg";
import { IconUploadCloud, IconFilm, IconCheck, IconDownload } from "@/components/icons";

type State =
  | { phase: "idle" }
  | { phase: "selected"; file: File }
  | { phase: "loading" }
  | { phase: "converting"; progress: number }
  | { phase: "done"; url: string; filename: string; size: number }
  | { phase: "error"; message: string };

function bytes(n: number): string {
  if (n < 1_000_000) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1_000_000).toFixed(1)} MB`;
}

export function Converter() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = useCallback((file: File) => {
    setState({ phase: "selected", file });
  }, []);

  const convert = useCallback(async () => {
    if (state.phase !== "selected") return;
    const { file } = state;

    setState({ phase: "loading" });
    try {
      await loadFFmpeg();
      setState({ phase: "converting", progress: 0 });

      const blob = await convertToWhatsApp(file, (progress) => {
        setState({ phase: "converting", progress });
      });

      const filename = file.name.replace(/\.[^.]+$/, "") + "_whatsapp.mp4";
      setState({
        phase: "done",
        url: URL.createObjectURL(blob),
        filename,
        size: blob.size,
      });
    } catch (err) {
      setState({
        phase: "error",
        message:
          err instanceof Error ? err.message : "algo deu errado, tenta de novo",
      });
    }
  }, [state]);

  const reset = useCallback(() => {
    if (state.phase === "done") URL.revokeObjectURL(state.url);
    setState({ phase: "idle" });
  }, [state]);

  return (
    <div className="w-full max-w-md">
      {state.phase === "idle" && (
        <DropZone
          dragging={dragging}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) pick(f);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
        />
      )}

      {state.phase === "selected" && (
        <FileCard file={state.file} onConvert={convert} onReset={reset} />
      )}

      {state.phase === "loading" && <LoadingCard />}

      {state.phase === "converting" && (
        <ProgressCard progress={state.progress} />
      )}

      {state.phase === "done" && (
        <DoneCard
          url={state.url}
          filename={state.filename}
          size={state.size}
          onReset={reset}
        />
      )}

      {state.phase === "error" && (
        <ErrorCard message={state.message} onReset={reset} />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />
    </div>
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
      <IconUploadCloud size={64} />
      <div className="text-center">
        <p className="font-semibold text-ink">arraste o video aqui</p>
        <p className="text-ink/50 text-sm mt-1">ou clica pra escolher</p>
      </div>
      <span className="text-xs text-ink/40 bg-ink/5 px-3 py-1 rounded-full">
        .avi e outros formatos
      </span>
    </button>
  );
}

function FileCard({
  file,
  onConvert,
  onReset,
}: {
  file: File;
  onConvert: () => void;
  onReset: () => void;
}) {
  const large = file.size > 100 * 1024 * 1024;

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/30 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <IconFilm size={48} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink truncate text-sm">{file.name}</p>
          <p className="text-ink/50 text-xs mt-0.5">{bytes(file.size)}</p>
        </div>
      </div>

      {large && (
        <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          esse arquivo e grande e pode ficar acima do limite do Whatsapp depois de convertido
        </p>
      )}

      <button
        type="button"
        onClick={onConvert}
        className="w-full bg-accent text-sec font-bold py-3 rounded-xl hover:bg-accent-hover transition-colors text-sm"
      >
        converter para Whatsapp
      </button>

      <button
        type="button"
        onClick={onReset}
        className="text-ink/40 text-xs hover:text-ink/70 transition-colors text-center"
      >
        escolher outro arquivo
      </button>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/30 p-12 flex flex-col items-center gap-4">
      <svg className="animate-spin" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="16" stroke="#c1121f" strokeWidth="3" strokeOpacity="0.2" />
        <path
          d="M36 20C36 11.2 28.8 4 20 4"
          stroke="#c1121f"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-ink/50 text-sm">preparando o conversor...</p>
      <p className="text-ink/30 text-xs">isso so demora na primeira vez</p>
    </div>
  );
}

function ProgressCard({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100);
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/30 p-8 flex flex-col gap-5">
      <p className="font-semibold text-ink text-center">convertendo...</p>
      <div className="w-full bg-ink/10 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-accent h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-center text-accent font-extrabold text-2xl">{pct}%</p>
      <p className="text-center text-ink/35 text-xs">
        dependendo do tamanho, pode demorar um pouco
      </p>
    </div>
  );
}

function DoneCard({
  url,
  filename,
  size,
  onReset,
}: {
  url: string;
  filename: string;
  size: number;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/30 p-6 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 py-3">
        <IconCheck size={56} />
        <p className="font-bold text-ink text-lg">prontinho, amor!</p>
        <p className="text-ink/45 text-sm">{bytes(size)} convertido</p>
      </div>

      <a
        href={url}
        download={filename}
        className="w-full bg-accent text-sec font-bold py-3 rounded-xl hover:bg-accent-hover transition-colors text-center text-sm flex items-center justify-center gap-2"
      >
        <IconDownload size={18} />
        baixar o video
      </a>

      <button
        type="button"
        onClick={onReset}
        className="text-ink/40 text-xs hover:text-ink/70 transition-colors text-center"
      >
        converter outro
      </button>
    </div>
  );
}

function ErrorCard({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8 flex flex-col items-center gap-3">
      <p className="font-semibold text-accent">algo deu errado</p>
      <p className="text-ink/55 text-sm text-center">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="text-accent/70 text-sm hover:text-accent transition-colors underline underline-offset-2"
      >
        tentar de novo
      </button>
    </div>
  );
}

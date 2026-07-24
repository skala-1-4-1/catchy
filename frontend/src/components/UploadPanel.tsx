"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { UploadIcon } from "./icons";

interface UploadPanelProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function UploadPanel({ onUpload, isLoading }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  function validateAndUpload(file: File) {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setFileError("엑셀(.xlsx) 파일만 업로드할 수 있습니다.");
      return;
    }
    setFileError(null);
    onUpload(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (isLoading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) validateAndUpload(file);
    event.target.value = "";
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">
        리뷰 기반 의사결정 지원 서비스
      </h1>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!isLoading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`flex w-full max-w-xl flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-8 py-14 text-center transition-colors ${
          isDragging
            ? "border-zinc-400 bg-zinc-800/60"
            : "border-zinc-700 bg-zinc-800/30"
        } ${isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-zinc-500"}`}
      >
        <UploadIcon />
        <p className="text-sm text-zinc-200">
          엑셀(.xlsx) 리뷰 파일을 드래그하거나 클릭해서 업로드하세요
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
      {fileError && <p className="text-sm text-red-400">{fileError}</p>}
    </div>
  );
}

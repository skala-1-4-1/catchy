"use client";

import { FormEvent, useState } from "react";
import { PlusIcon, SendIcon } from "./icons";

interface ChatInputProps {
  onSend: (value: string) => void;
  isLoading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function ChatInput({
  onSend,
  isLoading,
  placeholder,
  autoFocus,
}: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-3 shadow-lg"
    >
      <button
        type="button"
        aria-label="첨부"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
      >
        <PlusIcon />
      </button>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder ?? "무엇이든 물어보세요"}
        autoFocus={autoFocus}
        disabled={isLoading}
        className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={!value.trim() || isLoading}
        aria-label="전송"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-colors disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
      >
        <SendIcon className="rotate-180" />
      </button>
    </form>
  );
}

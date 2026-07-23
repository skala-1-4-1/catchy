"use client";

import ChatInput from "./ChatInput";

interface LandingProps {
  onSend: (value: string) => void;
  isLoading: boolean;
}

export default function Landing({ onSend, isLoading }: LandingProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-12 px-6">
      <h1 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">
        이커머스 상품 리뷰 분석
      </h1>
      <div className="w-full max-w-2xl">
        <ChatInput
          onSend={onSend}
          isLoading={isLoading}
          autoFocus
          placeholder="분석하고 싶은 내용을 입력하세요"
        />
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

const ChatApp = dynamic(() => import("./ChatApp"), {
  ssr: false,
  loading: () => <div className="h-dvh bg-zinc-900" />,
});

export default function ChatAppLoader() {
  return <ChatApp />;
}

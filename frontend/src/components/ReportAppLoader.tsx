"use client";

import dynamic from "next/dynamic";

const ReportApp = dynamic(() => import("./ReportApp"), {
  ssr: false,
  loading: () => <div className="h-dvh bg-zinc-900" />,
});

export default function ReportAppLoader() {
  return <ReportApp />;
}

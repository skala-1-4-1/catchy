"use client";

import type { ReportSession } from "@/lib/reportStorage";
import { PlusIcon, SidebarToggleIcon, TrashIcon } from "./icons";
import Image from "next/image";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  sessions: ReportSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewUpload: () => void;
  onDeleteSession: (id: string) => void;
}

export default function Sidebar({
  collapsed,
  onToggleCollapsed,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewUpload,
  onDeleteSession,
}: SidebarProps) {
  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-3 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <Image
              src="/skala.png"
              alt="SKALA 로고"
              width={52}
              height={28}
              className="object-cover"
            />
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <SidebarToggleIcon />
        </button>
      </div>

      <div className="px-2">
        <button
          type="button"
          onClick={onNewUpload}
          className={
            collapsed
              ? "mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-100 hover:bg-zinc-800"
              : "flex w-full items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
          }
        >
          <PlusIcon />
          {!collapsed && <span>새 분석</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-20 flex-1 overflow-y-auto px-2 ">
          <p className="px-2 pb-1 text-sm font-medium text-zinc-500">
            분석 기록
          </p>
          <ul className="flex flex-col gap-0.5">
            {sessions.map((session) => (
              <li key={session.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className={`flex w-full items-center gap-2 truncate rounded-lg px-3 py-2 pr-8 text-left text-sm hover:bg-zinc-800 ${
                    session.id === activeSessionId
                      ? "bg-zinc-800 text-zinc-50"
                      : "text-zinc-300"
                  }`}
                >
                  {session.status === "analyzing" && (
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-400" />
                  )}
                  {session.status === "error" && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  )}
                  <span className="truncate">{session.title}</span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  aria-label="분석 기록 삭제"
                  className="absolute right-1 top-1/2 hidden -translate-y-1/2 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-100 group-hover:block"
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
            {sessions.length === 0 && (
              <li className="px-3 py-2 text-xs text-zinc-600">
                아직 분석 기록이 없습니다.
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-zinc-800 px-3 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-zinc-200">
          SK
        </div>
        {!collapsed && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm text-zinc-100">SKALA 사용자</span>
            <span className="truncate text-xs text-zinc-500">무료 플랜</span>
          </div>
        )}
      </div>
    </aside>
  );
}

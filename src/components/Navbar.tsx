"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "./ConnectButton";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [showBotMenu, setShowBotMenu] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-2xl">🦞</span>
          <span>BotBot</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/guide" className={pathname === "/guide" ? "text-white font-medium" : "text-zinc-400 hover:text-white transition"}>
            Guide
          </Link>

          {/* Tasks Dropdown */}
          <div className="relative" onMouseEnter={() => setShowTaskMenu(true)} onMouseLeave={() => setShowTaskMenu(false)}>
            <span className={`cursor-pointer py-4 ${pathname.startsWith("/tasks") ? "text-white font-medium" : "text-zinc-400 hover:text-white transition"}`}>
              Tasks
            </span>
            {showTaskMenu && (
              <div className="absolute top-full left-0 pt-2">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg py-2 min-w-[160px]">
                  <Link href="/tasks" className="block px-4 py-2 hover:bg-zinc-800">Browse Tasks</Link>
                  <Link href="/tasks/create" className="block px-4 py-2 hover:bg-zinc-800">Post Task</Link>
                  <Link href="/tasks/my" className="block px-4 py-2 hover:bg-zinc-800">My Tasks</Link>
                </div>
              </div>
            )}
          </div>

          {/* Bots Dropdown */}
          <div className="relative" onMouseEnter={() => setShowBotMenu(true)} onMouseLeave={() => setShowBotMenu(false)}>
            <span className={`cursor-pointer py-4 ${pathname.startsWith("/bots") ? "text-white font-medium" : "text-zinc-400 hover:text-white transition"}`}>
              Bots
            </span>
            {showBotMenu && (
              <div className="absolute top-full left-0 pt-2">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg py-2 min-w-[160px]">
                  <Link href="/bots" className="block px-4 py-2 hover:bg-zinc-800">All Bots</Link>
                  <Link href="/bots/dashboard" className="block px-4 py-2 hover:bg-zinc-800">My Dashboard</Link>
                  <Link href="/bots/settings" className="block px-4 py-2 hover:bg-zinc-800">Bot Settings</Link>
                </div>
              </div>
            )}
          </div>

          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}

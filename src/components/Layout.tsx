import React from "react";
import { Navbar } from "./Navbar";
import { Ticker } from "./Ticker";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      <Navbar />
      <main className="pt-20 pb-12">{children}</main>
      <Ticker />
    </div>
  );
}

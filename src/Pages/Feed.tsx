import { NEW_LAUNCHES, LIVE_ACTIVITY } from "@/lib/data";
import {
  ExternalLink,
  TrendingUp,
  Activity,
  Radio,
  TerminalSquare,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function FeedPage() {
  // Staggered animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="relative min-h-screen bg-black text-zinc-50 font-sans selection:bg-indigo-500/30 pb-12">
      {/* Ambient Terminal Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 h-[calc(100vh-80px)] flex flex-col">
        {/* News Ticker - Infinite Marquee */}
        <div className="relative overflow-hidden bg-zinc-950 border border-zinc-800/80 rounded-2xl mb-8 shadow-lg flex items-center">
          <div className="absolute left-0 z-20 bg-zinc-950/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-r border-zinc-800">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </div>
            <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">
              Network
            </span>
            <div className="w-8 h-[1px] bg-gradient-to-r from-zinc-700 to-transparent ml-2 hidden sm:block" />
          </div>

          <div className="flex-1 overflow-hidden relative pl-32 sm:pl-48 py-3 mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="flex whitespace-nowrap gap-8 text-sm text-zinc-400"
            >
              <span>Monad Testnet hits 1M transactions</span>
              <span className="text-zinc-600">•</span>
              <span>Bitcoin breaks $100k barrier</span>
              <span className="text-zinc-600">•</span>
              <span className="text-indigo-400">
                New memecoin meta emerging on nad.fun
              </span>
              <span className="text-zinc-600">•</span>
              <span>Vitalik tweets about AI Agents</span>
              <span className="text-zinc-600">•</span>
              {/* Duplicated for seamless loop */}
              <span>Monad Testnet hits 1M transactions</span>
              <span className="text-zinc-600">•</span>
              <span>Bitcoin breaks $100k barrier</span>
              <span className="text-zinc-600">•</span>
              <span className="text-indigo-400">
                New memecoin meta emerging on nad.fun
              </span>
            </motion.div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0 pb-6">
          {/* Left: New Launches */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/20">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5 text-zinc-100">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                nad.fun Launches
              </h2>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-400">
                  Live Socket
                </span>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-1.5"
              >
                {[...NEW_LAUNCHES, ...NEW_LAUNCHES].map((launch, idx) => (
                  <motion.div
                    key={`${launch.id}-${idx}`}
                    variants={itemVariants}
                    className="group flex flex-col gap-3 bg-zinc-900/30 border border-transparent hover:border-zinc-800 rounded-2xl p-4 transition-all hover:bg-zinc-900/60 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-300 ring-1 ring-white/5 group-hover:scale-105 transition-transform">
                          {launch.ticker}
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors">
                            {launch.name}
                          </h3>
                          <div className="text-xs text-zinc-500 font-mono mt-0.5">
                            {launch.time}
                          </div>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs mt-1">
                      <div className="text-zinc-500 uppercase tracking-wider text-[10px]">
                        Liq:{" "}
                        <span className="text-zinc-300 font-mono text-xs ml-1">
                          {launch.liquidity}
                        </span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-zinc-700" />
                      <div className="flex items-center gap-1.5 text-zinc-500 uppercase tracking-wider text-[10px]">
                        Risk:
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-md font-medium",
                            launch.risk === "Low"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : launch.risk === "Medium"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-rose-500/10 text-rose-400",
                          )}
                        >
                          {launch.risk}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right: Agent Activity */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/20">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5 text-zinc-100">
                <TerminalSquare className="w-5 h-5 text-emerald-400" />
                Agent Terminal
              </h2>
            </div>

            <div className="overflow-y-auto flex-1 p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="relative"
              >
                {/* Timeline connector line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-zinc-800/50" />

                {[...LIVE_ACTIVITY, ...LIVE_ACTIVITY].map((activity, i) => (
                  <motion.div
                    key={`act-${i}`}
                    variants={itemVariants}
                    className="relative flex items-start gap-4 p-3 hover:bg-zinc-900/40 rounded-xl transition-colors group"
                  >
                    <div className="relative mt-1.5 shrink-0 z-10">
                      <div
                        className={cn(
                          "w-[14px] h-[14px] rounded-full border-2 border-zinc-950 shadow-sm",
                          activity.type === "SNIPE"
                            ? "bg-emerald-500"
                            : activity.type === "LAUNCH"
                              ? "bg-indigo-500"
                              : "bg-cyan-500",
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm text-zinc-200 truncate pr-2">
                          {activity.agent}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono shrink-0">
                          {activity.time}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] uppercase tracking-wider text-zinc-500">
                          Exec
                        </span>
                        <span
                          className={cn(
                            "font-mono text-xs px-1.5 py-0.5 rounded border",
                            activity.type === "SNIPE"
                              ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/20"
                              : activity.type === "LAUNCH"
                                ? "text-indigo-400 bg-indigo-500/5 border-indigo-500/20"
                                : "text-cyan-400 bg-cyan-500/5 border-cyan-500/20",
                          )}
                        >
                          {activity.type}
                        </span>
                        <span className="text-zinc-600">→</span>
                        <span className="text-zinc-300 font-medium">
                          {activity.coin}
                        </span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "font-mono text-sm mt-1 shrink-0 px-2 py-1 rounded-lg",
                        activity.profit.startsWith("+")
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-zinc-500 bg-zinc-900",
                      )}
                    >
                      {activity.profit}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ExternalLink, TrendingUp, Activity, Radio, TerminalSquare } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { useFeed } from "@/hooks/useFeed";
import { useQuery } from "@tanstack/react-query";
import { getFeedLogs } from "@/lib/api";
import { riskLabel, timeAgo, type LaunchFeedEvent } from "@/types";

export function FeedPage() {
  const { launches, agentActions, news, connected } = useFeed();

  // Seed with historical logs on first load
  const { data: historicalLogs = [] } = useQuery({
    queryKey: ["feed-logs"],
    queryFn: getFeedLogs,
  });

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants: Variants = { hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } };

  // News ticker: real headlines or fallback
  const tickerItems = news.length > 0
    ? news.map((n) => n.headline)
    : ["Waiting for live news feed…", "Monad Testnet is live", "nad.fun agent launcher active"];

  return (
    <div className="relative min-h-screen bg-black text-zinc-50 font-sans selection:bg-indigo-500/30 pb-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 h-[calc(100vh-80px)] flex flex-col">

        {/* News Ticker */}
        <div className="relative overflow-hidden bg-zinc-950 border border-zinc-800/80 rounded-2xl mb-8 shadow-lg flex items-center">
          <div className="absolute left-0 z-20 bg-zinc-950/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-r border-zinc-800">
            <div className="relative flex h-2 w-2">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                connected ? "bg-indigo-400" : "bg-zinc-500"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                connected ? "bg-indigo-500" : "bg-zinc-600"
              )} />
            </div>
            <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">Network</span>
          </div>

          <div className="flex-1 overflow-hidden relative pl-32 sm:pl-48 py-3">
            <motion.div
              animate={{ x: [0, -1200] }}
              transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
              className="flex whitespace-nowrap gap-8 text-sm text-zinc-400"
            >
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} className={i % 3 === 1 ? "text-indigo-400" : ""}>{item}</span>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0 pb-6">

          {/* Left: nad.fun Launches */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/20">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5 text-zinc-100">
                <TrendingUp className="w-5 h-5 text-indigo-400" /> nad.fun Launches
              </h2>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <Radio className={cn("w-3 h-3", connected ? "text-emerald-400 animate-pulse" : "text-zinc-600")} />
                <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-400">
                  {connected ? "Live Socket" : "Connecting..."}
                </span>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
              {launches.length === 0 && (
                <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
                  Waiting for new launches…
                </div>
              )}
              <motion.div variants={listVariants} initial="hidden" animate="visible" className="flex flex-col gap-1.5">
                {launches.map((launch, idx) => (
                  <LaunchCard key={`${launch.token}-${idx}`} launch={launch} itemVariants={itemVariants} />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right: Agent Terminal */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/20">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2.5 text-zinc-100">
                <TerminalSquare className="w-5 h-5 text-emerald-400" /> Agent Terminal
              </h2>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <Activity className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-400">
                  {agentActions.length + historicalLogs.length} events
                </span>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
              <motion.div variants={listVariants} initial="hidden" animate="visible" className="relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-zinc-800/50" />

                {/* Live WS events */}
                {agentActions.map((act, i) => (
                  <ActivityRow
                    key={`ws-${i}`}
                    type={inferType(act.action)}
                    agent={act.agent_id.slice(0, 8)}
                    action={act.action}
                    txHash={act.tx_hash}
                    time="just now"
                    itemVariants={itemVariants}
                  />
                ))}

                {/* Historical logs */}
                {historicalLogs.map((log) => (
                  <ActivityRow
                    key={log.id}
                    type={inferType(log.action)}
                    agent={log.agent?.name ?? log.agentId.slice(0, 8)}
                    action={log.action}
                    txHash={log.txHash ?? undefined}
                    time={timeAgo(log.createdAt)}
                    itemVariants={itemVariants}
                  />
                ))}

                {agentActions.length === 0 && historicalLogs.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
                    No agent activity yet…
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LaunchCard({ launch, itemVariants }: { launch: LaunchFeedEvent; itemVariants: Variants }) {
  const risk = riskLabel(launch.riskScore);
  return (
    <motion.div
      variants={itemVariants}
      className="group flex flex-col gap-3 bg-zinc-900/30 border border-transparent hover:border-zinc-800 rounded-2xl p-4 transition-all hover:bg-zinc-900/60 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-300 ring-1 ring-white/5 group-hover:scale-105 transition-transform">
            {launch.symbol.slice(0, 4)}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors">
              {launch.name}
            </h3>
            <div className="text-xs text-zinc-500 font-mono mt-0.5">
              {launch.token.slice(0, 6)}…{launch.token.slice(-4)}
            </div>
          </div>
        </div>
        <a
          href={`https://testnet.monadexplorer.com/tx/${launch.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </a>
      </div>

      <div className="flex items-center gap-4 text-xs mt-1">
        <div className="text-zinc-500 uppercase tracking-wider text-[10px]">
          Liquidity:{" "}
          <span className="text-zinc-300 font-mono text-xs ml-1">
            {parseFloat(launch.virtualMonReserve).toFixed(2)} MON
          </span>
        </div>
        <div className="w-1 h-1 rounded-full bg-zinc-700" />
        <div className="flex items-center gap-1.5 text-zinc-500 uppercase tracking-wider text-[10px]">
          Risk:
          <span className={cn(
            "px-1.5 py-0.5 rounded-md font-medium",
            risk === "Low" ? "bg-emerald-500/10 text-emerald-400"
              : risk === "Medium" ? "bg-amber-500/10 text-amber-400"
              : "bg-rose-500/10 text-rose-400"
          )}>
            {risk}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityRow({
  type, agent, action, txHash, time, itemVariants,
}: {
  type: string; agent: string; action: string; txHash?: string; time: string; itemVariants: Variants;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative flex items-start gap-4 p-3 hover:bg-zinc-900/40 rounded-xl transition-colors group"
    >
      <div className="relative mt-1.5 shrink-0 z-10">
        <div className={cn(
          "w-[14px] h-[14px] rounded-full border-2 border-zinc-950 shadow-sm",
          type === "SNIPE" ? "bg-emerald-500" : type === "LAUNCH" ? "bg-indigo-500" : "bg-cyan-500"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-sm text-zinc-200 truncate pr-2">{agent}</span>
          <span className="text-[11px] text-zinc-500 font-mono shrink-0">{time}</span>
        </div>
        <div className="text-sm text-zinc-400 flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            "font-mono text-xs px-1.5 py-0.5 rounded border",
            type === "SNIPE" ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/20"
              : type === "LAUNCH" ? "text-indigo-400 bg-indigo-500/5 border-indigo-500/20"
              : "text-cyan-400 bg-cyan-500/5 border-cyan-500/20"
          )}>
            {type}
          </span>
          <span className="text-zinc-500 text-xs truncate">{action.slice(0, 60)}</span>
        </div>
        {txHash && (
          <a
            href={`https://testnet.monadexplorer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-zinc-600 hover:text-indigo-400 transition-colors mt-0.5 block"
          >
            {txHash.slice(0, 10)}…
          </a>
        )}
      </div>
    </motion.div>
  );
}

function inferType(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("snip")) return "SNIPE";
  if (a.includes("launch") || a.includes("create")) return "LAUNCH";
  if (a.includes("bundle")) return "BUNDLE";
  if (a.includes("sell") || a.includes("exit")) return "EXIT";
  return "EXEC";
}

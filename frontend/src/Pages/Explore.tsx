import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Play, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAgents } from "@/lib/api";
import { cn } from "@/lib/utils";
import { displayCategory, displayStatus, type BackendAgent } from "@/types";

export function ExplorePage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents", filter],
    queryFn: () => getAgents({ category: filter }),
    refetchInterval: 30_000,
  });

  const filtered = agents.filter((a) =>
    search
      ? a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 20 } },
  };

  return (
    <div className="relative min-h-screen bg-black text-zinc-50 font-sans selection:bg-indigo-500/30 pb-24">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Explore Agents
            </h1>
            <p className="text-zinc-400 text-lg">
              Discover and deploy high-performance trading architecture.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
              />
            </div>
            <button className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-full hover:bg-zinc-800 hover:text-white text-zinc-400 transition-all backdrop-blur-sm">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Filter Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide"
        >
          {["All", "Sniper", "Bundler", "Launcher", "Custom"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                filter === cat
                  ? "bg-white text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                  : "bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-24 text-zinc-500">
            <p className="text-lg">No agents found.</p>
            <p className="text-sm mt-2">Be the first to deploy one.</p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((agent) => (
              <motion.div key={agent.id} variants={itemVariants} className="h-full">
                <AgentCard agent={agent} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

const AgentCard: React.FC<{ agent: BackendAgent }> = ({ agent }) => {
  const status = displayStatus(agent.status);
  return (
    <Link to={`/agent/${agent.id}`} className="block h-full">
      <div className="group relative bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl hover:shadow-indigo-500/10 h-full flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none from-indigo-500/[0.03] to-transparent" />

        <div className="relative z-10 flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-300 font-bold ring-1 ring-white/10 group-hover:ring-indigo-500/30 transition-all">
              {agent.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-zinc-100 group-hover:text-indigo-400 transition-colors tracking-tight">
                {agent.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md text-zinc-300">
                  {displayCategory(agent.category)}
                </span>
                <span>•</span>
                <span>by {agent.ownerWallet.slice(0, 6)}…{agent.ownerWallet.slice(-4)}</span>
              </div>
            </div>
          </div>

          <div className="relative flex h-2.5 w-2.5 mt-1.5">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              agent.status === "RUNNING" ? "bg-emerald-400" : agent.status === "PAUSED" ? "bg-amber-400" : "bg-zinc-500"
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2.5 w-2.5",
              agent.status === "RUNNING" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : agent.status === "PAUSED" ? "bg-amber-500" : "bg-zinc-600"
            )} />
          </div>
        </div>

        <p className="text-zinc-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow relative z-10">
          {agent.description}
        </p>

        <div className="relative z-10 grid grid-cols-3 gap-4 py-4 border-t border-zinc-800/50 mb-4 bg-zinc-950/50 rounded-b-xl">
          <div>
            <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Runs</div>
            <div className="font-mono text-sm text-zinc-200">{agent.runCount.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Status</div>
            <div className="font-mono text-sm text-zinc-200">{status}</div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Wallet</div>
            <div className="font-mono text-sm text-zinc-200">
              {agent.wallet ? `${parseFloat(agent.wallet.balanceMon).toFixed(2)} MON` : "—"}
            </div>
          </div>
        </div>

        <button className="relative z-10 w-full py-3 bg-zinc-900 text-zinc-300 rounded-xl font-medium text-sm border border-zinc-800 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300 flex items-center justify-center gap-2">
          <Play className="w-4 h-4 fill-current" />
          <span>Deploy Agent</span>
          <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
        </button>
      </div>
    </Link>
  );
};

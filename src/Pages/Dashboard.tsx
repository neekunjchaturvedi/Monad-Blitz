import { AGENTS } from "@/lib/data";
import {
  Power,
  Trash2,
  Wallet,
  ExternalLink,
  Activity,
  ArrowUpRight,
  Copy,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  // Mock user agents - subset of AGENTS
  const myAgents = AGENTS.slice(0, 2);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 20 },
    },
  };

  return (
    <div className="relative min-h-screen bg-black text-zinc-50 font-sans selection:bg-indigo-500/30 pb-24">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Command Center
          </h1>
          <p className="text-zinc-400 text-lg mb-10">
            Monitor portfolio performance and manage your active deployments.
          </p>
        </motion.div>

        {/* Summary Stats - Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {/* Primary Stat Card */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-zinc-950 to-zinc-950 border border-indigo-500/20 rounded-3xl p-7 shadow-[0_0_40px_-15px_rgba(99,102,241,0.2)] group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <Wallet className="w-24 h-24 text-indigo-400 blur-xl" />
            </div>
            <div className="relative z-10">
              <div className="text-[11px] font-medium text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                Total Balance
              </div>
              <div className="text-4xl md:text-5xl font-mono font-semibold tracking-tighter text-white mb-2">
                142.5 <span className="text-indigo-400/70 text-3xl">MON</span>
              </div>
              <div className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                ≈ $24,500{" "}
                <span className="text-zinc-500 text-xs ml-1 font-normal">
                  USD
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-7 flex flex-col justify-center"
          >
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Active Agents
            </div>
            <div className="text-4xl md:text-5xl font-mono font-semibold tracking-tighter text-zinc-100">
              2
            </div>
            <div className="text-zinc-500 text-sm mt-2">
              Currently deployed on-chain
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-7 flex flex-col justify-center"
          >
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Total
              Profit (24h)
            </div>
            <div className="text-4xl md:text-5xl font-mono font-semibold tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              +12.4%
            </div>
            <div className="text-emerald-500/70 text-sm mt-2 font-mono">
              +17.67 MON
            </div>
          </motion.div>
        </motion.div>

        {/* My Agents Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Active Deployments
            </h2>
            <div className="text-sm text-zinc-500 font-mono">
              {myAgents.length} Running
            </div>
          </div>

          <div className="space-y-4">
            {myAgents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="group bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Info Col */}
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-zinc-300 font-bold tracking-wider shadow-inner group-hover:border-indigo-500/30 transition-colors">
                    {agent.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-100 text-lg tracking-tight mb-1">
                      {agent.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 flex items-center gap-1.5 hover:text-zinc-300 hover:border-zinc-600 cursor-pointer transition-colors">
                        0x71C...9A2 <Copy className="w-3 h-3" />
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 cursor-pointer hover:text-zinc-300 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Stats Col */}
                <div className="flex items-center gap-8 w-full lg:w-auto lg:px-8 border-y lg:border-y-0 lg:border-x border-zinc-800/50 py-4 lg:py-0 justify-between lg:justify-start">
                  <div className="text-left">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                      Wallet Bal
                    </div>
                    <div className="font-mono text-sm text-zinc-200">
                      4.2 <span className="text-zinc-500">MON</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                      Status
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      </span>
                      <span className="text-emerald-400 font-medium text-sm tracking-wide">
                        Running
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Col */}
                <div className="flex items-center gap-2.5 w-full lg:w-auto">
                  <button className="flex-1 lg:flex-none px-5 py-2.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-xl hover:bg-white hover:text-black hover:border-white transition-all text-sm font-medium flex items-center justify-center gap-2">
                    <Wallet className="w-4 h-4" /> Fund
                  </button>
                  <button
                    className="p-2.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                    title="Pause Agent"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                    title="Terminate Agent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

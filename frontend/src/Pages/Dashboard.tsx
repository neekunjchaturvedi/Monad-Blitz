import { useState } from "react";
import { Power, Trash2, Wallet, ExternalLink, Activity, ArrowUpRight, Copy, Loader2, Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyAgents, setAgentStatus, deleteAgent } from "@/lib/api";
import { displayStatus, type BackendAgent } from "@/types";

export function DashboardPage() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { data: myAgents = [], isLoading } = useQuery({
    queryKey: ["my-agents", address],
    queryFn: () => getMyAgents(address!),
    enabled: !!address,
    refetchInterval: 15_000,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "RUNNING" | "PAUSED" }) =>
      setAgentStatus(id, status, address!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-agents", address] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAgent(id, address!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-agents", address] }),
  });

  const runningCount = myAgents.filter((a) => a.status === "RUNNING").length;
  const totalBalance = myAgents.reduce(
    (sum, a) => sum + parseFloat(a.wallet?.balanceMon ?? "0"),
    0
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 20 } },
  };

  return (
    <div className="relative min-h-screen bg-black text-zinc-50 font-sans selection:bg-indigo-500/30 pb-24">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Command Center
          </h1>
          <p className="text-zinc-400 text-lg mb-10">
            Monitor portfolio performance and manage your active deployments.
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-zinc-950 to-zinc-950 border border-indigo-500/20 rounded-3xl p-7 shadow-[0_0_40px_-15px_rgba(99,102,241,0.2)] group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <Wallet className="w-24 h-24 text-indigo-400 blur-xl" />
            </div>
            <div className="relative z-10">
              <div className="text-[11px] font-medium text-indigo-300 uppercase tracking-widest mb-3">
                Total Agent Balances
              </div>
              <div className="text-4xl md:text-5xl font-mono font-semibold tracking-tighter text-white mb-2">
                {totalBalance.toFixed(2)}{" "}
                <span className="text-indigo-400/70 text-3xl">MON</span>
              </div>
              <div className="text-zinc-500 text-sm">Across all agent wallets</div>
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
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-indigo-400" /> : runningCount}
            </div>
            <div className="text-zinc-500 text-sm mt-2">of {myAgents.length} deployed</div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-7 flex flex-col justify-center"
          >
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Total Runs
            </div>
            <div className="text-4xl md:text-5xl font-mono font-semibold tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              {myAgents.reduce((sum, a) => sum + a.runCount, 0).toLocaleString()}
            </div>
            <div className="text-emerald-500/70 text-sm mt-2 font-mono">executions total</div>
          </motion.div>
        </motion.div>

        {/* Not connected */}
        {!address && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg">Connect your wallet to see your agents.</p>
          </div>
        )}

        {/* Agent List */}
        {address && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                Active Deployments
              </h2>
              <div className="text-sm text-zinc-500 font-mono">{runningCount} Running</div>
            </div>

            {isLoading && (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            )}

            {!isLoading && myAgents.length === 0 && (
              <div className="text-center py-16 text-zinc-500">
                <p>No agents deployed yet.</p>
              </div>
            )}

            <div className="space-y-4">
              {myAgents.map((agent, i) => (
                <AgentRow
                  key={agent.id}
                  agent={agent}
                  index={i}
                  onToggle={() =>
                    toggleMutation.mutate({
                      id: agent.id,
                      status: agent.status === "RUNNING" ? "PAUSED" : "RUNNING",
                    })
                  }
                  onDelete={() => deleteMutation.mutate(agent.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function AgentRow({
  agent,
  index,
  onToggle,
  onDelete,
}: {
  agent: BackendAgent;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const walletAddr = agent.wallet?.address ?? "";
  const short = walletAddr ? `${walletAddr.slice(0, 6)}…${walletAddr.slice(-4)}` : "—";

  function copyAddr() {
    if (!walletAddr) return;
    navigator.clipboard.writeText(walletAddr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1 }}
      className="group bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
    >
      {/* Info */}
      <div className="flex items-center gap-4 w-full lg:w-auto">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-zinc-300 font-bold tracking-wider shadow-inner group-hover:border-indigo-500/30 transition-colors">
          {agent.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100 text-lg tracking-tight mb-1">{agent.name}</h3>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <button
              onClick={copyAddr}
              className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 flex items-center gap-1.5 hover:text-zinc-300 hover:border-zinc-600 cursor-pointer transition-colors"
            >
              {short}
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            {walletAddr && (
              <a
                href={`https://testnet.monadexplorer.com/address/${walletAddr}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5 cursor-pointer hover:text-zinc-300 transition-colors" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 w-full lg:w-auto lg:px-8 border-y lg:border-y-0 lg:border-x border-zinc-800/50 py-4 lg:py-0 justify-between lg:justify-start">
        <div className="text-left">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Wallet Bal</div>
          <div className="font-mono text-sm text-zinc-200">
            {parseFloat(agent.wallet?.balanceMon ?? "0").toFixed(3)}{" "}
            <span className="text-zinc-500">MON</span>
          </div>
        </div>
        <div className="text-left">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Status</div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                agent.status === "RUNNING" ? "bg-emerald-400" : "bg-zinc-500"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                agent.status === "RUNNING" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-600"
              )} />
            </span>
            <span className={cn(
              "font-medium text-sm tracking-wide",
              agent.status === "RUNNING" ? "text-emerald-400" : "text-zinc-400"
            )}>
              {displayStatus(agent.status)}
            </span>
          </div>
        </div>
        <div className="text-left">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Runs</div>
          <div className="font-mono text-sm text-zinc-200">{agent.runCount.toLocaleString()}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 w-full lg:w-auto">
        <button
          onClick={onToggle}
          className={cn(
            "p-2.5 border rounded-xl transition-all",
            agent.status === "RUNNING"
              ? "bg-zinc-900 text-amber-400 border-zinc-800 hover:bg-amber-500/10 hover:border-amber-500/30"
              : "bg-zinc-900 text-emerald-400 border-zinc-800 hover:bg-emerald-500/10 hover:border-emerald-500/30"
          )}
          title={agent.status === "RUNNING" ? "Pause Agent" : "Start Agent"}
        >
          <Power className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all"
          title="Terminate Agent"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

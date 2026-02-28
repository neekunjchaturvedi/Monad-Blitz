import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Settings, Activity, Terminal, AlertTriangle, Rocket, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount, useWriteContract } from "wagmi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAgent, getAgentLogs, createAgent } from "@/lib/api";
import { displayCategory, displayStatus, timeAgo, type AgentCategory } from "@/types";
import { REGISTRY_ADDRESS, REGISTRY_ABI, CATEGORY_TO_UINT } from "@/lib/registry";

const LOGIC_MAP: Record<string, string[]> = {
  sniper: [
    "Listens to nad.fun CurveStream for Create events",
    "Runs risk score check (liquidity, metadata, creator age)",
    "Executes block-0 buy via agent wallet",
    "Auto-sells at configured take-profit or stop-loss",
  ],
  bundler: [
    "Accepts a target token and trigger source",
    "Splits buy across multiple sequential nonces",
    "Lands buys in same block window on Monad",
    "Reports success/fail per wallet slot",
  ],
  launcher: [
    "Monitors live news feed for configured keywords",
    "Derives token name and symbol from headline",
    "Calls nad.fun createToken with initial liquidity buy",
    "Enforces cooldown to prevent spam launches",
  ],
  custom: [
    "Custom logic defined by the agent creator",
    "Runs on AgentHub's off-chain worker network",
    "Full access to Monad RPC and nad.fun SDK",
  ],
};

export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();

  // Config state for deployment
  const [buyAmount, setBuyAmount] = useState("0.1");
  const [stopLoss, setStopLoss] = useState("15");
  const [takeProfit, setTakeProfit] = useState("50");
  const [maxRisk, setMaxRisk] = useState("60");
  const [deployed, setDeployed] = useState<{ id: string; wallet: string } | null>(null);

  const { data: agent, isLoading } = useQuery({
    queryKey: ["agent", id],
    queryFn: () => getAgent(id!),
    enabled: !!id,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["agent-logs", id],
    queryFn: () => getAgentLogs(id!),
    enabled: !!id,
    refetchInterval: 10_000,
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      if (!agent || !address) throw new Error("Not connected");

      // Step 1 — on-chain registration
      const txHash = await writeContractAsync({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: "registerAgent",
        args: [`${agent.name} (My Instance)`, CATEGORY_TO_UINT[agent.category], false],
      });

      // Step 2 — backend record + wallet creation
      return createAgent(
        {
          name: `${agent.name} (My Instance)`,
          description: agent.description,
          category: agent.category as AgentCategory,
          is_public: false,
          config: {
            buy_amount_mon: buyAmount,
            stop_loss_pct: parseFloat(stopLoss),
            take_profit_pct: parseFloat(takeProfit),
            max_risk_score: parseFloat(maxRisk),
            registry_tx: txHash,
          },
        },
        address
      );
    },
    onSuccess: (data) => {
      setDeployed({ id: data.id, wallet: data.wallet_address });
      queryClient.invalidateQueries({ queryKey: ["my-agents"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-zinc-400">
        <p>Agent not found.</p>
        <Link to="/explore" className="text-indigo-400 hover:underline">← Back to Explore</Link>
      </div>
    );
  }

  const logic = LOGIC_MAP[agent.category] ?? LOGIC_MAP.custom;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-24">
      <Link to="/explore" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-2xl font-bold">
                  {agent.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/20">
                      {displayCategory(agent.category)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      Created {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  agent.status === "RUNNING" ? "bg-green-500 animate-pulse" : "bg-zinc-600"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  agent.status === "RUNNING" ? "text-green-400" : "text-zinc-500"
                )}>
                  {displayStatus(agent.status)}
                </span>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-8">{agent.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Total Runs" value={agent.runCount.toLocaleString()} />
              <StatBox label="Category" value={displayCategory(agent.category)} />
              <StatBox label="Wallet Bal"
                value={agent.wallet ? `${parseFloat(agent.wallet.balanceMon).toFixed(3)} MON` : "—"} />
              <StatBox label="Visibility" value={agent.isPublic ? "Public" : "Private"} />
            </div>
          </div>

          {/* Logic & Config */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-gray-400" /> Agent Logic
              </h3>
              <ul className="space-y-3">
                {logic.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" /> Deploy Configuration
              </h3>
              <div className="space-y-4">
                <ConfigInput label="Buy Amount (MON)" value={buyAmount} onChange={setBuyAmount} type="number" />
                <ConfigInput label="Stop Loss (%)" value={stopLoss} onChange={setStopLoss} type="number" />
                <ConfigInput label="Take Profit (%)" value={takeProfit} onChange={setTakeProfit} type="number" />
                <ConfigInput label="Max Risk Score (0–100)" value={maxRisk} onChange={setMaxRisk} type="number" />
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sticky top-24">
            <h3 className="text-lg font-bold mb-4">Deploy Instance</h3>

            {deployed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-300 font-medium mb-1">Agent deployed!</p>
                    <p className="text-xs text-emerald-400/70 font-mono break-all">
                      Wallet: {deployed.wallet}
                    </p>
                    <Link
                      to="/dashboard"
                      className="text-xs text-indigo-400 hover:underline mt-2 block"
                    >
                      Go to Dashboard →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                    <p className="text-xs text-yellow-200/80">
                      Deploying creates a dedicated wallet. Fund it with MON before starting the agent.
                    </p>
                  </div>
                </div>

                {!address && (
                  <p className="text-xs text-zinc-500 text-center mb-4">
                    Connect your wallet to deploy.
                  </p>
                )}

                <button
                  onClick={() => deployMutation.mutate()}
                  disabled={!address || deployMutation.isPending}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deployMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Rocket className="w-5 h-5" />
                  )}
                  {deployMutation.isPending ? "Deploying…" : "Deploy Now"}
                </button>

                {deployMutation.isError && (
                  <p className="text-xs text-rose-400 text-center">
                    {(deployMutation.error as Error).message}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" /> Recent Activity
            </h3>
            {logs.length === 0 && (
              <p className="text-zinc-600 text-sm text-center py-4">No activity yet.</p>
            )}
            <div className="space-y-4">
              {logs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded",
                      log.result === "success" ? "bg-green-500/20 text-green-400"
                        : log.result === "partial" ? "bg-amber-500/20 text-amber-400"
                        : "bg-rose-500/20 text-rose-400"
                    )}>
                      {log.result.toUpperCase()}
                    </span>
                    <span className="text-zinc-300 text-xs truncate max-w-[140px]">{log.action}</span>
                  </div>
                  <div className="text-right shrink-0">
                    {log.txHash && (
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${log.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-indigo-400 hover:underline"
                      >
                        {log.txHash.slice(0, 8)}…
                      </a>
                    )}
                    <div className="text-xs text-gray-600">{timeAgo(log.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={cn("text-xl font-mono font-bold", color)}>{value}</div>
    </div>
  );
}

function ConfigInput({ label, value, onChange, type }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 transition-colors"
      />
    </div>
  );
}

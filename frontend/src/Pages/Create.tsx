import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Code, Zap, Layers, Radio, Lock, Globe, Settings2, Terminal, ChevronRight, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount, useWriteContract } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAgent } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import type { AgentCategory } from "@/types";
import { REGISTRY_ADDRESS, REGISTRY_ABI, CATEGORY_TO_UINT } from "@/lib/registry";

export function CreateAgentPage() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Contract interaction
  const { writeContractAsync } = useWriteContract();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AgentCategory>("sniper");
  const [visibility, setVisibility] = useState<"Public" | "Private">("Public");
  const [step, setStep] = useState<"idle" | "contract" | "backend" | "done">("idle");

  // Category-specific params
  const [minLiquidity, setMinLiquidity] = useState("1");
  const [maxRisk, setMaxRisk] = useState("60");
  const [buyAmount, setBuyAmount] = useState("0.1");
  const [stopLoss, setStopLoss] = useState("15");
  const [takeProfit, setTakeProfit] = useState("50");
  const [walletCount, setWalletCount] = useState("3");
  const [totalSpend, setTotalSpend] = useState("0.3");
  const [keywords, setKeywords] = useState("Monad, AI Agent, Breakout");
  const [liquidity, setLiquidity] = useState("0.5");
  const [cooldown, setCooldown] = useState("30");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect your wallet first");
      if (!name.trim()) throw new Error("Agent name is required");

      // Step 1 — write to AgentRegistry contract on Monad
      setStep("contract");
      const txHash = await writeContractAsync({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: "registerAgent",
        args: [name.trim(), CATEGORY_TO_UINT[category], visibility === "Public"],
      });

      // Step 2 — register in backend (pass tx hash for verification)
      setStep("backend");
      const config = buildConfig();
      return createAgent(
        {
          name: name.trim(),
          description,
          category,
          is_public: visibility === "Public",
          config: { ...config, registry_tx: txHash },
        },
        address
      );
    },
    onSuccess: (data) => {
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["my-agents"] });
      navigate(`/agent/${data.id}`);
    },
    onError: () => setStep("idle"),
  });

  function buildConfig(): Record<string, unknown> {
    if (category === "sniper") return {
      buy_amount_mon: buyAmount,
      stop_loss_pct: parseFloat(stopLoss),
      take_profit_pct: parseFloat(takeProfit),
      max_risk_score: parseFloat(maxRisk),
      min_virtual_reserve: parseFloat(minLiquidity),
    };
    if (category === "bundler") return {
      wallet_count: parseInt(walletCount),
      total_spend_mon: totalSpend,
    };
    if (category === "launcher") return {
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      liquidity_mon: liquidity,
      cooldown_minutes: parseInt(cooldown),
    };
    return {};
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 20 } },
  };

  const displayCat = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="relative min-h-screen bg-black text-zinc-50 font-sans selection:bg-indigo-500/30 pb-32">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-6">
            <Settings2 className="w-3.5 h-3.5" /> Agent Configuration
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Create New Agent
          </h1>
          <p className="text-zinc-400 text-lg">
            Define your strategy, set parameters, and deploy to the Monad network.
          </p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

          {/* 1. Identity */}
          <motion.div variants={itemVariants} className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-sm text-zinc-400">1</div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-100">Agent Identity</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2.5">Agent Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Super Sniper v9000"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this agent's primary objective?"
                  rows={3}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* 2. Strategy */}
          <motion.div variants={itemVariants} className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-sm text-zinc-400">2</div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-100">Strategy Architecture</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([
                { name: "sniper" as AgentCategory, label: "Sniper", icon: Zap, desc: "Block-0 execution" },
                { name: "bundler" as AgentCategory, label: "Bundler", icon: Layers, desc: "Multi-wallet buying" },
                { name: "launcher" as AgentCategory, label: "Launcher", icon: Radio, desc: "News-triggered launch" },
                { name: "custom" as AgentCategory, label: "Custom", icon: Code, desc: "Write your own" },
              ]).map((cat) => {
                const isSelected = category === cat.name;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={cn(
                      "relative p-5 rounded-2xl border text-left flex flex-col items-start gap-4 transition-all duration-300 group overflow-hidden",
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                        : "bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700"
                    )}
                  >
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />}
                    <div className={cn("p-2.5 rounded-xl transition-colors", isSelected ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-300 group-hover:bg-zinc-700")}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={cn("font-semibold mb-1", isSelected ? "text-indigo-300" : "text-zinc-200")}>{cat.label}</div>
                      <div className="text-[11px] text-zinc-500 leading-tight">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* 3. Parameters */}
          <motion.div variants={itemVariants} className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-sm text-zinc-400">3</div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-100">Logic & Parameters</h3>
            </div>

            <AnimatePresence mode="wait">
              {category === "sniper" && (
                <motion.div key="sniper" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-amber-400 mb-1">nad.fun CurveStream Listener Active</div>
                      <div className="text-xs text-amber-500/70">Watches for Create events and buys in the same block window.</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <ParamInput label="Buy Amount (MON)" value={buyAmount} onChange={setBuyAmount} />
                    <ParamInput label="Min Virtual Reserve (MON)" value={minLiquidity} onChange={setMinLiquidity} />
                    <ParamInput label="Take Profit (%)" value={takeProfit} onChange={setTakeProfit} />
                    <ParamInput label="Stop Loss (%)" value={stopLoss} onChange={setStopLoss} />
                    <ParamInput label="Max Risk Score (0–100)" value={maxRisk} onChange={setMaxRisk} />
                  </div>
                </motion.div>
              )}

              {category === "bundler" && (
                <motion.div key="bundler" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                    <Layers className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-indigo-300 mb-1">Multi-nonce Bundler Active</div>
                      <div className="text-xs text-indigo-400/70">Fires sequential nonce buys to simulate organic volume in one block window.</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <ParamInput label="Wallet Slots (2–5)" value={walletCount} onChange={setWalletCount} />
                    <ParamInput label="Total Spend (MON)" value={totalSpend} onChange={setTotalSpend} />
                  </div>
                </motion.div>
              )}

              {category === "launcher" && (
                <motion.div key="launcher" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-3">
                    <Radio className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-cyan-400 mb-1">News-Triggered Launcher Active</div>
                      <div className="text-xs text-cyan-500/70">Monitors crypto RSS feeds and CryptoPanic for keyword matches.</div>
                    </div>
                  </div>
                  <ParamInput label="Target Keywords (comma separated)" value={keywords} onChange={setKeywords} />
                  <div className="grid grid-cols-2 gap-5">
                    <ParamInput label="Initial Liquidity Buy (MON)" value={liquidity} onChange={setLiquidity} />
                    <ParamInput label="Cooldown Between Launches (min)" value={cooldown} onChange={setCooldown} />
                  </div>
                </motion.div>
              )}

              {category === "custom" && (
                <motion.div key="custom" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm text-zinc-400">
                    Custom agents use the AgentHub SDK. Deploy now and configure logic via the SDK.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fake IDE preview */}
            <div className="mt-8 pt-8 border-t border-zinc-800/50">
              <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Terminal className="w-3.5 h-3.5" /> Compiled Logic ({displayCat})
              </label>
              <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#0d0d0d]">
                <div className="bg-zinc-900/80 px-4 py-2 flex items-center gap-2 border-b border-zinc-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="ml-4 text-[10px] font-mono text-zinc-500">agent.ts — {displayCat}</div>
                </div>
                <div className="p-5 font-mono text-xs leading-relaxed text-zinc-300">
                  <pre><code>
{category === "sniper" && `sdk.createCurveStream({ eventTypes: ['Create'] })
  .onEvent(async (event) => {
    if (event.riskScore > ${maxRisk}) return;
    await sdk.simpleBuy({ token: event.token, amountIn: parseEther('${buyAmount}') });
    // auto-sell at +${takeProfit}% / -${stopLoss}%
  });`}
{category === "bundler" && `// Fire ${walletCount} sequential nonce buys
const nonce = await sdk.publicClient.getTransactionCount(...);
await Promise.all(Array.from({ length: ${walletCount} }, (_, i) =>
  sdk.simpleBuy({ token, amountIn: parseEther('${(parseFloat(totalSpend)/parseInt(walletCount)||1).toFixed(3)}'), nonce: nonce + i })
));`}
{category === "launcher" && `// Keywords: ${keywords}
if (headline.match(/${keywords.split(",")[0]?.trim()}/i)) {
  await sdk.createToken({ name, symbol, description, image, initialBuyAmount: parseEther('${liquidity}') });
  // cooldown: ${cooldown} minutes
}`}
{category === "custom" && `// Custom logic — implement your strategy here
module.exports = async function(sdk, context) {
  // Full access to nad.fun SDK + Monad RPC
};`}
                  </code></pre>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. Visibility */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 gap-6 shadow-xl">
            <div className="flex items-center gap-5">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner",
                visibility === "Public" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-zinc-800/50 border border-zinc-700 text-zinc-400")}>
                {visibility === "Public" ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100 tracking-tight mb-1">Visibility</h3>
                <p className="text-sm text-zinc-400">
                  {visibility === "Public" ? "Open-source. Available in the Explore feed." : "Private. Restricted to your wallet address."}
                </p>
              </div>
            </div>
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full sm:w-auto">
              {(["Public", "Private"] as const).map((v) => (
                <button key={v} onClick={() => setVisibility(v)}
                  className={cn("flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    visibility === v ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300")}>
                  {v}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div variants={itemVariants} className="pt-4">
            {!address && (
              <p className="text-center text-zinc-500 text-sm mb-4">Connect your wallet to deploy.</p>
            )}
            {mutation.isError && (
              <p className="text-center text-rose-400 text-sm mb-4">{(mutation.error as Error).message}</p>
            )}
            {mutation.isSuccess && (
              <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4">
                <Check className="w-5 h-5" /> Agent deployed! Redirecting…
              </div>
            )}
            <button
              onClick={() => mutation.mutate()}
              disabled={!address || mutation.isPending}
              className="group relative w-full h-14 bg-white text-black rounded-2xl font-semibold text-lg hover:bg-zinc-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {step === "contract" ? "Sign transaction…" : "Creating agent…"}
                </>
              ) : (
                <><span>Deploy Agent to Monad</span><ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function ParamInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-mono focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
      />
    </div>
  );
}

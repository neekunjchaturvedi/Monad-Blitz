import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code,
  Zap,
  Layers,
  Radio,
  Lock,
  Globe,
  Settings2,
  Terminal,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CreateAgentPage() {
  const [category, setCategory] = useState("Sniper");
  const [visibility, setVisibility] = useState("Public");

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
    <div className="relative min-h-screen bg-black text-zinc-50 font-sans selection:bg-indigo-500/30 pb-32">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-6">
            <Settings2 className="w-3.5 h-3.5" />
            Agent Configuration
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Create New Agent
          </h1>
          <p className="text-zinc-400 text-lg">
            Define your strategy, set parameters, and deploy to the Monad
            network.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* 1. Agent Identity */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-900/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-sm text-zinc-400">
                1
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
                Agent Identity
              </h3>
            </div>

            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2.5">
                  Agent Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Super Sniper v9000"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2.5">
                  Description
                </label>
                <textarea
                  placeholder="What is this agent's primary objective?"
                  rows={3}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all backdrop-blur-sm resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* 2. Strategy Type */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-sm text-zinc-400">
                2
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
                Strategy Architecture
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Sniper", icon: Zap, desc: "Mempool execution" },
                { name: "Bundler", icon: Layers, desc: "Multi-wallet buying" },
                { name: "Launcher", icon: Radio, desc: "Event-based triggers" },
                { name: "Custom", icon: Code, desc: "Write your own logic" },
              ].map((cat) => {
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
                        : "bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700",
                    )}
                  >
                    {/* Active Background Glow */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                    )}

                    <div
                      className={cn(
                        "p-2.5 rounded-xl transition-colors",
                        isSelected
                          ? "bg-indigo-500 text-white"
                          : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-300 group-hover:bg-zinc-700",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div
                        className={cn(
                          "font-semibold mb-1",
                          isSelected ? "text-indigo-300" : "text-zinc-200",
                        )}
                      >
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* 3. Logic Configuration */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-sm text-zinc-400">
                3
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                Logic & Parameters
              </h3>
            </div>

            <AnimatePresence mode="wait">
              {category === "Sniper" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-amber-400 mb-1">
                        Standard Factory Listener Active
                      </div>
                      <div className="text-xs text-amber-500/70">
                        This template listens directly to the Uniswap V2 Factory
                        for PairCreated events.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2.5">
                        Min Liquidity ($)
                      </label>
                      <input
                        type="number"
                        defaultValue={5000}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-mono focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2.5">
                        Max Buy Tax (%)
                      </label>
                      <input
                        type="number"
                        defaultValue={5}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-mono focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {category === "Launcher" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-3">
                    <Radio className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-cyan-400 mb-1">
                        Social Sentiment Trigger Active
                      </div>
                      <div className="text-xs text-cyan-500/70">
                        Agent will monitor verified social feeds and execute
                        buys based on keyword triggers.
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2.5">
                      Target Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      defaultValue="Monad, AI Agent, Breakout"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-mono focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-8 border-t border-zinc-800/50">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" /> Compiled Logic (Node.js)
                </label>
              </div>

              {/* Fake IDE Window */}
              <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#0d0d0d] shadow-2xl">
                {/* Window Header */}
                <div className="bg-zinc-900/80 px-4 py-2 flex items-center gap-2 border-b border-zinc-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="ml-4 text-[10px] font-mono text-zinc-500">
                    agent.js
                  </div>
                </div>
                {/* Code Body */}
                <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto text-zinc-300">
                  <pre>
                    <code>
                      <span className="text-zinc-500">
                        // Auto-generated execution logic
                      </span>
                      <span className="text-indigo-400">module</span>.exports ={" "}
                      <span className="text-purple-400">async</span>{" "}
                      <span className="text-blue-400">function</span>(context){" "}
                      {"{"}
                      <span className="text-purple-400">const</span> {"{"}{" "}
                      monad, wallet {"}"} = context; monad.
                      <span className="text-blue-300">on</span>(
                      <span className="text-emerald-400">'newLaunch'</span>,{" "}
                      <span className="text-purple-400">async</span> (token){" "}
                      <span className="text-purple-400">=&gt;</span> {"{"}
                      <span className="text-purple-400">if</span>{" "}
                      (token.liquidity &gt;{" "}
                      <span className="text-amber-400">5000</span>) {"{"}
                      <span className="text-purple-400">await</span> wallet.
                      <span className="text-blue-300">buy</span>(token.address,{" "}
                      <span className="text-amber-400">0.1</span>);{" "}
                      <span className="text-zinc-500">// Execute Swap</span>
                      {"}"}
                      {"}"});
                      {"}"};
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. Visibility & Final Action */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 gap-6 shadow-xl"
          >
            <div className="flex items-center gap-5">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner",
                  visibility === "Public"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-zinc-800/50 border border-zinc-700 text-zinc-400",
                )}
              >
                {visibility === "Public" ? (
                  <Globe className="w-6 h-6" />
                ) : (
                  <Lock className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100 tracking-tight mb-1">
                  Visibility
                </h3>
                <p className="text-sm text-zinc-400">
                  {visibility === "Public"
                    ? "Open-source. Available in the Explore feed."
                    : "Private. Restricted to your wallet address."}
                </p>
              </div>
            </div>

            {/* Segmented Control */}
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full sm:w-auto">
              {["Public", "Private"].map((v) => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  className={cn(
                    "flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    visibility === v
                      ? "bg-zinc-800 text-white shadow-md"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Submit Action */}
          <motion.div variants={itemVariants} className="pt-4">
            <button className="group relative w-full h-14 bg-white text-black rounded-2xl font-semibold text-lg hover:bg-zinc-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] flex items-center justify-center gap-3 overflow-hidden">
              <span className="relative z-10">Deploy Agent to Monad</span>
              <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              {/* Button inner shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-12" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

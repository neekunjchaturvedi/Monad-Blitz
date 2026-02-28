import { motion } from "motion/react";
import {
  ArrowRight,
  Zap,
  Layers,
  Activity,
  Terminal,
  Shield,
  Github,
  Twitter,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

export function LandingPage() {
  // Framer Motion variants for staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 20 },
    },
  };

  return (
    <div className="relative min-h-screen bg-black text-zinc-50 selection:bg-indigo-500/30 font-sans overflow-hidden">
      {/* Modern Grid Background with Radial Mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Ambient Spotlight Gradients */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center w-full"
        >
          {/* Status Badge */}
          <motion.div
            variants={itemVariants}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-md mb-8 cursor-pointer hover:border-zinc-700 transition-colors"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-medium text-zinc-300 tracking-wide uppercase">
              Live on Monad Testnet
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter mb-8 max-w-4xl"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
              Automate Your
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
              On-Chain Alpha
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed"
          >
            Deploy high-frequency AI agents that snipe, bundle, and execute for
            you. <span className="text-zinc-200">No code required.</span> Just
            pure, optimized execution.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              to="/explore"
              className="group relative inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 font-semibold text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              <span>Launch an Agent</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/feed"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/50 px-8 font-medium text-zinc-300 transition-all hover:bg-zinc-900 hover:text-white"
            >
              <Activity className="w-4 h-4 text-zinc-500" />
              Watch Live Feed
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* True Bento Grid Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]"
        >
          {/* Card 1: Sniper (Spans 2 columns) */}
          <div className="group relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-8 md:col-span-2 transition-all hover:border-amber-500/30 flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 ring-1 ring-amber-500/20 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-100 mb-2">
                Sniper Execution
              </h3>
              <p className="text-zinc-400 max-w-md">
                Listens to the mempool and factory contracts to buy in the exact
                same block as liquidity injection. Sub-millisecond latency.
              </p>
            </div>
            {/* Visual Mockup inside Card */}
            <div className="relative z-10 mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-500 flex flex-col gap-2 mask-image:linear-gradient(to_bottom,black,transparent)]">
              <div className="flex gap-2">
                <span className="text-amber-400">⚡</span> [MEMPOOL] PairCreated
                detected: 0x7a2...9b1
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-400">✓</span> Executing buy
                payload (0.4ms)
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-400">✓</span> Transaction
                confirmed in block 1420934
              </div>
            </div>
          </div>

          {/* Card 2: Bundler (Spans 1 column) */}
          <div className="group relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-8 transition-all hover:border-indigo-500/30 flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 ring-1 ring-indigo-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-zinc-100 mb-2">
              Bundler Matrix
            </h3>
            <p className="text-zinc-400 text-sm">
              Coordinate buys across dozens of wallets to simulate organic
              volume and completely evade MEV front-running.
            </p>
          </div>

          {/* Card 3: Shield (Spans 1 column) */}
          <div className="group relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-8 transition-all hover:border-rose-500/30 flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-6 ring-1 ring-rose-500/20 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-zinc-100 mb-2">
              Rug Protection
            </h3>
            <p className="text-zinc-400 text-sm">
              Auto-sells upon detecting malicious contract mutations, tax
              changes, or liquidity pulls. Keep your capital safe.
            </p>
          </div>

          {/* Card 4: Terminal (Spans 2 columns) */}
          <div className="group relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-8 md:col-span-2 transition-all hover:border-emerald-500/30 flex flex-col md:flex-row items-center gap-8">
            <div className="absolute inset-0 bg-gradient-to-tl from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex-1 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 group-hover:scale-110 transition-transform">
                <Terminal className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-100 mb-2">
                Live Terminal View
              </h3>
              <p className="text-zinc-400">
                Real-time web socket visualization of every new launch and
                sub-second agent actions as they happen on-chain.
              </p>
            </div>
            {/* Visual Mockup inside Card */}
            <div className="w-full md:w-1/2 h-32 bg-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:8px_8px]" />
              <Activity className="w-16 h-16 text-emerald-500/20 animate-pulse" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats - Tech Aesthetic */}
      <section className="relative z-10 border-t border-zinc-800/50 bg-zinc-950/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-zinc-800/50 text-center">
            <StatItem value="$12.5M" label="Total Volume" />
            <StatItem value="142k+" label="Agents Deployed" />
            <StatItem value="400ms" label="Avg Execution" />
            <StatItem value="$4.2M" label="User Profits" />
          </div>
        </div>
      </section>

      {/* Modern High-End Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 bg-black pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 group mb-4">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-700/50 shadow-inner">
                  <Terminal className="w-3.5 h-3.5 text-zinc-100" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">
                  Agent<span className="text-zinc-500">Hub</span>
                </span>
              </Link>
              <p className="text-zinc-400 text-sm max-w-xs leading-relaxed mb-6">
                The terminal for the autonomous on-chain economy. Snipe, bundle,
                and execute with pure efficiency on the Monad network.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-zinc-100 font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/explore"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Explore Agents
                  </Link>
                </li>
                <li>
                  <Link
                    to="/create"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Deploy Logic
                  </Link>
                </li>
                <li>
                  <Link
                    to="/feed"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Live Feed
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-zinc-100 font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Agent API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Monad Docs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-zinc-100 font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    Risk Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-zinc-500 text-sm">
              © 2026 AgentHub Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-zinc-500">
                Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
        {value}
      </div>
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

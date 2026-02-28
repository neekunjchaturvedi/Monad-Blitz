import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { createPublicClient, http, formatUnits } from "viem";
import { monadTestnet } from "@/wagmi";
import { useQuery } from "@tanstack/react-query";

import { motion } from "motion/react";

const monadClient = createPublicClient({
  chain: monadTestnet,
  transport: http("https://rpc.monad.xyz"),
});
import {
  Terminal,
  LayoutDashboard,
  Globe,
  PlusSquare,
  Activity,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletModal } from "./WalletModal";

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const { data: rawBalance } = useQuery({
    queryKey: ["mon-balance", address],
    queryFn: () => monadClient.getBalance({ address: address! }),
    enabled: !!address,
    refetchInterval: 15_000,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/explore", label: "Explore", icon: Globe },
    { path: "/feed", label: "Live Feed", icon: Activity },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/create", label: "Create", icon: PlusSquare },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-sans",
          scrolled
            ? "bg-zinc-950/70 backdrop-blur-xl border-b border-white/[0.05] py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent border-b border-transparent py-6",
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Upgraded Premium Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-700/50 shadow-inner overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              {/* Inner ambient glow */}
              <div className="absolute inset-0 bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-colors duration-500" />
              <Terminal className="w-4 h-4 text-zinc-100 relative z-10" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white flex items-center">
              Agent
              <span className="text-zinc-500 transition-colors duration-300 group-hover:text-indigo-400">
                Hub
              </span>
            </span>
          </Link>

          {/* Vercel-style Sliding Pill Navigation */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-zinc-900/30 border border-white/[0.05] rounded-full backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-4 py-2 text-sm font-medium transition-colors rounded-full group outline-none"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-zinc-800/80 border border-zinc-700/50 rounded-full shadow-sm -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <div
                    className={cn(
                      "flex items-center gap-2 relative z-10 transition-colors duration-300",
                      isActive
                        ? "text-white"
                        : "text-zinc-400 group-hover:text-zinc-200",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive
                          ? "text-indigo-400"
                          : "text-zinc-500 group-hover:text-zinc-400",
                      )}
                    />
                    {link.label}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Wallet & Auth Section */}
          <div className="flex items-center gap-3">
            {isConnected && (
              <button
                onClick={() => setWalletModalOpen(true)}
                className="group relative p-2.5 bg-zinc-900/50 border border-white/10 rounded-full hover:bg-zinc-800 hover:border-zinc-700 transition-all backdrop-blur-md overflow-hidden"
                title="Send & Receive"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Wallet className="w-4 h-4 text-zinc-300 group-hover:text-white relative z-10" />
              </button>
            )}

            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="relative group overflow-hidden bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                          >
                            <span className="relative z-10">
                              Connect Wallet
                            </span>
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12" />
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_20px_-5px_rgba(244,63,94,0.2)]"
                          >
                            Wrong Network
                          </button>
                        );
                      }

                      const monBalance = rawBalance != null
                        ? `${parseFloat(formatUnits(rawBalance, 18)).toFixed(3)} MON`
                        : '… MON';

                      return (
                        <div className="flex items-center gap-2">
                          {/* Chain pill — only show if somehow on wrong chain */}
                          {chain.unsupported === false && (
                            <button
                              onClick={openChainModal}
                              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-all text-xs font-medium text-zinc-400 backdrop-blur-md"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              {chain.name}
                              <ChevronDown className="w-3 h-3 text-zinc-600" />
                            </button>
                          )}

                          {/* Account + balance button */}
                          <button
                            onClick={openAccountModal}
                            className="flex items-center gap-0 bg-zinc-900 border border-zinc-700 rounded-full font-medium text-sm hover:border-zinc-500 transition-all overflow-hidden shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                          >
                            {/* Balance pill */}
                            <span className="px-3 py-2 font-mono text-xs text-indigo-300 bg-indigo-500/10 border-r border-zinc-700">
                              {monBalance}
                            </span>
                            {/* Address */}
                            <span className="px-3 py-2 text-zinc-200">
                              {account.displayName}
                            </span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </nav>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </>
  );
}

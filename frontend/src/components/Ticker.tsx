import { motion } from "motion/react";
import { useFeed } from "@/hooks/useFeed";
import { LIVE_ACTIVITY } from "@/lib/data";

export function Ticker() {
  const { agentActions } = useFeed();

  // Use live events if available, fall back to mock data on first load
  const items = agentActions.length > 0
    ? agentActions.slice(0, 20).map((a, i) => ({
        id: i,
        type: inferType(a.action),
        agent: a.agent_id.slice(0, 8),
        coin: a.token ?? a.token_address?.slice(0, 8) ?? "—",
        profit: a.tx_hash ? "✓" : "—",
        time: "live",
      }))
    : LIVE_ACTIVITY;

  const display = [...items, ...items, ...items];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-white/10 py-2 overflow-hidden z-40 backdrop-blur-sm">
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex gap-8 px-4"
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {display.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-mono">
              <span className={
                item.type === "SNIPE" ? "text-green-400"
                  : item.type === "LAUNCH" ? "text-purple-400"
                  : item.type === "EXIT" ? "text-red-400"
                  : "text-blue-400"
              }>
                [{item.type}]
              </span>
              <span className="text-gray-300">{item.agent}</span>
              <span className="text-gray-500">→</span>
              <span className="text-white font-bold">{item.coin}</span>
              <span className={
                String(item.profit).startsWith("+") ? "text-green-400"
                  : String(item.profit).startsWith("-") ? "text-red-400"
                  : "text-gray-500"
              }>
                {item.profit}
              </span>
              <span className="text-gray-600 border-l border-gray-800 pl-2 ml-2">{item.time}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
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

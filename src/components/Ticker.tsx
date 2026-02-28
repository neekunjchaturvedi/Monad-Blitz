import { LIVE_ACTIVITY } from "@/lib/data";
import { motion } from "motion/react";

export function Ticker() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-white/10 py-2 overflow-hidden z-40 backdrop-blur-sm">
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex gap-8 px-4"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {[...LIVE_ACTIVITY, ...LIVE_ACTIVITY, ...LIVE_ACTIVITY].map(
            (item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs font-mono"
              >
                <span
                  className={
                    item.type === "SNIPE"
                      ? "text-green-400"
                      : item.type === "LAUNCH"
                        ? "text-purple-400"
                        : item.type === "EXIT"
                          ? "text-red-400"
                          : "text-blue-400"
                  }
                >
                  [{item.type}]
                </span>
                <span className="text-gray-300">{item.agent}</span>
                <span className="text-gray-500">→</span>
                <span className="text-white font-bold">{item.coin}</span>
                <span
                  className={
                    item.profit.startsWith("+")
                      ? "text-green-400"
                      : item.profit.startsWith("-")
                        ? "text-red-400"
                        : "text-gray-500"
                  }
                >
                  {item.profit}
                </span>
                <span className="text-gray-600 border-l border-gray-800 pl-2 ml-2">
                  {item.time}
                </span>
              </div>
            ),
          )}
        </motion.div>
      </div>
    </div>
  );
}

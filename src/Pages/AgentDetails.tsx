import { useParams } from "react-router-dom";
import { AGENTS, LIVE_ACTIVITY } from "@/lib/data";
import {
  ArrowLeft,
  Play,
  Settings,
  Activity,
  Terminal,
  AlertTriangle,
  Rocket,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AgentDetailPage() {
  const { id } = useParams();
  const agent = AGENTS.find((a) => a.id === id) || AGENTS[0];

  return (
    <div className="max-w-7xl mx-auto px-6">
      <Link
        to="/explore"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Explore
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
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
                      {agent.category}
                    </span>
                    <span className="text-gray-500 text-sm">
                      Created {agent.createdAt}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">
                    Live Status: {agent.status}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-8">
              {agent.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Total Runs" value={agent.runs.toString()} />
              <StatBox
                label="Total Volume"
                value={`$${(agent.volume / 1000).toFixed(1)}k`}
              />
              <StatBox
                label="Avg PnL"
                value={`${agent.pnl}%`}
                color="text-green-400"
              />
              <StatBox label="Success Rate" value="88%" />
            </div>
          </div>

          {/* Logic & Config */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-gray-400" /> Agent Logic
              </h3>
              <ul className="space-y-3">
                {agent.logic.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" /> Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Max Spend Per Trade (MON)
                  </label>
                  <input
                    type="number"
                    defaultValue={0.5}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Stop Loss (%)
                  </label>
                  <input
                    type="number"
                    defaultValue={15}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Take Profit (%)
                  </label>
                  <input
                    type="number"
                    defaultValue={50}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Deploy & Activity */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sticky top-24">
            <h3 className="text-lg font-bold mb-4">Deploy Instance</h3>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                <p className="text-xs text-yellow-200/80">
                  Deploying creates a dedicated wallet. You must fund it with
                  MON for the agent to operate.
                </p>
              </div>
            </div>

            <button className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mb-4">
              <Rocket className="w-5 h-5" /> Deploy Now
            </button>
            <p className="text-center text-xs text-gray-500">
              Gas fee: ~0.002 MON
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {LIVE_ACTIVITY.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded",
                        item.type === "SNIPE"
                          ? "bg-green-500/20 text-green-400"
                          : item.type === "LAUNCH"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400",
                      )}
                    >
                      {item.type}
                    </span>
                    <span className="font-mono">{item.coin}</span>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "font-medium",
                        item.profit.startsWith("+")
                          ? "text-green-400"
                          : "text-gray-400",
                      )}
                    >
                      {item.profit}
                    </div>
                    <div className="text-xs text-gray-600">{item.time}</div>
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

function StatBox({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={cn("text-xl font-mono font-bold", color)}>{value}</div>
    </div>
  );
}

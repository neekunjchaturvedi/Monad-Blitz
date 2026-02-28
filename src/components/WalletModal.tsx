import { useState } from "react";
import { X, Send, ArrowDownLeft, Copy, Check, ExternalLink } from "lucide-react";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, isAddress } from "viem";
import { cn } from "@/lib/utils";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { address, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const [tab, setTab] = useState<"send" | "receive">("send");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    data: hash,
    error: sendError,
    isPending,
    sendTransaction,
    reset,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(recipient)) {
      alert("Invalid address");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Invalid amount");
      return;
    }
    sendTransaction({
      to: recipient as `0x${string}`,
      value: parseEther(amount),
    });
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleClose = () => {
    reset();
    setRecipient("");
    setAmount("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Wallet</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-br from-indigo-900/20 to-transparent">
          <div className="text-sm text-gray-400 mb-1">Balance</div>
          <div className="text-3xl font-mono font-bold">
            {balance
              ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
              : "0.0000"}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            on {chain?.name || "Unknown Network"}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setTab("send")}
            className={cn(
              "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
              tab === "send"
                ? "text-white border-b-2 border-indigo-500"
                : "text-gray-500 hover:text-white"
            )}
          >
            <Send className="w-4 h-4" /> Send
          </button>
          <button
            onClick={() => setTab("receive")}
            className={cn(
              "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
              tab === "receive"
                ? "text-white border-b-2 border-indigo-500"
                : "text-gray-500 hover:text-white"
            )}
          >
            <ArrowDownLeft className="w-4 h-4" /> Receive
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === "send" ? (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Amount ({chain?.nativeCurrency?.symbol || "MON"})
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  "Confirm in Wallet..."
                ) : isConfirming ? (
                  "Confirming..."
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Transaction
                  </>
                )}
              </button>

              {hash && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="text-sm text-gray-400 mb-2">
                    Transaction Hash:
                  </div>
                  <a
                    href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-mono text-sm flex items-center gap-2"
                  >
                    {formatAddress(hash)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {isConfirmed && (
                    <div className="text-green-400 text-sm mt-2 flex items-center gap-2">
                      <Check className="w-4 h-4" /> Transaction confirmed!
                    </div>
                  )}
                </div>
              )}

              {sendError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {sendError.message.split("\n")[0]}
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Share your address to receive funds
                </p>
                <div className="bg-white p-4 rounded-2xl inline-block mb-4">
                  <div className="w-32 h-32 bg-black/10 rounded-lg flex items-center justify-center text-xs text-gray-400">
                    QR Code
                  </div>
                </div>
              </div>
              <div className="bg-black border border-white/10 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-2">Your Address</div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono text-white break-all">
                    {address}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={copyAddress}
                className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Address
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

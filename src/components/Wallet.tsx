import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { parseEther, isAddress } from 'viem'

export function Wallet() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address })
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [copied, setCopied] = useState(false)

  const {
    data: hash,
    error: sendError,
    isPending,
    sendTransaction,
  } = useSendTransaction()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAddress(recipient)) {
      alert('Invalid address')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert('Invalid amount')
      return
    }
    sendTransaction({
      to: recipient as `0x${string}`,
      value: parseEther(amount),
    })
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="wallet-container">
      <div className="connect-section">
        <ConnectButton />
      </div>

      {isConnected && address && (
        <>
          <div className="wallet-info">
            <h3>Wallet Info</h3>
            <div className="info-row">
              <span className="label">Network:</span>
              <span className="value">{chain?.name || 'Unknown'}</span>
            </div>
            <div className="info-row">
              <span className="label">Balance:</span>
              <span className="value">
                {balance
                  ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                  : 'Loading...'}
              </span>
            </div>
          </div>

          <div className="receive-section">
            <h3>Receive</h3>
            <p className="description">Share your address to receive funds:</p>
            <div className="address-display">
              <code>{formatAddress(address)}</code>
              <button onClick={copyAddress} className="copy-btn">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="full-address">
              <small>{address}</small>
            </div>
          </div>

          <div className="send-section">
            <h3>Send {chain?.nativeCurrency?.symbol || 'Tokens'}</h3>
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label htmlFor="recipient">Recipient Address</label>
                <input
                  id="recipient"
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="amount">
                  Amount ({chain?.nativeCurrency?.symbol || 'Token'})
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={isPending} className="send-btn">
                {isPending ? 'Confirming...' : 'Send Transaction'}
              </button>
            </form>

            {hash && (
              <div className="tx-status">
                <p>Transaction Hash:</p>
                <a
                  href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formatAddress(hash)}
                </a>
                {isConfirming && <p className="pending">Waiting for confirmation...</p>}
                {isConfirmed && <p className="success">Transaction confirmed!</p>}
              </div>
            )}

            {sendError && (
              <div className="error">
                <p>Error: {sendError.message.split('\n')[0]}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

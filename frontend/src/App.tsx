import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import {
  COUNTER_ABI,
  COUNTER_ADDRESS,
  MONAD_TESTNET,
} from "./config";

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [count, setCount] = useState<string>("—");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [customValue, setCustomValue] = useState<string>("");

  const hasWallet = typeof window !== "undefined" && !!window.ethereum;
  const contractIsSet =
    COUNTER_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Build a read-only contract instance (no wallet popup needed to read).
  const getReadContract = useCallback(() => {
    if (!window.ethereum) throw new Error("No wallet found");
    const provider = new BrowserProvider(window.ethereum);
    return new Contract(COUNTER_ADDRESS, COUNTER_ABI, provider);
  }, []);

  // Build a contract instance connected to the signer (needed to write).
  const getWriteContract = useCallback(async () => {
    if (!window.ethereum) throw new Error("No wallet found");
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(COUNTER_ADDRESS, COUNTER_ABI, signer);
  }, []);

  // Read the current count from the chain.
  const refreshCount = useCallback(async () => {
    if (!contractIsSet) return;
    try {
      const contract = getReadContract();
      const value: bigint = await contract.count();
      setCount(value.toString());
    } catch (err) {
      console.error(err);
      setStatus("Could not read count. Is the contract address correct?");
    }
  }, [contractIsSet, getReadContract]);

  // Ask MetaMask to switch to Monad testnet, adding it if unknown.
  const ensureMonadNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_TESTNET.chainIdHex }],
      });
    } catch (err: unknown) {
      // 4902 = chain not added to wallet yet, so add it.
      const code = (err as { code?: number })?.code;
      if (code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: MONAD_TESTNET.chainIdHex,
              chainName: MONAD_TESTNET.chainName,
              rpcUrls: [MONAD_TESTNET.rpcUrl],
              nativeCurrency: MONAD_TESTNET.currency,
              blockExplorerUrls: [MONAD_TESTNET.blockExplorerUrl],
            },
          ],
        });
      } else {
        throw err;
      }
    }
  }, []);

  // Connect the wallet and make sure we're on Monad testnet.
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setStatus("MetaMask not found. Install it to continue.");
      return;
    }
    try {
      setBusy(true);
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      await ensureMonadNetwork();
      setAccount(accounts[0]);
      setStatus("Wallet connected.");
      await refreshCount();
    } catch (err) {
      console.error(err);
      setStatus("Connection failed or was rejected.");
    } finally {
      setBusy(false);
    }
  }, [ensureMonadNetwork, refreshCount]);

  // Generic helper: send a transaction and wait for it to be mined.
  const sendTx = useCallback(
    async (label: string, action: (c: Contract) => Promise<{ wait: () => Promise<unknown>; hash: string }>) => {
      if (!account) {
        setStatus("Connect your wallet first.");
        return;
      }
      try {
        setBusy(true);
        setStatus(`${label}: sending transaction...`);
        const contract = await getWriteContract();
        const tx = await action(contract);
        setStatus(`${label}: waiting for confirmation... (${tx.hash.slice(0, 10)}…)`);
        await tx.wait();
        setStatus(`${label}: confirmed!`);
        await refreshCount();
      } catch (err) {
        console.error(err);
        setStatus(`${label} failed or was rejected.`);
      } finally {
        setBusy(false);
      }
    },
    [account, getWriteContract, refreshCount]
  );

  const handleIncrement = () =>
    sendTx("Increment", (c) => c.increment());
  const handleDecrement = () =>
    sendTx("Decrement", (c) => c.decrement());
  const handleSetCount = () => {
    if (customValue.trim() === "" || Number(customValue) < 0) {
      setStatus("Enter a valid non-negative number.");
      return;
    }
    sendTx("Set count", (c) => c.setCount(BigInt(customValue)));
  };

  // Load the count once on mount (read-only, no wallet prompt).
  useEffect(() => {
    if (hasWallet && contractIsSet) refreshCount();
  }, [hasWallet, contractIsSet, refreshCount]);

  // React to the user switching accounts in MetaMask.
  useEffect(() => {
    if (!window.ethereum?.on) return;
    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      setAccount(accounts[0] ?? null);
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <main className="container">
      <h1>🟣 Monad Counter</h1>
      <p className="subtitle">
        A tiny dApp reading &amp; writing a number on the Monad testnet.
      </p>

      {!hasWallet && (
        <div className="banner error">
          No wallet detected. Install{" "}
          <a href="https://metamask.io" target="_blank" rel="noreferrer">
            MetaMask
          </a>{" "}
          to use this app.
        </div>
      )}

      {!contractIsSet && (
        <div className="banner warn">
          Contract address not set yet. Deploy the contract, then paste the
          address into <code>frontend/src/config.ts</code>.
        </div>
      )}

      <div className="card">
        <div className="count-display">{count}</div>
        <div className="count-label">current on-chain count</div>
      </div>

      {!account ? (
        <button className="primary" onClick={connect} disabled={busy || !hasWallet}>
          {busy ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <>
          <div className="account">
            Connected: <code>{account.slice(0, 6)}…{account.slice(-4)}</code>
          </div>

          <div className="button-row">
            <button onClick={handleDecrement} disabled={busy}>
              − Decrement
            </button>
            <button className="primary" onClick={handleIncrement} disabled={busy}>
              + Increment
            </button>
          </div>

          <div className="set-row">
            <input
              type="number"
              min="0"
              placeholder="set to..."
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              disabled={busy}
            />
            <button onClick={handleSetCount} disabled={busy}>
              Set
            </button>
          </div>

          <button className="ghost" onClick={refreshCount} disabled={busy}>
            ↻ Refresh
          </button>
        </>
      )}

      {status && <div className="status">{status}</div>}

      <footer>
        <a href={MONAD_TESTNET.blockExplorerUrl} target="_blank" rel="noreferrer">
          Block explorer
        </a>{" "}
        ·{" "}
        <a href="https://faucet.monad.xyz" target="_blank" rel="noreferrer">
          Get testnet MON
        </a>
      </footer>
    </main>
  );
}

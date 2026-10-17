// ---------------------------------------------------------------------------
// PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE
// You get this after running `npm run deploy` from the project root.
// ---------------------------------------------------------------------------
export const COUNTER_ADDRESS = "0x3c4E837B49eF0a313cd7F320EDe391b552e29A65";

// Monad Testnet network details.
// Source of truth: https://docs.monad.xyz (Testnet Quick Facts)
export const MONAD_TESTNET = {
  chainIdDecimal: 10143,
  chainIdHex: "0x279f", // 10143 in hex
  chainName: "Monad Testnet",
  rpcUrl: "https://testnet-rpc.monad.xyz",
  currency: { name: "MON", symbol: "MON", decimals: 18 },
  blockExplorerUrl: "https://testnet.monadexplorer.com",
};

// The minimal ABI (Application Binary Interface) the frontend needs.
// It describes the functions/events we call on the contract.
export const COUNTER_ABI = [
  "function count() view returns (uint256)",
  "function increment()",
  "function decrement()",
  "function setCount(uint256 newCount)",
  "event CountChanged(uint256 newCount, address changedBy)",
] as const;

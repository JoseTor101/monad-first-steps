# 🟣 Monad Counter dApp

A minimal but complete example for a hackathon: a **Solidity smart contract** deployed to the **Monad testnet**, plus a **React + TypeScript** frontend that reads and writes to it through MetaMask.

If you've never touched blockchain before, this is a good starting shape. The whole thing is just "store a number on-chain and change it."

---

## What's inside

```
learning/
├─ contracts/Counter.sol      # the smart contract (a number you can change)
├─ scripts/deploy.ts          # deploys the contract to Monad testnet
├─ hardhat.config.ts          # Hardhat config pointed at Monad testnet
├─ .env.example               # where your private key goes (copy to .env)
└─ frontend/                  # React + TypeScript UI (Vite)
   └─ src/
      ├─ App.tsx              # wallet connect + contract calls
      └─ config.ts            # PASTE YOUR CONTRACT ADDRESS HERE
```

### Key blockchain concepts (30-second version)
- **Smart contract**: a program living on the blockchain. Once deployed, anyone can call it.
- **Reading** state is free. **Writing** state (a transaction) costs a tiny bit of gas.
- **Gas** is paid in the chain's native token. On Monad testnet that's **MON**, which you get free from a faucet.
- **MetaMask** is the wallet that holds your account and signs transactions.

---

## Prerequisites
- [Node.js](https://nodejs.org) 18+ installed
- [MetaMask](https://metamask.io) browser extension
- A little testnet **MON** from the [Monad faucet](https://faucet.monad.xyz)

---

## Step 1 — Install & compile the contract

From the project root (`learning/`):

```bash
npm install
npm run compile
```

## Step 2 — Add your private key

1. Copy `.env.example` to `.env`.
2. In MetaMask: **Account details → Show private key**, copy it into `.env`:

```
PRIVATE_KEY=your_test_wallet_private_key
```

> Use a throwaway wallet for hackathons. `.env` is git-ignored so it won't be committed.

## Step 3 — Get testnet MON

Go to the [Monad faucet](https://faucet.monad.xyz) and request tokens for your wallet address. You need a small amount to pay for deployment gas.

## Step 4 — Deploy to Monad testnet

```bash
npm run deploy
```

You'll see something like:

```
Counter deployed to: 0xABC123...
```

Copy that address.

## Step 5 — Wire up the frontend

Open `frontend/src/config.ts` and paste the address:

```ts
export const COUNTER_ADDRESS = "0xABC123..."; // <- your deployed address
```

## Step 6 — Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

Click **Connect Wallet** — MetaMask will prompt you and automatically switch to (or add) the Monad testnet. Then use **+ Increment**, **− Decrement**, or **Set** to send transactions. Each one pops a MetaMask confirmation and updates the on-chain count.

---

## Monad testnet reference

| Field | Value |
|-------|-------|
| Network name | Monad Testnet |
| Chain ID | 10143 |
| RPC URL | https://testnet-rpc.monad.xyz |
| Currency | MON |
| Faucet | https://faucet.monad.xyz |

Facts sourced from the [Monad documentation](https://docs.monad.xyz/ai/current-facts). Content was rephrased for compliance with licensing restrictions.

---

## Where to take it next (hackathon ideas)
- Track **who** changed the count using the `CountChanged` event and show recent activity.
- Add a `mapping(address => uint256)` so each user has their own counter.
- Turn it into a voting app, a to-do list, or an on-chain guestbook — same read/write pattern.
- Add a token or NFT contract using the OpenZeppelin library.

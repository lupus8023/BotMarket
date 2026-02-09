import { http, createConfig } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "";

export const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});

// 合约地址
export const ESCROW_CONTRACT = {
  [bsc.id]: "0x49fd6FC44FaA718eD296e93ce56f98A276D04F01",
  [bscTestnet.id]: "0x49fd6FC44FaA718eD296e93ce56f98A276D04F01",
} as const;

// 支付代币地址
export const PAYMENT_TOKEN = {
  [bsc.id]: "0x4bda5459f1610898de62634f4fce45bc571d717d",
  [bscTestnet.id]: "0x4bda5459f1610898de62634f4fce45bc571d717d",
} as const;

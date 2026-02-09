"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const injectedConnector = connectors.find((c) => c.id === "injected");
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else if (connectors[0]) {
      connect({ connector: connectors[0] });
    } else {
      console.error("No connectors available");
    }
  };

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="bg-zinc-800 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-700 transition"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition disabled:opacity-50"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

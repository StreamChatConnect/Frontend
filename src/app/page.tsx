"use client";

import { useSocket } from "@/lib/useSocket";
import Chat from "@/components/chat";

export default function Main() {
  const { connected, streamMessages } = useSocket();

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Stream Chat</h1>
      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <p>Message Count: {streamMessages.length}</p>
      <Chat limit={false} />
    </main>
  );
}

"use client";

import Chat from "@/components/chat";

export default function ChatPage() {
  return (
    <div>
      <Chat limit={5} />
    </div>
  );
}

import { useState } from "react";

interface Props {
  onSend: (message: string) => void;
}

function ChatInput({ onSend }: Props) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    onSend(message);

    setMessage("");
  };

  return (
    <div className="flex gap-3">

      <input
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
        placeholder="Ask EduMind AI..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />

      <button
        onClick={handleSend}
        className="rounded-lg bg-blue-600 px-6 hover:bg-blue-700"
      >
        Send
      </button>

    </div>
  );
}

export default ChatInput;
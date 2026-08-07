import { useState } from "react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { askAI } from "../../api/chat.api";

interface Message {
  text: string;
  isUser: boolean;
}

function ChatBox() {

  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async (question: string) => {

    if (!question.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        text: question,
        isUser: true,
      },
    ]);

    setLoading(true);

    try {

      const result = await askAI({ question });

      setMessages((prev) => [
        ...prev,
        {
          text: result.answer,
          isUser: false,
        },
      ]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          text: "Unable to contact EduMind AI.",
          isUser: false,
        },
      ]);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="glass rounded-2xl p-6">

      <h2 className="mb-5 text-2xl font-bold">
        EduMind AI
      </h2>

      <div className="mb-6 h-112.5 overflow-y-auto space-y-4">

        {messages.map((msg, index) => (

          <MessageBubble
            key={index}
            message={msg.text}
            isUser={msg.isUser}
          />

        ))}

        {loading && (

          <MessageBubble
            message="Thinking..."
            isUser={false}
          />

        )}

      </div>

      <ChatInput
        onSend={sendMessage}
      />

    </div>

  );

}

export default ChatBox;
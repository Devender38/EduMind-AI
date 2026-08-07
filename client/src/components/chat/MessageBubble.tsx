interface Props {
  message: string;
  isUser: boolean;
}

function MessageBubble({ message, isUser }: Props) {
  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-xl px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "glass text-white"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

export default MessageBubble;
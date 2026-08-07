import api from "./axios";

export interface Conversation {
  _id: string;
  title: string;
  document: string;
  user?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  role: "user" | "assistant";
  message: string;
  sources?: string[];
  createdAt: string;
}

interface ConversationResponse {
  success: boolean;
  conversation: Conversation;
}

interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

interface MessagesResponse {
  success: boolean;
  messages: ChatMessage[];
}

// ===============================
// Create Conversation
// ===============================

export const createConversation = async (
  documentId: string,
  title?: string
): Promise<Conversation> => {
  const res = await api.post<ConversationResponse>(
    "/conversations",
    {
      documentId,
      title,
    }
  );

  return res.data.conversation;
};

// ===============================
// Get All Conversations
// ===============================

export const getConversations =
  async (): Promise<Conversation[]> => {
    const res =
      await api.get<ConversationsResponse>(
        "/conversations"
      );

    return res.data.conversations;
  };

// ===============================
// Get Messages
// ===============================

export const getMessages = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  const res =
    await api.get<MessagesResponse>(
      `/conversations/${conversationId}/messages`
    );

  return res.data.messages;
};

// ===============================
// Delete Conversation
// ===============================

export const deleteConversation =
  async (
    conversationId: string
  ): Promise<void> => {
    await api.delete(
      `/conversations/${conversationId}`
    );
  };

// ===============================
// Rename Conversation
// ===============================

export const renameConversation =
  async (
    conversationId: string,
    title: string
  ): Promise<Conversation> => {
    const res =
      await api.put<ConversationResponse>(
        `/conversations/${conversationId}`,
        {
          title,
        }
      );

    return res.data.conversation;
  };
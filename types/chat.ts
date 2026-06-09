export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  timestamp: string;
};

export type SessionContext = {
  sessionId: string;
  createdAt: string;
};

export type MemoryCapsuleInsert = {
  session_id: string;
  insight: string;
  created_at?: string;
};

export type Chat = {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
};

export type Sender = "me" | "other";

export type Message = {
  id: string;
  chatId: string;
  sender: Sender;
  text: string;
  createdAt: number;
};

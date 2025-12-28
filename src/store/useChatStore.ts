import { create } from "zustand";
import type { Chat, Message } from "@/types";
import {
  appendLocalMessage,
  getChats,
  getMessages,
  subscribeToChat,
} from "@/api/mockService";

type ChatState = {
  chats: Chat[];
  activeChatId: string | null;
  messagesByChat: Record<string, Message[]>;
  loadingChats: boolean;
  loadingMessages: boolean;
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  sendMessage: (text: string) => void;
  receiveMessage: (message: Message) => void;
};

let unsubscribeActive: (() => void) | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChatId: null,
  messagesByChat: {},
  loadingChats: false,
  loadingMessages: false,
  loadChats: async () => {
    set({ loadingChats: true });
    const chats = await getChats();
    set({ chats, loadingChats: false });
    if (!get().activeChatId && chats.length > 0) {
      await get().selectChat(chats[0].id);
    }
  },
  selectChat: async (chatId) => {
    set({ activeChatId: chatId, loadingMessages: true });
    if (unsubscribeActive) {
      unsubscribeActive();
      unsubscribeActive = null;
    }
    const existing = get().messagesByChat[chatId];
    if (!existing) {
      const messages = await getMessages(chatId);
      set((state) => ({
        messagesByChat: { ...state.messagesByChat, [chatId]: messages },
        loadingMessages: false,
      }));
    } else {
      set({ loadingMessages: false });
    }
    unsubscribeActive = subscribeToChat(chatId, get().receiveMessage);
  },
  sendMessage: (text) => {
    const activeChatId = get().activeChatId;
    if (!activeChatId) {
      return;
    }
    const message: Message = {
      id: `${activeChatId}-local-${Date.now()}`,
      chatId: activeChatId,
      sender: "me",
      text,
      createdAt: Date.now(),
    };
    appendLocalMessage(activeChatId, message);
    set((state) => {
      const list = state.messagesByChat[activeChatId] ?? [];
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [activeChatId]: [...list, message],
        },
        chats: state.chats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, lastMessage: message.text }
            : chat
        ),
      };
    });
  },
  receiveMessage: (message) => {
    set((state) => {
      const list = state.messagesByChat[message.chatId] ?? [];
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [message.chatId]: [...list, message],
        },
        chats: state.chats.map((chat) =>
          chat.id === message.chatId
            ? { ...chat, lastMessage: message.text }
            : chat
        ),
      };
    });
  },
}));

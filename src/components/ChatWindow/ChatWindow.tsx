import { useChatStore } from "@/store/useChatStore";
import MessageList from "@/components/MessageList/MessageList";
import MessageInput from "@/components/MessageInput/MessageInput";
import styles from "./ChatWindow.module.scss";

const ChatWindow = () => {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const chats = useChatStore((state) => state.chats);
  const loadingMessages = useChatStore((state) => state.loadingMessages);

  if (!activeChatId) {
    return <div className={styles.emptyState}>Выберите чат</div>;
  }

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  return (
    <section className={styles.chatWindow}>
      <header className={styles.header}>
        <div>
          <div className={styles.title}>{activeChat?.name}</div>
          <div className={styles.subtitle}>Онлайн сейчас</div>
        </div>
      </header>
      <div className={styles.body}>
        {loadingMessages ? (
          <div className={styles.loading}>Загрузка сообщений...</div>
        ) : (
          <MessageList chatId={activeChatId} />
        )}
      </div>
      <MessageInput />
    </section>
  );
};

export default ChatWindow;

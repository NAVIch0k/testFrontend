import { useChatStore } from "@/store/useChatStore";
import styles from "./ChatList.module.scss";

const ChatList = () => {
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const loadingChats = useChatStore((state) => state.loadingChats);
  const selectChat = useChatStore((state) => state.selectChat);

  if (loadingChats) {
    return <div className={styles.loading}>Загрузка чатов...</div>;
  }

  return (
    <div className={styles.chatList}>
      {chats.map((chat) => (
        <button
          key={chat.id}
          type="button"
          className={`${styles.item} ${
            activeChatId === chat.id ? styles.itemActive : ""
          }`}
          onClick={() => selectChat(chat.id)}
        >
          <img src={chat.avatarUrl} alt={chat.name} className={styles.avatar} />
          <div className={styles.content}>
            <div className={styles.name}>{chat.name}</div>
            <div className={styles.preview}>{chat.lastMessage}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatList;

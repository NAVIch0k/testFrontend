import { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import ChatList from "@/components/ChatList/ChatList";
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import styles from "@/App.module.scss";

const App = () => {
  const loadChats = useChatStore((state) => state.loadChats);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>Windi Messenger</div>
        <ChatList />
      </aside>
      <main className={styles.content}>
        <ChatWindow />
      </main>
    </div>
  );
};

export default App;

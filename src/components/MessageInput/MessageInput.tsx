import { useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import styles from "./MessageInput.module.scss";

const MessageInput = () => {
  const [value, setValue] = useState("");
  const sendMessage = useChatStore((state) => state.sendMessage);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    sendMessage(trimmed);
    setValue("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Введите сообщение"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className={styles.field}
      />
      <button type="submit" className={styles.button}>
        Отправить
      </button>
    </form>
  );
};

export default MessageInput;

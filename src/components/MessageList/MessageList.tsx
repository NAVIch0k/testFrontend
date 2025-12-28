import { useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import { useChatStore } from '@/store/useChatStore'
import type { Message } from '@/types'
import styles from './MessageList.module.scss'

type MessageListProps = {
  chatId: string
}

const ROW_HEIGHT = 68

const MessageRow = ({ data, index, style }: ListChildComponentProps) => {
  const message = data[index] as Message
  const isMe = message.sender === 'me'

  return (
    <div
      style={style}
      className={`${styles.row} ${isMe ? styles.rowMe : ''}`}
      key={message.id}
    >
      <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : ''}`}>
        <div className={styles.text}>{message.text}</div>
        <div className={styles.time}>
          {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
}

const MessageList = ({ chatId }: MessageListProps) => {
  const messages = useChatStore((state) => state.messagesByChat[chatId] ?? [])
  const listRef = useRef<FixedSizeList>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(400)

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'me') {
      listRef.current?.scrollToItem(messages.length - 1, 'end')
    }
  }, [messages.length])

  useEffect(() => {
    listRef.current?.scrollToItem(messages.length - 1, 'end')
  }, [chatId])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    const resizeObserver = new ResizeObserver(() => {
      setHeight(container.clientHeight)
    })
    resizeObserver.observe(container)
    setHeight(container.clientHeight)
    return () => resizeObserver.disconnect()
  }, [])

  const itemData = useMemo(() => messages, [messages])

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <FixedSizeList
        ref={listRef}
        height={height}
        width='100%'
        itemCount={messages.length}
        itemSize={ROW_HEIGHT}
        itemData={itemData}
        className={styles.list}
      >
        {MessageRow}
      </FixedSizeList>
    </div>
  )
}

export default MessageList

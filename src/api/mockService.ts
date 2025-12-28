import type { Chat, Message } from '@/types'

const avatarNames = [
  'Katherine',
  'Jade',
  'Kingston',
  'Avery',
  'Ryan',
  'Adrian'
]
const CHAT_COUNT = 6
const MESSAGE_COUNT = 5200
const chats: Chat[] = Array.from({ length: CHAT_COUNT }, (_, index) => {
  const id = `chat-${index + 1}`
  return {
    id,
    name: `Комната ${index + 1}`,
    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${avatarNames[index]}`,
    lastMessage: ''
  }
})

const messagesByChat = new Map<string, Message[]>()

const sampleStarts = [
  'Привет',
  'Отлично',
  'Думаю',
  'По поводу',
  'Согласен',
  'Обсудим',
  'Проверил',
  'Результат',
  'Есть'
]
const sampleEnds = [
  'сегодня',
  'завтра',
  'в очереди',
  'по задаче',
  'сейчас',
  'после созвона',
  'к вечеру',
  'в релиз',
  'без проблем'
]

const createMessageText = (index: number) => {
  const start = sampleStarts[index % sampleStarts.length]
  const end = sampleEnds[index % sampleEnds.length]
  return `${start} — ${end}.`
}

const ensureMessages = (chatId: string) => {
  if (messagesByChat.has(chatId)) {
    return
  }
  const baseTime = Date.now() - MESSAGE_COUNT * 60_000
  const messages: Message[] = Array.from(
    { length: MESSAGE_COUNT },
    (_, index) => ({
      id: `${chatId}-msg-${index + 1}`,
      chatId,
      sender: index % 3 === 0 ? 'me' : 'other',
      text: createMessageText(index),
      createdAt: baseTime + index * 60_000
    })
  )
  messagesByChat.set(chatId, messages)
}

export const getChats = async (): Promise<Chat[]> => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  chats.forEach((chat, index) => {
    if (!chat.lastMessage) {
      chat.lastMessage = createMessageText(index)
    }
  })
  return chats.map((chat) => ({ ...chat }))
}

export const getMessages = async (chatId: string): Promise<Message[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  ensureMessages(chatId)
  const messages = messagesByChat.get(chatId) ?? []
  const last = messages[messages.length - 1]
  const chat = chats.find((item) => item.id === chatId)
  if (chat && last) {
    chat.lastMessage = last.text
  }
  return messages.map((message) => ({ ...message }))
}

export const subscribeToChat = (
  chatId: string,
  onMessage: (message: Message) => void
) => {
  ensureMessages(chatId)
  const interval = setInterval(() => {
    const nextId = `${chatId}-ws-${Date.now()}`
    const message: Message = {
      id: nextId,
      chatId,
      sender: 'other',
      text: 'Новое сообщение из сокета.',
      createdAt: Date.now()
    }
    const list = messagesByChat.get(chatId) ?? []
    list.push(message)
    messagesByChat.set(chatId, list)
    const chat = chats.find((item) => item.id === chatId)
    if (chat) {
      chat.lastMessage = message.text
    }
    onMessage(message)
  }, 4500)

  return () => clearInterval(interval)
}

export const appendLocalMessage = (chatId: string, message: Message) => {
  ensureMessages(chatId)
  const list = messagesByChat.get(chatId) ?? []
  list.push(message)
  messagesByChat.set(chatId, list)
  const chat = chats.find((item) => item.id === chatId)
  if (chat) {
    chat.lastMessage = message.text
  }
}

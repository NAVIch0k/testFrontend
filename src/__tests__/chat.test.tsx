import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { useChatStore } from "@/store/useChatStore";

jest.mock("react-window", () => {
  const React = require("react");
  return {
    FixedSizeList: React.forwardRef(
      ({ itemCount, itemData, children, className }: any, ref: any) => {
        React.useImperativeHandle(ref, () => ({ scrollToItem: () => {} }));
        return (
          <div data-testid="virtual-list" className={className}>
            {Array.from({ length: itemCount }).map((_, index) =>
              children({ index, style: {}, data: itemData })
            )}
          </div>
        );
      }
    ),
  };
});

const mockChats = [
  {
    id: "chat-1",
    name: "Команда",
    avatarUrl: "avatar-1",
    lastMessage: "Последнее сообщение",
  },
];

const mockMessages = [
  {
    id: "chat-1-msg-1",
    chatId: "chat-1",
    sender: "other",
    text: "Привет!",
    createdAt: 1710000000000,
  },
  {
    id: "chat-1-msg-2",
    chatId: "chat-1",
    sender: "other",
    text: "Как дела?",
    createdAt: 1710000060000,
  },
];

jest.mock("@/api/mockService", () => ({
  getChats: jest.fn(async () => mockChats),
  getMessages: jest.fn(async () => mockMessages),
  subscribeToChat: jest.fn(() => () => undefined),
  appendLocalMessage: jest.fn(),
}));

const resetStore = () => {
  useChatStore.setState({
    chats: [],
    activeChatId: null,
    messagesByChat: {},
    loadingChats: false,
    loadingMessages: false,
  });
};

beforeEach(() => {
  resetStore();
});

describe("chat ui", () => {
  it("renders chat list and messages", async () => {
    render(<App />);

    expect(
      await screen.findByRole("button", { name: /Команда/ })
    ).toBeInTheDocument();
    expect(await screen.findByText("Привет!")).toBeInTheDocument();
  });

  it("sends message optimistically", async () => {
    render(<App />);

    await screen.findByRole("button", { name: /Команда/ });
    const input = await screen.findByPlaceholderText("Введите сообщение");
    const user = userEvent.setup();
    await act(async () => {
      await user.type(input, "Новое сообщение");
      await user.click(screen.getByRole("button", { name: "Отправить" }));
    });

    const list = await screen.findByTestId("virtual-list");
    await waitFor(() => {
      expect(within(list).getByText("Новое сообщение")).toBeInTheDocument();
    });
  });
});

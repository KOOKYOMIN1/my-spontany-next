import { createContext, useContext, useState } from "react";

const ChatModalContext = createContext();

export function ChatModalProvider({ children }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <ChatModalContext.Provider value={{ chatOpen, setChatOpen }}>
      {children}
    </ChatModalContext.Provider>
  );
}

export function useChatModal() {
  return useContext(ChatModalContext);
}
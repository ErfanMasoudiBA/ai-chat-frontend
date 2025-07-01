"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles, Menu } from "lucide-react";
import { Message, Chat } from "./types";
import ChatMessage from "./components/ChatMessage";
import ChatSidebar from "./components/ChatSidebar";
import ChatInput from "./components/ChatInput";

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = currentChat?.messages || [];
  const hasMessages = messages.length > 0;
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedChats = localStorage.getItem("chats");
    if (savedChats) {
      const parsed = JSON.parse(savedChats);

      // تبدیل دوباره‌ی تاریخ‌ها به Date
      const restored = parsed.map((chat: Chat) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        messages: chat.messages.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }));

      setChats(restored);
      if (restored.length > 0) {
        setCurrentChatId(restored[0].id);
      }
    }
  }, []);

  // ذخیره در localStorage
  useEffect(() => {
    console.log("💾 Saving to localStorage:", chats);
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  const createNewChat = () => {
    // فقط اگر چت فعلی پیام دارد، چت جدید بساز
    if (currentChat && currentChat.messages.length > 0) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: "گفتگوی جدید",
        messages: [],
        createdAt: new Date(),
      };
      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      setSidebarOpen(false);

      // بازگرداندن به حالت مرکزی input
      window.scrollTo(0, 0);
    }
  };

  const switchToChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  };

  const updateChatTitle = (chatId: string, firstMessage: string) => {
    const title =
      firstMessage.length > 30
        ? firstMessage.substring(0, 30) + "..."
        : firstMessage;
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat))
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    let chatId = currentChatId;

    // اگر چت فعلی وجود نداره، چت جدید بساز
    if (!chatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: "گفتگوی جدید",
        messages: [],
        createdAt: new Date(),
      };
      setChats((prev) => [newChat, ...prev]);
      chatId = newChat.id;
      setCurrentChatId(chatId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    // Update title if this is the first message
    if (messages.length === 0) {
      updateChatTitle(chatId, input);
    }

    setInput("");
    setIsLoading(true);

    try {
      const requestBody = {
        model: "gpt-4o-mini",
        messages: messages.concat(userMessage).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: 1000,
        temperature: 0.7,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`خطای API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const assistantContent =
        data.choices?.[0]?.message?.content || "پاسخی دریافت نشد";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      );
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `خطا: ${
          error instanceof Error ? error.message : "خطای نامشخص"
        }`,
        timestamp: new Date(),
      };
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50" dir="rtl">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        sidebarOpen={sidebarOpen}
        sidebarWidth={sidebarWidth}
        onCreateNewChat={createNewChat}
        onSwitchToChat={switchToChat}
        onDeleteChat={deleteChat}
        onCloseSidebar={() => setSidebarOpen(false)}
        onSidebarWidthChange={setSidebarWidth}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {hasMessages && (
          <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-700"
                title="باز کردن منو"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-slate-800 font-bold text-lg">
                    دستیار هوشمند ایرانی
                  </h1>
                  <p className="text-slate-500 text-sm flex items-center space-x-1 space-x-reverse">
                    <span>🇮🇷</span>
                    <span>پیشگامان هوش مصنوعی</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-slate-500 text-sm">آنلاین</span>
            </div>
          </div>
        )}

        {/* Messages */}
        {hasMessages && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {messages.map((message, index) => (
              <ChatMessage key={message.id} message={message} index={index} />
            ))}

            {isLoading && (
              <div className="flex items-start space-x-4 space-x-reverse animate-in slide-in-from-bottom-2 flex-row-reverse">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="text-slate-600">
                      هوش مصنوعی در حال فکر کردن...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Chat Input */}
        <ChatInput
          key={currentChatId || "new"}
          input={input}
          setInput={setInput}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          hasMessages={hasMessages}
        />
      </div>
    </div>
  );
}

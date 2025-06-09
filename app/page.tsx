"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  User,
  Bot,
  Loader2,
  Sparkles,
  Menu,
  X,
  Plus,
  MessageCircle,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const config = {
  name: "GapGPT API",
  endpoint: "https://api.gapgpt.app/v1/chat/completions",
  apiKey: "sk-W3PTTlGul9g2wPG2LPo7XX431HDY2v8Wl4KiHrWduVDMhG1x",
  model: "gpt-4o",
  headers: {
    "Content-Type": "application/json",
  },
};

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // عرض پیش‌فرض 320px
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 250 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        model: config.model,
        messages: messages.concat(userMessage).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: 1000,
        temperature: 0.7,
      };

      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          ...config.headers,
          Authorization: `Bearer ${config.apiKey}`,
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
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } fixed inset-y-0 right-0 z-50 bg-white border-l border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-lg lg:shadow-none`}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Resize Handle - فقط در دسکتاپ نمایش داده می‌شود */}
        <div
          className="hidden lg:block absolute left-0 top-0 w-1 h-full bg-slate-200 hover:bg-indigo-400 cursor-col-resize transition-colors duration-200"
          onMouseDown={startResizing}
        />

        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-slate-800 font-semibold">دستیار هوشمند</h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={createNewChat}
            disabled={!currentChat || currentChat.messages.length === 0}
            className={`w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 text-white rounded-lg transition-all duration-200 mb-4 shadow-md ${
              currentChat && currentChat.messages.length > 0
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg cursor-pointer"
                : "bg-slate-400 cursor-not-allowed opacity-60"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>گفتگوی جدید</span>
          </button>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => switchToChat(chat.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentChatId === chat.id
                    ? "bg-slate-100 text-slate-900 border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <MessageCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  <span className="flex-1 text-sm truncate">{chat.title}</span>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {chat.createdAt.toLocaleDateString("fa-IR")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-center">
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">پ</span>
              </div>
              <span className="text-slate-700 text-sm font-semibold">
                پیشگامان هوش مصنوعی
              </span>
            </div>
            <p className="text-slate-500 text-xs">ساخته و پرداخته شده با ❤️</p>
            <div className="mt-2 pt-2 border-t border-slate-200">
              <p className="text-slate-500 text-xs">مدل: {config.model}</p>
              <p className="text-slate-500 text-xs flex items-center justify-center space-x-1 space-x-reverse">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>متصل</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700"
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                به دستیار هوشمند ایرانی خوش آمدید
              </h3>
              <p className="text-slate-600 max-w-md mx-auto mb-4">
                گفتگوی خود را شروع کنید و اجازه دهید هوش مصنوعی در هر سوال یا
                کاری که در ذهن دارید، به شما کمک کند.
              </p>
              <div className="flex items-center justify-center space-x-2 space-x-reverse mb-6">
                <span className="text-2xl">🇮🇷</span>
                <span className="text-slate-700 font-semibold">
                  ساخت ایران، کیفیت جهانی
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[
                  "کد بنویس",
                  "مفاهیم را توضیح بده",
                  "نوشتن خلاقانه",
                  "حل مسئله",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-slate-700 hover:text-slate-900 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 space-x-reverse animate-in slide-in-from-bottom-2 duration-500 ${
                message.role === "user"
                  ? "flex-row space-x-4"
                  : "flex-row-reverse space-x-reverse"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                  message.role === "user"
                    ? "bg-slate-600"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              <div
                className={`max-w-xs lg:max-w-2xl ${
                  message.role === "user" ? "text-left" : "text-right"
                }`}
              >
                <div
                  className={`px-6 py-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                    message.role === "user"
                      ? "bg-slate-600 border-slate-500 text-white"
                      : "bg-white border-slate-200 text-slate-800 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
                <p
                  className={`text-xs text-slate-400 mt-2 ${
                    message.role === "user" ? "text-left" : "text-right"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString("fa-IR")}
                </p>
              </div>
            </div>
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

        {/* Input */}
        <div className="p-6 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="پیام خود را بنویسید..."
                className="w-full p-4 pl-16 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                dir="rtl"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-400 text-xs mt-2 text-center">
              Enter را برای ارسال فشار دهید • هوش مصنوعی ممکن است اشتباه کند،
              اطلاعات مهم را تأیید کنید
            </p>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Resizing overlay */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}
    </div>
  );
}

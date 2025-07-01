import { useState, useEffect } from "react";
import { Sparkles, X, Plus, MessageCircle, Trash2 } from "lucide-react";
import { Chat } from "../types";

function getDateCategory(date: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date >= today) return "امروز";
  if (date >= yesterday) return "دیروز";
  return "قبلی‌ها";
}

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  sidebarOpen: boolean;
  sidebarWidth: number;
  onCreateNewChat: () => void;
  onSwitchToChat: (chatId: string) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
  onCloseSidebar: () => void;
  onSidebarWidthChange: (width: number) => void;
}
export default function ChatSidebar({
  chats,
  currentChatId,
  sidebarOpen,
  sidebarWidth,
  onCreateNewChat,
  onSwitchToChat,
  onDeleteChat,
  onCloseSidebar,
  onSidebarWidthChange,
}: ChatSidebarProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const filteredChats = chats.filter((chat) => {
    const term = searchTerm.toLowerCase();
    const inTitle = chat.title.toLowerCase().includes(term);
    const inMessages = chat.messages.some((msg) =>
      msg.content.toLowerCase().includes(term)
    );
    return inTitle || inMessages;
  });

  const groupedChats = filteredChats.reduce<Record<string, Chat[]>>(
    (groups, chat) => {
      const category = getDateCategory(
        chat.createdAt instanceof Date
          ? chat.createdAt
          : new Date(chat.createdAt)
      );
      if (!groups[category]) groups[category] = [];
      groups[category].push(chat);
      return groups;
    },
    {}
  );

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 250 && newWidth <= 500) {
        onSidebarWidthChange(newWidth);
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
  }, [isResizing, onSidebarWidthChange]);

  return (
    <>
      <style>
        {`
          .sidebar-dynamic-width {
            width: ${sidebarWidth}px;
          }
        `}
      </style>
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } fixed inset-y-0 right-0 z-50 bg-white border-l border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-lg lg:shadow-none sidebar-dynamic-width`}
      >
        {/* Resize Handle */}
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
            onClick={onCloseSidebar}
            className="lg:hidden text-slate-500 hover:text-slate-700"
            title="بستن منو"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={onCreateNewChat}
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

          <input
            type="text"
            placeholder="جستجو در گفتگوها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-4 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {["امروز", "دیروز", "قبلی‌ها"].map((category) => (
              <div key={category}>
                {groupedChats[category] &&
                  groupedChats[category].length > 0 && (
                    <>
                      <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {groupedChats[category].map((chat) => (
                          <div
                            key={chat.id}
                            onClick={() => onSwitchToChat(chat.id)}
                            className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                              currentChatId === chat.id
                                ? "bg-slate-100 text-slate-900 border border-slate-200"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <MessageCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
                              <span className="flex-1 text-sm truncate">
                                {chat.title}
                              </span>
                              <button
                                onClick={(e) => onDeleteChat(chat.id, e)}
                                className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 transition-opacity"
                                title="حذف گفتگو"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {chat.createdAt instanceof Date
                                ? chat.createdAt.toLocaleDateString("fa-IR")
                                : new Date(chat.createdAt).toLocaleDateString(
                                    "fa-IR"
                                  )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
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
            <span className="mt-2 pt-2 border-t border-slate-200">
              <p className="text-slate-500 text-xs">مدل: gpt-4o-mini</p>
              <p className="text-slate-500 text-xs flex items-center justify-center space-x-1 space-x-reverse">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>متصل</span>
              </p>
            </span>
          </div>
        </div>
      </div>

      {/* Resizing overlay */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}
    </>
  );
}

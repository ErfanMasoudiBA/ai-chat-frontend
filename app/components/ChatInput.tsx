import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  hasMessages: boolean;
}

export default function ChatInput({
  input,
  setInput,
  onSendMessage,
  isLoading,
  hasMessages,
}: ChatInputProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasMessages && !isTransitioning) {
      setIsTransitioning(true);
    }
  }, [hasMessages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Centered Input (اولین حالت)
  if (!hasMessages && !isTransitioning) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 z-10">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              دستیار هوشمند ایرانی
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              گفتگوی خود را شروع کنید و اجازه دهید هوش مصنوعی در هر سوال یا کاری
              که در ذهن دارید، به شما کمک کند
            </p>
          </div>

          {/* Input */}
          <div className="relative transform transition-all duration-700 ease-out">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="پیام خود را بنویسید..."
              className="w-full p-6 pl-20 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl text-slate-800 placeholder-slate-500 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 shadow-2xl text-lg"
              dir="rtl"
              disabled={isLoading}
              autoFocus
            />
            <button
              onClick={onSendMessage}
              disabled={isLoading || !input.trim()}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              "کد بنویس",
              "مفاهیم را توضیح بده",
              "نوشتن خلاقانه",
              "حل مسئله",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="px-6 py-3 bg-white/60 backdrop-blur-sm hover:bg-white/80 border border-slate-200/50 rounded-2xl text-slate-700 hover:text-slate-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Bottom Input (بعد از ارسال اولین پیام)
  return (
    <div
      className={`p-6 bg-white border-t border-slate-200 transition-all duration-700 ease-out ${
        isTransitioning ? "animate-in slide-in-from-bottom-8" : ""
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="پیام خود را بنویسید..."
            className="w-full p-4 pl-16 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            dir="rtl"
            disabled={isLoading}
          />
          <button
            onClick={onSendMessage}
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
  );
}

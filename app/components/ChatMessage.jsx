import { User, Bot } from "lucide-react";

export default function ChatMessage({ message, index }) {
  return (
    <div
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
  );
}

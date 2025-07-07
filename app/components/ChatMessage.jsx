import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

// Hook برای افکت تایپ‌شونده
function useTypewriter(text, speed = 30) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayText("");
    setIsComplete(false);

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}

export default function ChatMessage({ message, index }) {
  const isUser = message.role === "user";
  const Icon = isUser ? User : Bot;
  const content = message.content?.trim() || "";
  const isEn = isEnglish(content);

  // فقط برای پیام‌های دستیار از typewriter استفاده کنید
  const { displayText, isComplete } = useTypewriter(
    !isUser ? content : content,
    !isUser ? 30 : 0
  );

  // برای پیام‌های کاربر، بلافاصله نمایش داده شود
  const finalContent = isUser ? content : displayText;

  return (
    <div
      className={`flex items-start animate-in slide-in-from-bottom-2 duration-500 ${
        isUser ? "flex-row" : "flex-row-reverse"
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* آواتار */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
          isUser
            ? "bg-slate-700"
            : "bg-gradient-to-br from-indigo-500 to-purple-600"
        }`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* پیام */}
      <div
        className={`max-w-[80%] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-2 ${
          isUser ? "text-left" : "text-right"
        }`}
      >
        <div
          className={`px-5 py-3 rounded-3xl border transition-all duration-200 hover:shadow-md ${
            isUser
              ? "bg-slate-700 border-slate-500 text-white"
              : "bg-white border-slate-300 text-gray-900 shadow-sm dark:bg-slate-100 dark:text-gray-800"
          } dark:border-slate-300`}
        >
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => (
                <p
                  className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base"
                  dir={isEn ? "ltr" : "rtl"}
                  style={{ textAlign: isEn ? "left" : "right" }}
                  {...props}
                />
              ),
              code: ({ node, ...props }) => (
                <code
                  className="bg-slate-100 px-1 py-0.5 rounded text-pink-600 font-mono text-sm"
                  dir="ltr"
                  style={{ display: "inline-block", textAlign: "left" }}
                  {...props}
                />
              ),
              pre: ({ node, ...props }) => (
                <pre
                  className="bg-slate-100 p-3 rounded text-sm overflow-x-auto"
                  dir="ltr"
                  style={{ textAlign: "left" }}
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-indigo-600" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="italic text-purple-600" {...props} />
              ),
            }}
          >
            {finalContent}
          </ReactMarkdown>

          {/* نشانگر تایپ در حال انجام */}
          {!isUser && !isComplete && (
            <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse"></span>
          )}
        </div>

        {/* زمان */}
        <p
          className={`text-xs text-gray-400 mt-1 ${
            isUser ? "text-left" : "text-right"
          }`}
        >
          {new Date(message.timestamp || Date.now()).toLocaleTimeString(
            "fa-IR"
          )}
        </p>
      </div>
    </div>
  );
}

function isEnglish(text) {
  return /^[\x00-\x7F]*$/.test(text.replace(/\s/g, ""));
}

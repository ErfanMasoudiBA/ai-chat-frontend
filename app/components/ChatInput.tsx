import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, Square } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { toast } from "sonner";

// interface ChatInputProps {
//   input: string;
//   setInput: (value: string) => void;
//   onSendMessage: () => void;
//   isLoading: boolean;
//   hasMessages: boolean;
// }

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
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
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [transitioned, setTransitioned] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (hasMessages && !transitioned) {
      setTransitioned(true);
    }
  }, [hasMessages]);

  useEffect(() => {
    if (recognitionRef.current) return; // ✅ فقط یکبار مقداردهی

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "fa-IR";

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalTranscript += result[0].transcript;
        }
        if (finalTranscript) setInput((prev) => prev + finalTranscript + " ");
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsListening(false);
      };
    }
  }, [setInput]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const toggleRecording = () => {
    if (!speechSupported) {
      toast.error("مرورگر شما از ضبط صدا پشتیبانی نمی‌کند");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }

    setIsRecording(!isRecording);
  };

  const renderRecordingStatus = () =>
    isRecording && (
      <div className="text-center mt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full text-red-700 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          {isListening ? "در حال گوش دادن..." : "در حال ضبط..."}
        </div>
      </div>
    );

  const suggestions = [
    "کد بنویس",
    "مفاهیم را توضیح بده",
    "نوشتن خلاقانه",
    "حل مسئله",
  ];

  return !hasMessages && !transitioned ? (
    // 🟣 حالت شروع (مرکز صفحه)
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 z-10">
      <motion.div
        className="w-full max-w-3xl text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          className="text-4xl font-bold text-slate-800 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          دستیار هوشمند ایرانی
        </motion.h1>

        <motion.p
          className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          گفتگوی خود را شروع کنید و اجازه دهید هوش مصنوعی در هر سوال یا کاری به
          شما کمک کند.
        </motion.p>

        <motion.div
          className="relative transition-all"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {/* Input + Buttons */}
          <div className="relative transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="پیام خود را بنویسید یا روی میکروفون کلیک کنید..."
              className="w-full p-6 pl-32 text-lg text-slate-800 bg-white/80 border rounded-3xl backdrop-blur-sm shadow-2xl placeholder-slate-500 border-slate-200/50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
              dir="rtl"
              disabled={isLoading}
              autoFocus
            />

            {/* Mic */}
            {speechSupported && (
              <button
                onClick={toggleRecording}
                disabled={isLoading}
                className={clsx(
                  "absolute left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl transition-all flex items-center justify-center shadow-lg",
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-green-500 text-white hover:bg-green-600",
                  "hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                )}
              >
                {isRecording ? (
                  <Square className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Send */}
            <button
              onClick={onSendMessage}
              disabled={isLoading || !input.trim()}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {renderRecordingStatus()}
        </motion.div>

        {/* suggestions با انیمیشن */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="px-6 py-3 bg-white/60 backdrop-blur-sm hover:bg-white/80 border border-slate-200/50 rounded-2xl text-slate-700 hover:text-slate-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              {s}
            </button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  ) : (
    // ⚫ حالت پایین صفحه (بعد از اولین پیام)
    <div
      className={clsx(
        "p-6 bg-white border-t border-slate-200",
        transitioned && "animate-in slide-in-from-bottom-8"
      )}
    >
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="پیام خود را بنویسید یا روی میکروفون کلیک کنید..."
            className="w-full p-4 pl-28 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            dir="rtl"
            disabled={isLoading}
          />

          {/* Mic */}
          {speechSupported && (
            <button
              onClick={toggleRecording}
              disabled={isLoading}
              className={clsx(
                "absolute left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl shadow-md flex items-center justify-center",
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-green-500 text-white hover:bg-green-600",
                "hover:scale-105 transition-all duration-200 disabled:opacity-50"
              )}
            >
              {isRecording ? (
                <Square className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Send */}
          <button
            onClick={onSendMessage}
            disabled={isLoading || !input.trim()}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {renderRecordingStatus()}

        <p className="text-center text-slate-400 text-xs mt-2">
          Enter را برای ارسال فشار دهید • اطلاعات حساس را تأیید کنید
        </p>
      </div>
    </div>
  );
}

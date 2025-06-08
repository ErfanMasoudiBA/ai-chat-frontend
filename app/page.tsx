// app/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Settings, User, Bot, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ApiConfig {
  name: string;
  endpoint: string;
  apiKey: string;
  model: string;
  headers?: Record<string, string>;
}

const defaultConfigs: ApiConfig[] = [
  {
    name: "GapGPT API",
    endpoint: "https://api.gapgpt.app/v1/chat/completions",
    apiKey: "sk-W3PTTlGul9g2wPG2LPo7XX431HDY2v8Wl4KiHrWduVDMhG1x",
    model: "gpt-4o",
    headers: {
      "Content-Type": "application/json",
    },
  },
  {
    name: "OpenAI GPT",
    endpoint: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    model: "gpt-3.5-turbo",
    headers: {
      "Content-Type": "application/json",
    },
  },
  {
    name: "Anthropic Claude",
    endpoint: "https://api.anthropic.com/v1/messages",
    apiKey: "",
    model: "claude-3-sonnet-20240229",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
  },
  {
    name: "Custom API",
    endpoint: "",
    apiKey: "",
    model: "",
    headers: {},
  },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(0);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>(defaultConfigs);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const config = apiConfigs[selectedConfig];

      if (!config.apiKey || !config.endpoint) {
        throw new Error("Please configure API settings first");
      }

      // Format request based on API type
      let requestBody: any;
      let headers: Record<string, string> = {
        ...config.headers,
        Authorization: `Bearer ${config.apiKey}`,
      };

      if (config.name.includes("OpenAI") || config.name.includes("GapGPT")) {
        requestBody = {
          model: config.model,
          messages: messages.concat(userMessage).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          max_tokens: 1000,
          temperature: 0.7,
        };
      } else if (config.name.includes("Anthropic")) {
        headers["x-api-key"] = config.apiKey;
        delete headers["Authorization"];
        requestBody = {
          model: config.model,
          max_tokens: 1000,
          messages: messages.concat(userMessage).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        };
      } else {
        // Custom API - basic format
        requestBody = {
          model: config.model,
          messages: messages.concat(userMessage).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        };
      }

      const response = await fetch(config.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Extract response based on API type
      let assistantContent = "";
      if (config.name.includes("OpenAI") || config.name.includes("GapGPT")) {
        assistantContent = data.choices?.[0]?.message?.content || "No response";
      } else if (config.name.includes("Anthropic")) {
        assistantContent = data.content?.[0]?.text || "No response";
      } else {
        // Try common response formats
        assistantContent =
          data.choices?.[0]?.message?.content ||
          data.content?.[0]?.text ||
          data.response ||
          "No response received";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (
    index: number,
    field: keyof ApiConfig,
    value: string
  ) => {
    setApiConfigs((prev) =>
      prev.map((config, i) =>
        i === index ? { ...config, [field]: value } : config
      )
    );
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Settings Sidebar */}
      {showSettings && (
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">API Configuration</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select API Provider
              </label>
              <select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {apiConfigs.map((config, index) => (
                  <option key={index} value={index}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Config form for selected API */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Endpoint
                </label>
                <input
                  type="text"
                  value={apiConfigs[selectedConfig].endpoint}
                  onChange={(e) =>
                    updateConfig(selectedConfig, "endpoint", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="https://api.example.com/v1/chat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiConfigs[selectedConfig].apiKey}
                  onChange={(e) =>
                    updateConfig(selectedConfig, "apiKey", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="sk-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={apiConfigs[selectedConfig].model}
                  onChange={(e) =>
                    updateConfig(selectedConfig, "model", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="gpt-3.5-turbo"
                />
              </div>
            </div>

            <button
              onClick={clearChat}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold">AI Chat</h1>
            <span className="text-sm text-gray-500">
              {apiConfigs[selectedConfig].name}
            </span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Start a conversation with AI</p>
              <p className="text-sm mt-2">Configure your API settings first</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

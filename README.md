
# 🧠 AI Chat Interface with Conversations Panel

An elegant and modern React + TypeScript chat interface powered by OpenAI, designed with user experience in mind. The app provides a clean side panel for managing conversations, smooth animations for interaction, and persistent chat history stored locally.

## ✨ Features

- 🔥 Beautiful UI built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**
- 🧾 Persistent conversation list stored in `localStorage`
- 🗑️ Smooth delete animations for removing conversations
- 📂 Conversations grouped by date (Today, Yesterday, etc.)
- 📱 Responsive and clean design
- ⚙️ Easy to integrate with any backend or OpenAI API

## ⚙️ Installation


# 1. Clone the repo
git clone https://github.com/ErfanMasoudiBA/ai-chat-frontend.git
cd ai-chat-frontend

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev


Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧠 Technologies Used

- [Next.js 15](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI API](https://platform.openai.com/) (optional integration)

## 🚀 How It Works

- Conversations are stored in a local store and persisted via `localStorage`.
- When you delete a conversation, it first animates (fades/shrinks) before actually disappearing.
- Grouping is based on the date of last interaction (`Today`, `Yesterday`, etc.).
- `onSwitchToChat` sets the active chat ID and renders it in the main view.

## 🧹 Animations for Delete

Smooth animations are implemented using Tailwind’s utility classes like `transition`, `opacity`, and `transform`, giving users a sense of flow when deleting chats.

## 📦 Coming Soon

- 🔐 User authentication
- ☁️ Backend integration (Supabase / Firebase / custom backend)
- 📜 Chat message history
- 📤 Export conversations

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

Made with ❤️ by [ErfanMasoudiBA](https://github.com/ErfanMasoudiBA)
```

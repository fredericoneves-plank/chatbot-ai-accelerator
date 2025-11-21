# Chatbot AI Accelerator

A modern, sarcastic chatbot application built with Next.js, Supabase, and LangGraph. This project features an AI-powered conversational interface with tool integration for weather and news queries, persistent chat history, and user authentication.

## 🚀 Technologies Used

### Core Framework
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router for server-side rendering and API routes
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### AI & LLM
- **[LangGraph](https://github.com/langchain-ai/langgraph)** - Framework for building stateful, multi-actor applications with LLMs
- **[LangChain](https://js.langchain.com/)** - Framework for developing applications powered by language models
- **[Anthropic Claude](https://www.anthropic.com/claude)** - AI model (claude-sonnet-4-5-20250929) for conversational AI
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - Tools for building AI-powered applications

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service for authentication and PostgreSQL database
  - Authentication with Row Level Security (RLS)
  - PostgreSQL database for chat and message storage
  - Server-side client for secure data access

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives
  - Scroll Area
  - Separator
  - Label
  - Slot
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable components built with Radix UI and Tailwind CSS

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Supabase account** - [Sign up here](https://supabase.com/)
- **Anthropic API key** - [Get your API key](https://console.anthropic.com/)

### Optional (for tool functionality)
- **Weather API key** - [WeatherAPI.com](https://www.weatherapi.com/)
- **News API key** - [NewsAPI.org](https://newsapi.org/)

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic API Key (Required)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional: Tool API Keys
WEATHER_API_KEY=your_weather_api_key
NEWS_API_KEY=your_news_api_key
```

### Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**

## 📦 Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd chatbot-ai-accelerator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.local.example` to `.env.local` (if it exists) or create a new `.env.local` file
   - Fill in all required environment variables

4. **Set up the database**:
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**
   - Run the SQL script from `supabase/schema.sql` to create the necessary tables and policies

## 🗄️ Database Setup

The project uses Supabase PostgreSQL with the following schema:

### Tables
- **chats** - Stores conversation metadata (id, user_id, title, timestamps)
- **messages** - Stores individual messages (id, chat_id, role, content, timestamp)

### Security
- Row Level Security (RLS) is enabled on all tables
- Users can only access their own chats and messages
- Policies are automatically enforced by Supabase

To set up the database, run the SQL script in `supabase/schema.sql` in your Supabase SQL Editor.

## 🏃 Running the Project

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📁 Project Structure

```
chatbot-ai-accelerator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts          # Chat API endpoint
│   │   │   └── chats/
│   │   │       └── [chatId]/
│   │   │           └── messages/
│   │   │               └── route.ts   # Messages API endpoint
│   │   ├── chat/
│   │   │   └── page.tsx              # Chat interface page
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInput.tsx         # Message input component
│   │   │   ├── ChatMessages.tsx      # Messages display component
│   │   │   └── ChatSidebar.tsx       # Chat history sidebar
│   │   ├── LoginForm.tsx             # Authentication form
│   │   ├── Providers.tsx             # React context providers
│   │   └── ui/                       # Reusable UI components
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication context
│   ├── lib/
│   │   ├── langgraph/
│   │   │   ├── agent.ts              # LangGraph agent definition
│   │   │   ├── model.ts              # LLM model configuration
│   │   │   ├── nodes.ts              # Agent nodes (LLM, tools)
│   │   │   ├── runAgent.ts           # Agent execution logic
│   │   │   ├── state.ts              # Agent state management
│   │   │   └── tools.ts              # Available tools (weather, news)
│   │   └── supabase/
│   │       ├── client.ts             # Client-side Supabase client
│   │       ├── server.ts             # Server-side Supabase client
│   │       └── chat.ts               # Chat database operations
│   └── middleware.ts                 # Next.js middleware for auth
├── supabase/
│   └── schema.sql                    # Database schema and policies
├── components.json                   # shadcn/ui configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Project dependencies
```

## ✨ Features

- 🤖 **AI-Powered Conversations** - Powered by Anthropic Claude with a sarcastic personality
- 🔧 **Tool Integration** - Weather and news query capabilities
- 💬 **Chat History** - Persistent conversation history stored in Supabase
- 🔐 **User Authentication** - Secure authentication with Supabase Auth
- 📱 **Responsive Design** - Modern, mobile-friendly UI built with Tailwind CSS
- ⚡ **Real-time Streaming** - Stream AI responses in real-time using AI SDK
- 🎨 **Modern UI Components** - Built with Radix UI and shadcn/ui

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔍 How It Works

1. **User Authentication**: Users authenticate via Supabase Auth
2. **Chat Creation**: New chats are created automatically when users send their first message
3. **Message Processing**: User messages are sent to the LangGraph agent
4. **AI Agent**: The LangGraph agent processes messages using Claude, with optional tool calls for weather/news
5. **Streaming Response**: AI responses are streamed back to the client in real-time
6. **Persistence**: All messages are saved to Supabase for chat history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and proprietary.

## 🆘 Troubleshooting

### Common Issues

1. **Authentication errors**: Ensure your Supabase credentials are correct in `.env.local`
2. **Database errors**: Make sure you've run the SQL schema in your Supabase project
3. **API errors**: Verify your Anthropic API key is set correctly
4. **Tool errors**: Weather and news tools require their respective API keys (optional)

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Supabase documentation](https://supabase.com/docs)
- Consult [LangGraph documentation](https://langchain-ai.github.io/langgraph/)

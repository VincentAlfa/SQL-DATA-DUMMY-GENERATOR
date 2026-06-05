# SQL Dummy Data Generator

Generate realistic dummy data `INSERT` statements from your SQL schema using AI (powered by Google Gemini).

## Features

- Upload a `.sql` file or paste your schema directly
- Automatically detects tables and lets you configure record counts per table
- Add custom instructions per table for more targeted data generation
- Streams generated SQL in real time
- Schema analysis summary (collapsible)
- Copy to clipboard or download as a `.sql` file

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Bun](https://bun.sh/) (recommended) **or** npm/yarn
- A Google Gemini API key

### Installing Node.js

Download and install Node.js from the official site: https://nodejs.org/en/download

Choose the **LTS** version for your operating system. To verify the installation:

```bash
node -v
npm -v
```

### Installing Bun

Bun is a fast all-in-one JavaScript runtime and package manager. Install it with a single command:

**macOS / Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

To verify the installation:

```bash
bun -v
```

> Full installation docs: https://bun.sh/docs/installation

---

## Getting a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key — you'll need it in the next step

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up your environment variables

Create a `.env` file in the root of the project:

```bash
touch .env
```

Open `.env` and add your Gemini API key:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the key you copied from Google AI Studio.

---

## Running the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Building for Production

```bash
bun run build
bun start
```

---

## Usage

1. Choose your input method — **Upload File** (`.sql`) or **Paste Text**
2. Your tables will be detected automatically
3. Set the number of records to generate per table (default: 20)
4. Optionally add custom instructions per table (e.g. _"use Indonesian names"_, _"status must be active or inactive"_)
5. Click **Generate Dummy Data**
6. Copy the output or download it as a `.sql` file

---

## Environment Variables

| Variable | Description |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) |

---

## Tech Stack

- [Next.js 15](https://nextjs.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Google Gemini](https://ai.google.dev/) via `@ai-sdk/google` — `gemini-flash-lite-latest` model
- [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
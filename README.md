# Digital Heroes — Golf Performance & Charity Platform

A full-stack SaaS platform where golfers track their performance, support charities, and compete in monthly prize draws.

🔗 **Live:** [digital-heroes.vercel.app](https://digital-heroes.vercel.app)

---

## What it does

- User authentication and profile management
- Golf score tracking and performance analytics
- Charity selection — a portion of every entry goes to the player's chosen charity
- Monthly prize-draw engine for top performers
- 7-table PostgreSQL schema with Row Level Security

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | Supabase (PostgreSQL), REST APIs |
| Auth | Supabase Auth |
| Deployment | Vercel (zero-downtime) |

---

## Getting started

```bash
git clone https://github.com/venkatnarayana879-byte/digital-heroes
cd digital-heroes
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Built by

Velpuri Venkat Narayana — [Portfolio](https://venkat-aiml-portfolio.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/venkat-narayana-velpuri-7a08a0282/)

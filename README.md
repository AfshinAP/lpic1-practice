# LPIC-1 Practice Terminal

A LeetCode-style practice web app for the LPIC-1 certification. Every exam objective from **101.1 to 110.3** has hands-on challenges solved in a **simulated terminal**, based on the topics from [lpic1book](https://linux1st.com/archives.html).

## Features

- **42 modules / 230+ exercises** covering all LPIC-1 v5 objectives (topics 101–110)
- **Simulated shell** — type real Linux commands, get realistic output, with command history (arrow keys), `clear`, `help` and `hint` built in
- **Topic Challenges** — one locked, multi-step real-world sysadmin incident per topic (broken package manager, full disk, kernel module failure, …); unlocks after all exercises and quizzes in that topic are complete
- **Achievements** — badges for your first command, each module mastered, each topic championed, incident scenarios resolved, and completing the whole exam
- **Progress saved locally** — everything is stored in your browser's localStorage; no account or backend needed

## Getting started

```bash
npm install
npm run dev
```

Then open the printed URL (default `http://localhost:5173`).

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- localStorage for persistence

## Project layout

```
src/
├── data/          # modules, exercises and achievement definitions
├── hooks/         # useProgress (localStorage-backed state)
├── components/    # Terminal, cards, badges, toasts
└── pages/         # Home, ModulePage, ExercisePage, AchievementsPage
```

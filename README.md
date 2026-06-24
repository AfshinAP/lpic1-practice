# LPIC-1 Practice Terminal

Study for the LPIC-1 exam by actually typing commands. No multiple choice, no flashcards — just a LeetCode-style terminal in your browser where you solve real Linux problems.

Every objective from 101.1 to 110.3 has exercises. You type real commands and get realistic output.

## What's in it

- 42 modules, 230+ exercises covering the full LPIC-1 v5 (topics 101–110)
- A simulated shell with command history (arrow keys), `clear`, `help`, and `hint`
- Topic Challenges — realistic sysadmin incidents (broken package manager, full disk, kernel module failure…) that unlock when you finish the exercises for that topic
- Achievements and badges because hitting milestones feels good
- No sign-up, no backend — everything saves to your browser's localStorage

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and start with topic 101.1.

## Tech stack

React 19 + TypeScript + Vite, Tailwind CSS v4, React Router. State is all client-side via localStorage.

## Project layout

```
src/
├── data/         # modules, exercises, achievement definitions
├── hooks/        # useProgress (localStorage state)
├── components/   # Terminal, cards, badges, toasts
└── pages/        # Home, ModulePage, ExercisePage, AchievementsPage
```

The exam objectives are based on [lpic1book by linux1st.com](https://linux1st.com/archives.html) — good companion resource while you work through the exercises.

## Other stuff

Found a bug? Exercise output doesn't match what your real terminal gives you? Open an issue. PRs for new exercises or fixes are welcome too.

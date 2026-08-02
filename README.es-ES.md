

# Terminal de Práctica LPIC-1

Una aplicación web de práctica estilo LeetCode para la certificación LPIC-1. Cada objetivo del examen, desde **101.1 hasta 110.3**, cuenta con desafíos prácticos que se resuelven en un **terminal simulado**, basados en los temas de [lpic1book](https://linux1st.com/archives.html).

## Características

- **42 módulos / 230+ ejercicios** que cubren todos los objetivos del LPIC-1 v5 (temas 101–110)
- **Shell simulada** — escribe comandos reales de Linux y obtén salidas realistas, con historial de comandos (teclas de flecha), y `clear`, `help` y `hint` incorporados
- **Desafíos por tema** — un incidente real de administración de sistemas bloqueado y multietapa por tema (administrador de paquetes roto, disco lleno, fallo de módulo del kernel, …); se desbloquea una vez completados todos los ejercicios y cuestionarios de ese tema
- **Logros** — insignias por tu primer comando, cada módulo dominado, cada tema completado, escenarios de incidentes resueltos y por finalizar todo el examen
- **Progreso guardado localmente** — todo se almacena en el `localStorage` de tu navegador; no se necesita cuenta ni backend

## Cómo empezar

```bash
npm install
npm run dev
```

Luego, abre la URL mostrada (por defecto `http://localhost:5173`).

## Stack tecnológico

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- `localStorage` para la persistencia

## Estructura del proyecto

```
src/
├── data/          # definiciones de módulos, ejercicios y logros
├── hooks/         # useProgress (estado respaldado por localStorage)
├── components/    # Terminal, tarjetas, insignias, notificaciones
└── pages/         # Home, ModulePage, ExercisePage, AchievementsPage
```

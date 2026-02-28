# React + Vite Frontend Boilerplate

## 📁 Structure

```
src/
├── main.jsx                          # Entry — renders App inside BrowserRouter
├── App.jsx                           # Root — renders AppRoutes
├── styles/
│   └── index.css                     # Tailwind imports + global base + component classes
├── constants/
│   └── index.js                      # ROUTES, API_BASE_URL, APP_NAME — no magic strings
├── api/
│   ├── axiosInstance.js              # Base axios config, interceptors, error normalisation
│   └── index.js                      # Barrel export
├── services/
│   ├── auth.service.js               # API call functions — components never call axios directly
│   └── index.js                      # Barrel export
├── hooks/
│   ├── useAsync.js                   # Wraps any async function with loading/error/data state
│   ├── useLocalStorage.js            # Synced localStorage state
│   ├── useDocumentTitle.js           # Sets browser tab title per page
│   └── index.js
├── utils/
│   ├── formatters.js                 # formatDate, capitalize, truncate, formatCurrency
│   ├── validators.js                 # isValidEmail, isValidPassword, isEmpty
│   └── index.js
├── components/
│   ├── ui/                           # Pure, reusable UI primitives
│   │   ├── Button.jsx                # variant, size, loading state
│   │   ├── Input.jsx                 # label, error, disabled
│   │   ├── Spinner.jsx               # size variants
│   │   └── index.js
│   ├── layout/                       # App structure
│   │   ├── MainLayout.jsx            # Navbar + <Outlet /> + Footer
│   │   ├── Navbar.jsx                # Nav links with active state
│   │   └── index.js
│   └── shared/                       # Cross-feature components
│       ├── PageLoader.jsx
│       ├── ErrorMessage.jsx
│       └── index.js
├── pages/                            # One file per route
│   ├── HomePage.jsx
│   ├── DashboardPage.jsx
│   ├── AboutPage.jsx
│   ├── NotFoundPage.jsx
│   └── index.js
└── routes/
    └── AppRoutes.jsx                 # All routes defined in one place
```

## 🏛️ Data Flow

```
Page/Component
  → calls hook (useAsync)
  → hook calls service (auth.service.js)
  → service calls axiosInstance
  → axiosInstance hits backend API
  ↓ (on error)
  → interceptor normalises error
  → hook sets error state
  → component shows ErrorMessage
```

## 🚀 Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## ➕ Adding a New Feature (e.g. Courses)

1. `services/course.service.js`   — API call functions
2. `pages/CoursesPage.jsx`        — page component
3. `pages/index.js`               — export it
4. `constants/index.js`           — add route constant
5. `routes/AppRoutes.jsx`         — add `<Route>`
6. `components/layout/Navbar.jsx` — add nav link (optional)

## 📐 Rules

| Layer | Rule |
|---|---|
| **pages/** | One file per route. Uses hooks for data. No direct axios calls. |
| **components/ui/** | No API calls. No business logic. Pure props in → UI out. |
| **services/** | Only axios calls. Returns raw response. No state management. |
| **hooks/** | Wraps services with state. Reusable across pages. |
| **utils/** | Pure functions only. No imports from the app. |
| **constants/** | No logic. Just frozen values. |

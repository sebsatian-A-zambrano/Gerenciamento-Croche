import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,
      gcTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Do not auto-redirect to login on API errors when running in "no-auth" mode.
// The app is intentionally running without an auth gate for the simple CRUD use-case.

// Configure API base URL: allow overriding with VITE_API_BASE_URL in production.
const apiBase = (import.meta.env as any).VITE_API_BASE_URL ?? "";
const apiUrl = apiBase ? new URL(
  "/api/trpc",
  // ensure base is an absolute URL; fallback to relative path if invalid
  (() => {
    try {
      return String(apiBase) || window.location.origin;
    } catch {
      return window.location.origin;
    }
  })()
).toString() : "/api/trpc";

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiUrl,
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

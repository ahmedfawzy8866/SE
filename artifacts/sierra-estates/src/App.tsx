import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import Home from "@/pages/Home";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", color: "white" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "6rem", color: "var(--gold)", lineHeight: 1 }}>404</div>
        <div style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.5)", marginTop: "1rem" }}>Page not found</div>
        <button
          onClick={() => window.location.href = "/"}
          style={{ marginTop: "2rem", padding: "12px 28px", background: "linear-gradient(135deg,#C9A96E,#A07840)", color: "#0A0A0A", border: "none", borderRadius: 100, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

import ClientRequest from "@/pages/ClientRequest";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/request" component={ClientRequest} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <LanguageProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

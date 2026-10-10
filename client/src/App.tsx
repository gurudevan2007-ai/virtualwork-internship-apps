import { Route, Switch } from "wouter";
import TaskFrame from "./components/TaskFrame";
import Coffee from "./pages/Coffee";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Profiles from "./pages/Profiles";
import Quotes from "./pages/Quotes";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/notes">
        <TaskFrame task="notes"><Notes /></TaskFrame>
      </Route>
      <Route path="/profiles">
        <TaskFrame task="profiles"><Profiles /></TaskFrame>
      </Route>
      <Route path="/coffee">
        <TaskFrame task="coffee"><Coffee /></TaskFrame>
      </Route>
      <Route path="/quotes">
        <TaskFrame task="quotes"><Quotes /></TaskFrame>
      </Route>
      <Route path="/team">
        <TaskFrame task="team"><Team /></TaskFrame>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

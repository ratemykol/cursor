import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useRef } from "react";
import NotFound from "@/pages/not-found";

import { HomePage } from "@/pages/HomePage";
import { SearchPage } from "@/pages/SearchPage";
import { TraderProfilePage } from "@/pages/TraderProfilePage";
import { RatingPage } from "@/pages/RatingPage";
import { AdminPage } from "@/pages/AdminPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { SignInPage } from "@/pages/SignInPage";
import { UserProfilePage } from "@/pages/UserProfilePage";

function Router() {
  const [location] = useLocation();
  const previousLocation = useRef(location);

  // Autorefresh: Invalidate all queries when location changes
  useEffect(() => {
    if (previousLocation.current !== location) {
      // Invalidate all cached queries to ensure fresh data on page switches
      queryClient.invalidateQueries();
      previousLocation.current = location;
    }
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/trader/:id" component={TraderProfilePage} />
      <Route path="/trader/:id/rate" component={RatingPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="/signin" component={SignInPage} />
      <Route path="/profile" component={UserProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

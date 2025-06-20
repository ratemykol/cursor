import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface AppError {
  id: string;
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  retryAction?: () => void;
}

export function useErrorHandler() {
  const [errors, setErrors] = useState<AppError[]>([]);
  const { toast } = useToast();

  const addError = useCallback((error: Omit<AppError, "id" | "timestamp">) => {
    const newError: AppError = {
      ...error,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setErrors(prev => [...prev, newError]);

    // Show toast for immediate feedback
    if (error.severity === "critical" || error.severity === "error") {
      toast({
        title: error.title,
        description: error.message,
        variant: "destructive",
      });
    } else if (error.severity === "warning") {
      toast({
        title: error.title,
        description: error.message,
      });
    }

    return newError.id;
  }, [toast]);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleApiError = useCallback((error: any, context?: string) => {
    let severity: AppError["severity"] = "error";
    let title = "Request Failed";
    let message = "An error occurred while processing your request.";

    if (error?.status === 401) {
      severity = "warning";
      title = "Authentication Required";
      message = "Please sign in to continue.";
    } else if (error?.status === 403) {
      severity = "warning";
      title = "Access Denied";
      message = "You don't have permission to perform this action.";
    } else if (error?.status === 404) {
      severity = "info";
      title = "Not Found";
      message = "The requested resource could not be found.";
    } else if (error?.status === 429) {
      severity = "warning";
      title = "Rate Limited";
      message = "Too many requests. Please wait before trying again.";
    } else if (error?.status >= 500) {
      severity = "critical";
      title = "Server Error";
      message = "A server error occurred. Our team has been notified.";
    } else if (error?.message) {
      message = error.message;
    }

    return addError({
      severity,
      title,
      message,
      context: { error, context },
    });
  }, [addError]);

  const handleNetworkError = useCallback(() => {
    return addError({
      severity: "critical",
      title: "Network Error",
      message: "Unable to connect to the server. Please check your internet connection and try again.",
      retryAction: () => window.location.reload(),
    });
  }, [addError]);

  const handleValidationError = useCallback((field: string, message: string) => {
    return addError({
      severity: "warning",
      title: "Validation Error",
      message: `${field}: ${message}`,
      context: { field },
    });
  }, [addError]);

  return {
    errors,
    addError,
    removeError,
    clearAllErrors,
    handleApiError,
    handleNetworkError,
    handleValidationError,
  };
}
import React from "react";
import { AlertCircle, AlertTriangle, XCircle, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

interface ErrorStateProps {
  severity: ErrorSeverity;
  title: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  retryLabel?: string;
  dismissLabel?: string;
}

const errorConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-900 dark:text-blue-100",
    messageColor: "text-blue-700 dark:text-blue-300",
    buttonColor: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    titleColor: "text-yellow-900 dark:text-yellow-100",
    messageColor: "text-yellow-700 dark:text-yellow-300",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700 text-white",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-900 dark:text-red-100",
    messageColor: "text-red-700 dark:text-red-300",
    buttonColor: "bg-red-600 hover:bg-red-700 text-white",
  },
  critical: {
    icon: XCircle,
    bgColor: "bg-red-100 dark:bg-red-950/40",
    borderColor: "border-red-400 dark:border-red-700",
    iconColor: "text-red-700 dark:text-red-300",
    titleColor: "text-red-900 dark:text-red-100",
    messageColor: "text-red-800 dark:text-red-200",
    buttonColor: "bg-red-700 hover:bg-red-800 text-white",
  },
};

export function ErrorState({
  severity = "error",
  title,
  message,
  onRetry,
  onDismiss,
  className,
  showIcon = true,
  retryLabel = "Try Again",
  dismissLabel = "Dismiss",
}: ErrorStateProps) {
  const config = errorConfig[severity];
  const IconComponent = config.icon;

  return (
    <Card className={cn(
      "border-2",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {showIcon && (
            <div className="flex-shrink-0">
              <IconComponent className={cn("h-6 w-6", config.iconColor)} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className={cn("text-lg font-semibold", config.titleColor)}>
              {title}
            </h3>
            <p className={cn("mt-2 text-sm", config.messageColor)}>
              {message}
            </p>
            
            {(onRetry || onDismiss) && (
              <div className="mt-4 flex space-x-3">
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    className={cn("text-sm", config.buttonColor)}
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {retryLabel}
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    onClick={onDismiss}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    {dismissLabel}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact inline error state for smaller spaces
export function InlineErrorState({
  severity = "error",
  message,
  onRetry,
  className,
}: Pick<ErrorStateProps, "severity" | "message" | "onRetry" | "className">) {
  const config = errorConfig[severity];
  const IconComponent = config.icon;

  return (
    <div className={cn(
      "flex items-center space-x-2 p-3 rounded-lg border",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <IconComponent className={cn("h-4 w-4 flex-shrink-0", config.iconColor)} />
      <span className={cn("text-sm flex-1", config.messageColor)}>
        {message}
      </span>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className={cn("h-6 w-6 p-0", config.iconColor)}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Full-page error state for critical failures
export function FullPageErrorState({
  severity = "error",
  title,
  message,
  onRetry,
  className,
}: Pick<ErrorStateProps, "severity" | "title" | "message" | "onRetry" | "className">) {
  const config = errorConfig[severity];
  const IconComponent = config.icon;

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      config.bgColor,
      className
    )}>
      <div className="text-center max-w-md">
        <IconComponent className={cn("h-16 w-16 mx-auto mb-4", config.iconColor)} />
        <h1 className={cn("text-2xl font-bold mb-2", config.titleColor)}>
          {title}
        </h1>
        <p className={cn("text-base mb-6", config.messageColor)}>
          {message}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            className={cn("text-base px-6 py-2", config.buttonColor)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
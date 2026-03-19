import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Send,
  PlayCircle,
  CheckCheck,
} from "lucide-react";
import type { EnhancedBookingStatus } from "@/types/booking-enhanced";

interface TimelineStep {
  key: string;
  label: { vi: string; en: string };
  icon: React.ReactNode;
  timestamp?: string;
  status: "completed" | "current" | "pending";
}

interface BookingTimelineProps {
  status: EnhancedBookingStatus;
  confirmedAt?: string;
  planSentAt?: string;
  planAcceptedAt?: string;
  sessionStartedAt?: string;
  completedAt?: string;
  lang?: "vi" | "en";
  variant?: "horizontal" | "vertical";
  className?: string;
}

export function BookingTimeline({
  status,
  confirmedAt,
  planSentAt,
  sessionStartedAt,
  completedAt,
  lang = "vi",
  variant = "horizontal",
  className,
}: BookingTimelineProps) {
  // Define timeline steps based on booking flow
  const steps: TimelineStep[] = [
    {
      key: "pending",
      label: { vi: "Chờ xác nhận", en: "Pending" },
      icon: <Clock className="h-5 w-5" />,
      timestamp: undefined,
      status: "completed", // Always completed since booking was created
    },
    {
      key: "confirmed",
      label: { vi: "Đã xác nhận", en: "Confirmed" },
      icon: <CheckCircle2 className="h-5 w-5" />,
      timestamp: confirmedAt,
      status: getStepStatus(status, [
        "Confirmed",
        "TutorPreparingPlan",
        "PlanSent",
        "InProgress",
        "Completed",
      ]),
    },
    {
      key: "planSent",
      label: { vi: "Kế hoạch đã gửi", en: "Plan Sent" },
      icon: <Send className="h-5 w-5" />,
      timestamp: planSentAt,
      status: getStepStatus(status, ["PlanSent", "InProgress", "Completed"]),
    },
    {
      key: "inProgress",
      label: { vi: "Đang học", en: "In Session" },
      icon: <PlayCircle className="h-5 w-5" />,
      timestamp: sessionStartedAt,
      status: getStepStatus(status, ["InProgress", "Completed"]),
    },
    {
      key: "completed",
      label: { vi: "Hoàn thành", en: "Completed" },
      icon: <CheckCheck className="h-5 w-5" />,
      timestamp: completedAt,
      status: getStepStatus(status, ["Completed"]),
    },
  ];

  if (variant === "vertical") {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => (
          <div key={step.key} className="flex gap-4">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  step.status === "completed" &&
                    "bg-primary text-primary-foreground",
                  step.status === "current" &&
                    "bg-primary/20 text-primary ring-2 ring-primary",
                  step.status === "pending" && "bg-muted text-muted-foreground",
                )}
              >
                {step.icon}
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-8",
                    step.status === "completed" ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>

            {/* Content column */}
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2 mb-1">
                <p
                  className={cn(
                    "font-medium",
                    step.status === "completed" && "text-foreground",
                    step.status === "current" && "text-primary",
                    step.status === "pending" && "text-muted-foreground",
                  )}
                >
                  {step.label[lang]}
                </p>
                {step.status === "current" && (
                  <Badge variant="secondary" className="text-xs">
                    {lang === "vi" ? "Hiện tại" : "Current"}
                  </Badge>
                )}
              </div>
              {step.timestamp && (
                <p className="text-sm text-muted-foreground">
                  {formatTimestamp(step.timestamp, lang)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            {/* Step */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                  step.status === "completed" &&
                    "bg-primary text-primary-foreground",
                  step.status === "current" &&
                    "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2",
                  step.status === "pending" && "bg-muted text-muted-foreground",
                )}
              >
                {step.icon}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-xs md:text-sm font-medium mb-1",
                    step.status === "completed" && "text-foreground",
                    step.status === "current" && "text-primary",
                    step.status === "pending" && "text-muted-foreground",
                  )}
                >
                  {step.label[lang]}
                </p>
                {step.timestamp && (
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {formatTimestamp(step.timestamp, lang)}
                  </p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 transition-colors",
                  step.status === "completed" ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Helper to determine step status
function getStepStatus(
  currentStatus: EnhancedBookingStatus,
  completedStatuses: EnhancedBookingStatus[],
): "completed" | "current" | "pending" {
  if (completedStatuses.includes(currentStatus)) {
    // If current status is the last in the list, it's current
    if (currentStatus === completedStatuses[completedStatuses.length - 1]) {
      return "current";
    }
    return "completed";
  }
  return "pending";
}

// Helper to format timestamp
function formatTimestamp(timestamp: string, lang: "vi" | "en"): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  };

  return date.toLocaleString(lang === "vi" ? "vi-VN" : "en-US", options);
}

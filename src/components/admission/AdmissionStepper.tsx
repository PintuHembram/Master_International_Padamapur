import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "Application" },
  { num: 2, label: "Documents" },
  { num: 3, label: "Assessment" },
  { num: 4, label: "Payment" },
  { num: 5, label: "Enrollment" },
];

interface Props {
  currentStep: number;
  highestCompleted?: number;
  onStepClick?: (step: number) => void;
}

export const AdmissionStepper = ({ currentStep, highestCompleted = 0, onStepClick }: Props) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {STEPS.map((s, idx) => {
          const isComplete = s.num < currentStep || s.num <= highestCompleted;
          const isActive = s.num === currentStep;
          const clickable = onStepClick && (isComplete || isActive);
          return (
            <div key={s.num} className="flex flex-1 items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick!(s.num)}
                className={cn(
                  "flex flex-col items-center gap-2 transition-colors",
                  clickable && "cursor-pointer hover:opacity-80",
                  !clickable && "cursor-default",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors md:h-12 md:w-12",
                    isComplete && "border-primary bg-primary text-primary-foreground",
                    isActive && !isComplete && "border-primary bg-background text-primary",
                    !isActive && !isComplete && "border-muted bg-background text-muted-foreground",
                  )}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : s.num}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium md:block",
                    (isActive || isComplete) ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors",
                    s.num < currentStep || s.num < highestCompleted
                      ? "bg-primary"
                      : "bg-muted",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground md:hidden">
        Step {currentStep} of 5: <span className="font-medium text-foreground">{STEPS[currentStep - 1]?.label}</span>
      </p>
    </div>
  );
};

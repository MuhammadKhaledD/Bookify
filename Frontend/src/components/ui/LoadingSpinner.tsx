import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    size?: number;
    text?: string;
}

export const LoadingSpinner = ({ className, size = 32, text }: LoadingSpinnerProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3 p-4", className)}>
            <Loader2
                className="animate-spin text-primary"
                size={size}
            />
            {text && (
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

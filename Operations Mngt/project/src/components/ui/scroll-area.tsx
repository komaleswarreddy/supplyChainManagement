import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
  scrollBarClassName?: string;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    { className, orientation = "vertical", scrollBarClassName, children, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-auto",
        orientation === "vertical" ? "max-h-full" : "max-w-full",
        className
      )}
      {...props}
    >
      {children}
      {/* Custom scrollbar styling can be added here if needed */}
    </div>
  )
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
export default ScrollArea; 
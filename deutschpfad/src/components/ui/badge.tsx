import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Level } from "@/lib/types";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-muted text-muted-foreground",
        outline: "border-border text-foreground",
        success: "border-transparent bg-success/12 text-success",
        warning: "border-transparent bg-warning/14 text-warning",
        danger: "border-transparent bg-destructive/12 text-destructive",
        accent: "border-transparent bg-accent/12 text-accent",
        solid: "border-transparent bg-foreground text-background",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const levelStyles: Record<Level, string> = {
  A1: "bg-a1/12 text-a1 border-a1/25",
  A2: "bg-a2/12 text-a2 border-a2/25",
  B1: "bg-b1/12 text-b1 border-b1/25",
  B2: "bg-b2/12 text-b2 border-b2/25",
};

function LevelBadge({
  level,
  className,
  label,
}: {
  level: Level;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums",
        levelStyles[level],
        className,
      )}
    >
      {level}
      {label ? <span className="font-normal opacity-80">· {label}</span> : null}
    </span>
  );
}

export { Badge, badgeVariants, LevelBadge, levelStyles };

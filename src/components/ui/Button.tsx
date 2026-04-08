import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "destructive";
  size?: "l" | "s";
};

export default function Button({
  children,
  className,
  variant = "primary",
  size = "l",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "btn",
        size === "l" ? "btn-l" : "btn-s",
        variant === "primary" && "btn-primary hover:btn-primary-hover",
        variant === "secondary" && "btn-secondary hover:btn-secondary-hover",
        variant === "destructive" && "btn-danger hover:btn-danger-hover",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
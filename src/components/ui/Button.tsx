import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function Button({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
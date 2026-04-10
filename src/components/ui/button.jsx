import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#95ff00] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#95ff00] text-[#0c0e11] hover:bg-[#95ff00]/90 hover:ring-2 hover:ring-[#95ff00]/50 hover:ring-offset-2 hover:ring-offset-[#0a0a0a]",
        destructive:
          "bg-red-500 text-white hover:bg-red-500/90",
        outline:
          "border border-white/10 bg-transparent text-white hover:border-[#95ff00]/40 hover:text-[#95ff00]",
        secondary:
          "bg-neutral-800 text-white hover:bg-neutral-700",
        ghost:
          "text-white hover:bg-white/5 hover:text-[#95ff00]",
        link:
          "text-[#95ff00] underline-offset-4 hover:underline",
        expandIcon:
          "group relative bg-[#95ff00] text-[#0c0e11] hover:bg-[#95ff00]/90",
        ringHover:
          "bg-[#95ff00] text-[#0c0e11] transition-all duration-300 hover:bg-[#95ff00]/90 hover:ring-2 hover:ring-[#95ff00]/70 hover:ring-offset-2 hover:ring-offset-[#0a0a0a]",
        shine:
          "text-[#0c0e11] animate-shine bg-gradient-to-r from-[#95ff00] via-[#95ff00]/75 to-[#95ff00] bg-[length:400%_100%]",
        gooeyRight:
          "relative bg-[#95ff00] text-[#0c0e11] z-0 overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-gradient-to-r from-[#0c0e11] before:transition-transform before:duration-1000 hover:before:translate-x-[0%] hover:before:translate-y-[0%]",
        gooeyLeft:
          "relative bg-[#95ff00] text-[#0c0e11] z-0 overflow-hidden transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-gradient-to-l from-[#0c0e11] after:transition-transform after:duration-1000 hover:after:translate-x-[0%] hover:after:translate-y-[0%]",
        linkHover1:
          "relative after:absolute after:bg-[#95ff00] after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300",
        linkHover2:
          "relative after:absolute after:bg-[#95ff00] after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, Icon, iconPlacement, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    if (!Icon) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size }), className)}
          ref={ref}
          {...props}
        >
          {props.children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {Icon && iconPlacement === "left" && (
          <div className="w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:pr-2 group-hover:opacity-100">
            <Icon />
          </div>
        )}
        <Slottable>{props.children}</Slottable>
        {Icon && iconPlacement === "right" && (
          <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:pl-2 group-hover:opacity-100">
            <Icon />
          </div>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;

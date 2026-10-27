const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium " +
  "transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45";

const variants = {
  primary:
    "bg-linear-to-b from-accent-from to-accent-to text-white shadow-[0_6px_16px_-6px_rgb(168_77_47/0.7)] " +
    "hover:shadow-[0_8px_22px_-6px_rgb(168_77_47/0.8)] hover:brightness-110",
  secondary: "bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "text-danger hover:bg-surface-2",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function buttonClass({ variant = "secondary", size = "md", className = "" } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

export default function Button({ variant, size, className, type = "button", ...props }) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...props} />;
}

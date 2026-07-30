import { cn } from "../../utils/cn";


interface ButtonProps {
  children: React.ReactNode;
  className?: string;
}


export default function Button({
  children,
  className
}: ButtonProps) {

  return (
    <button
      className={cn(
        "px-6 py-3 rounded-xl",
        "bg-gradient-to-r from-blue-500 to-purple-600",
        "text-white font-semibold",
        "hover:scale-105",
        "transition duration-300",
        className
      )}
    >
      {children}
    </button>
  );
}
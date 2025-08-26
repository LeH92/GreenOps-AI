import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold text-xl text-primary">
      <span className="text-2xl">🌱</span>
      <span className="hidden group-data-[collapsible=icon]:hidden">GreenOps AI</span>
    </div>
  );
}

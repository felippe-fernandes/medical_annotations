import Link from "next/link";

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <span className="text-3xl">🩺</span>
      <div className="flex flex-col">
        <span className="font-bold text-lg text-slate-100">Med Notes</span>
        <span className="text-xs text-slate-400">Anotações Médicas</span>
      </div>
    </Link>
  );
}

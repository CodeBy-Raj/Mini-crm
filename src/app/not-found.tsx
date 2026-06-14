import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-white font-sans">
      <h2 className="text-xl font-bold">Page Not Found</h2>
      <p className="text-sm text-zinc-400 mt-2">Could not find requested resource</p>
      <Link href="/" className="text-blue-400 hover:underline mt-4 text-xs font-mono">
        Return Home
      </Link>
    </div>
  );
}

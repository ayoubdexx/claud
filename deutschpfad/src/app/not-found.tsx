import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <Compass className="size-12 text-muted-foreground" />
      <div>
        <p className="font-display text-5xl font-semibold tracking-[-0.03em]">404</p>
        <h1 className="mt-2 font-display text-xl font-semibold">Diese Seite gibt es nicht</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you are looking for has moved or never existed. Try the dashboard or search the whole platform.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/dashboard">
            <Home /> Dashboard
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search">
            <Search /> Search
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/courses">Courses A1–B2</Link>
        </Button>
      </div>
    </div>
  );
}

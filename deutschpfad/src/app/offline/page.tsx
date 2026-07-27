import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <WifiOff className="size-10 text-muted-foreground" />
      <h1 className="font-display text-2xl font-semibold">You are offline</h1>
      <p className="max-w-md text-muted-foreground">
        Pages you already opened stay available, and your flashcards, notes and progress are stored on this device.
        Reconnect to sync and to load new content.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}

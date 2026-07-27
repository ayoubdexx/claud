"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLearner } from "@/lib/store";

export function BookmarkButton({
  id,
  kind,
  title,
  href,
  withLabel = false,
}: {
  id: string;
  kind: string;
  title: string;
  href: string;
  withLabel?: boolean;
}) {
  const { isBookmarked, toggleBookmark } = useLearner();
  const active = isBookmarked(id);

  return (
    <Button
      variant={active ? "secondary" : "outline"}
      size={withLabel ? "sm" : "icon-sm"}
      aria-pressed={active}
      aria-label={active ? "Remove bookmark" : "Add bookmark"}
      onClick={() => {
        toggleBookmark({ id, kind, title, href });
        toast[active ? "info" : "success"](active ? "Bookmark removed" : "Bookmarked", {
          description: title,
        });
      }}
    >
      {active ? <BookmarkCheck /> : <Bookmark />}
      {withLabel ? (active ? "Saved" : "Save") : null}
    </Button>
  );
}

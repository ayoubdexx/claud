"use client";

import { useEffect } from "react";
import { useLearner } from "@/lib/store";

/** Marks a grammar topic as studied for achievements and statistics. */
export function GrammarStudied({ slug }: { slug: string }) {
  const { dispatch } = useLearner();

  useEffect(() => {
    dispatch({ type: "grammar-studied", slug });
    dispatch({ type: "log-session", minutes: 5, xp: 3 });
  }, [dispatch, slug]);

  return null;
}

"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Lightbulb, Mic, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AudioButton } from "@/components/learn/audio-button";
import { checkExercise, exerciseTypeLabels, summarise, type AnswerValue, type ExerciseResult } from "@/lib/exercises";
import { useSpeechRecognition } from "@/lib/speech";
import { useLearner } from "@/lib/store";
import type { Exercise } from "@/lib/types";
import { cn, shuffleWithSeed, hashString } from "@/lib/utils";

/* ----------------------------- single item ------------------------------ */

function MultipleChoice({
  exercise,
  value,
  onChange,
  disabled,
  result,
}: {
  exercise: Extract<Exercise, { type: "multiple-choice" }>;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  disabled: boolean;
  result?: ExerciseResult;
}) {
  return (
    <div className="grid gap-2">
      {exercise.options.map((option, index) => {
        const selected = Number(value) === index;
        const isAnswer = index === exercise.answerIndex;
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(index)}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ease-apple",
              selected ? "border-primary bg-primary/5" : "border-border hover:border-ring",
              result && isAnswer && "border-success bg-success/10",
              result && selected && !isAnswer && "border-destructive bg-destructive/10",
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                selected ? "border-primary text-primary" : "border-border text-muted-foreground",
              )}
            >
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1">{option}</span>
            {result && isAnswer ? <Check className="size-4 text-success" /> : null}
            {result && selected && !isAnswer ? <X className="size-4 text-destructive" /> : null}
          </button>
        );
      })}
    </div>
  );
}

function TrueFalse({
  exercise,
  value,
  onChange,
  disabled,
  result,
}: {
  exercise: Extract<Exercise, { type: "true-false" }>;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  disabled: boolean;
  result?: ExerciseResult;
}) {
  const options = [
    { label: "Richtig", value: true },
    { label: "Falsch", value: false },
  ];
  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const selected = value === option.value;
        const isAnswer = exercise.answer === option.value;
        return (
          <button
            key={option.label}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
              selected ? "border-primary bg-primary/5" : "border-border hover:border-ring",
              result && isAnswer && "border-success bg-success/10",
              result && selected && !isAnswer && "border-destructive bg-destructive/10",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FillBlank({
  exercise,
  value,
  onChange,
  disabled,
  result,
}: {
  exercise: Extract<Exercise, { type: "fill-blank" }>;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  disabled: boolean;
  result?: ExerciseResult;
}) {
  const values = Array.isArray(value) ? (value as string[]) : exercise.answers.map(() => "");
  const parts = exercise.sentence.split("___");

  return (
    <div className="space-y-3">
      <p className="flex flex-wrap items-baseline gap-1.5 text-[15px] leading-8">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 ? (
              <Input
                value={values[index] ?? ""}
                disabled={disabled}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = event.target.value;
                  onChange(next);
                }}
                aria-label={`Gap ${index + 1}`}
                className={cn(
                  "inline-block h-9 w-32 px-2 text-center",
                  result?.detail?.[index] === true && "border-success bg-success/5",
                  result?.detail?.[index] === false && "border-destructive bg-destructive/5",
                )}
              />
            ) : null}
          </React.Fragment>
        ))}
      </p>
      {exercise.hint && !result ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lightbulb className="size-3.5" /> {exercise.hint}
        </p>
      ) : null}
    </div>
  );
}

function OrderTokens({
  exercise,
  value,
  onChange,
  disabled,
}: {
  exercise: Extract<Exercise, { type: "order" }>;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  disabled: boolean;
}) {
  const chosen = Array.isArray(value) ? (value as string[]) : [];
  const pool = React.useMemo(
    () => shuffleWithSeed(exercise.tokens, hashString(exercise.id)),
    [exercise.tokens, exercise.id],
  );
  const remaining = pool.filter((token) => {
    const usedCount = chosen.filter((item) => item === token).length;
    const poolCount = pool.filter((item) => item === token).length;
    return usedCount < poolCount;
  });

  return (
    <div className="space-y-3">
      <div className="min-h-[52px] rounded-xl border border-dashed border-border bg-surface p-3">
        {chosen.length ? (
          <div className="flex flex-wrap gap-2">
            {chosen.map((token, index) => (
              <button
                key={`${token}-${index}`}
                type="button"
                disabled={disabled}
                onClick={() => onChange(chosen.filter((_, i) => i !== index))}
                className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
              >
                {token}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tap the words in the correct order…</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {remaining.map((token, index) => (
          <button
            key={`${token}-pool-${index}`}
            type="button"
            disabled={disabled}
            onClick={() => onChange([...chosen, token])}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-ring"
          >
            {token}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchPairs({
  exercise,
  value,
  onChange,
  disabled,
  result,
}: {
  exercise: Extract<Exercise, { type: "match" }>;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  disabled: boolean;
  result?: ExerciseResult;
}) {
  const map = (value ?? {}) as Record<string, string>;
  const options = React.useMemo(
    () => shuffleWithSeed(exercise.pairs.map((pair) => pair.right), hashString(exercise.id)),
    [exercise.pairs, exercise.id],
  );

  return (
    <div className="space-y-2">
      {exercise.pairs.map((pair, index) => (
        <div key={pair.left} className="flex flex-wrap items-center gap-2 rounded-xl border border-border p-2.5">
          <span className="min-w-[8rem] flex-1 text-sm font-medium">{pair.left}</span>
          <select
            disabled={disabled}
            value={map[pair.left] ?? ""}
            onChange={(event) => onChange({ ...map, [pair.left]: event.target.value })}
            className={cn(
              "h-9 flex-1 rounded-lg border border-input bg-background px-2 text-sm",
              result?.detail?.[index] === true && "border-success",
              result?.detail?.[index] === false && "border-destructive",
            )}
          >
            <option value="">— choose —</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function SpeakingItem({
  exercise,
  value,
  onChange,
  result,
}: {
  exercise: Extract<Exercise, { type: "speaking" }>;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  result?: ExerciseResult;
}) {
  const { start, stop, listening, transcript, error, supported } = useSpeechRecognition();

  React.useEffect(() => {
    if (transcript) onChange(transcript);
  }, [transcript, onChange]);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-surface p-3.5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Target sentence</p>
        <div className="mt-1 flex items-start gap-2">
          <AudioButton text={exercise.target} />
          <p className="font-medium">{exercise.target}</p>
        </div>
        {exercise.translation ? (
          <p className="mt-1 text-sm text-muted-foreground">{exercise.translation}</p>
        ) : null}
      </div>

      {supported ? (
        <Button variant={listening ? "destructive" : "default"} onClick={() => (listening ? stop() : start())}>
          <Mic /> {listening ? "Stop recording" : "Record your answer"}
        </Button>
      ) : (
        <Textarea
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Speech recognition is unavailable — type what you would say."
        />
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {value ? (
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">You said</p>
          <p className="mt-1 text-sm">{String(value)}</p>
          {result ? (
            <div className="mt-2">
              <Progress value={Math.round(result.score * 100)} className="h-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">
                Match: {Math.round(result.score * 100)}% {result.correct ? "— well done!" : "— try again slower."}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {exercise.tips?.length ? (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {exercise.tips.map((tip) => (
            <li key={tip}>· {tip}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function WritingItem({
  exercise,
  value,
  onChange,
  result,
}: {
  exercise: Extract<Exercise, { type: "writing" }>;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  result?: ExerciseResult;
}) {
  const text = String(value ?? "");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(event) => onChange(event.target.value)}
        rows={8}
        placeholder="Schreiben Sie hier auf Deutsch…"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {words} / {exercise.minWords} words
        </span>
        <Progress value={Math.min(100, (words / exercise.minWords) * 100)} className="ml-3 h-1.5 w-32" />
      </div>
      <ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        {exercise.checklist.map((item) => (
          <li key={item} className="flex items-start gap-1.5">
            <Check className="mt-0.5 size-3 shrink-0 text-primary" /> {item}
          </li>
        ))}
      </ul>
      {result ? (
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Model answer</p>
          <p className="mt-1 whitespace-pre-line text-sm">{exercise.sampleAnswer}</p>
        </div>
      ) : null}
    </div>
  );
}

export function ExerciseItem({
  exercise,
  value,
  onChange,
  result,
  disabled = false,
}: {
  exercise: Exercise;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  result?: ExerciseResult;
  disabled?: boolean;
}) {
  const locked = disabled || Boolean(result);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[15px] font-medium leading-relaxed">{exercise.prompt}</p>
        <Badge variant="secondary" className="shrink-0">
          {exerciseTypeLabels[exercise.type]}
        </Badge>
      </div>

      {exercise.type === "multiple-choice" ? (
        <MultipleChoice exercise={exercise} value={value} onChange={onChange} disabled={locked} result={result} />
      ) : null}
      {exercise.type === "true-false" ? (
        <TrueFalse exercise={exercise} value={value} onChange={onChange} disabled={locked} result={result} />
      ) : null}
      {exercise.type === "fill-blank" ? (
        <FillBlank exercise={exercise} value={value} onChange={onChange} disabled={locked} result={result} />
      ) : null}
      {exercise.type === "order" ? (
        <OrderTokens exercise={exercise} value={value} onChange={onChange} disabled={locked} />
      ) : null}
      {exercise.type === "match" ? (
        <MatchPairs exercise={exercise} value={value} onChange={onChange} disabled={locked} result={result} />
      ) : null}
      {exercise.type === "transform" ? (
        <div className="space-y-2">
          <p className="rounded-xl border border-border bg-surface p-3 text-sm">{exercise.input}</p>
          <Input
            value={String(value ?? "")}
            disabled={locked}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Ihre Umformung…"
            className={cn(result && (result.correct ? "border-success" : "border-destructive"))}
          />
          {exercise.hint && !result ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lightbulb className="size-3.5" /> {exercise.hint}
            </p>
          ) : null}
        </div>
      ) : null}
      {exercise.type === "dictation" ? (
        <div className="space-y-2">
          <AudioButton text={exercise.audioText} label="Play the sentence" variant="outline" />
          <Input
            value={String(value ?? "")}
            disabled={locked}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Schreiben Sie, was Sie hören…"
            className={cn(result && (result.correct ? "border-success" : "border-destructive"))}
          />
        </div>
      ) : null}
      {exercise.type === "speaking" ? (
        <SpeakingItem exercise={exercise} value={value} onChange={onChange} result={result} />
      ) : null}
      {exercise.type === "writing" ? (
        <WritingItem exercise={exercise} value={value} onChange={onChange} result={result} />
      ) : null}

      <AnimatePresence>
        {result ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl border p-3.5 text-sm",
              result.correct ? "border-success/40 bg-success/8" : "border-warning/40 bg-warning/8",
            )}
          >
            <p className="flex items-center gap-2 font-medium">
              {result.correct ? <Check className="size-4 text-success" /> : <X className="size-4 text-warning" />}
              {result.correct ? "Richtig!" : "Nicht ganz."}
            </p>
            {!result.correct ? (
              <p className="mt-1">
                <span className="text-muted-foreground">Lösung: </span>
                <span className="font-medium">{result.expected}</span>
              </p>
            ) : null}
            {exercise.explanation ? (
              <p className="mt-1.5 text-muted-foreground">{exercise.explanation}</p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ full runner ----------------------------- */

export function ExerciseRunner({
  exercises,
  title = "Exercises",
  quizId,
  onFinish,
  mode = "step",
}: {
  exercises: Exercise[];
  title?: string;
  quizId?: string;
  onFinish?: (percent: number) => void;
  mode?: "step" | "list";
}) {
  const { dispatch } = useLearner();
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, AnswerValue>>({});
  const [results, setResults] = React.useState<Record<string, ExerciseResult>>({});
  const [finished, setFinished] = React.useState(false);

  const current = exercises[index];
  const checkedCount = Object.keys(results).length;

  const setAnswer = React.useCallback((id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const check = (exercise: Exercise) => {
    const result = checkExercise(exercise, answers[exercise.id] ?? null);
    setResults((prev) => ({ ...prev, [exercise.id]: result }));
  };

  const finish = React.useCallback(() => {
    const collected = exercises
      .filter((exercise) => results[exercise.id])
      .map((exercise) => ({ exercise, result: results[exercise.id] }));
    const summary = summarise(collected.length ? collected : exercises.map((exercise) => ({
      exercise,
      result: checkExercise(exercise, answers[exercise.id] ?? null),
    })));
    setFinished(true);
    if (quizId) dispatch({ type: "quiz-save", id: quizId, percent: summary.percent });
    onFinish?.(summary.percent);
  }, [answers, dispatch, exercises, onFinish, quizId, results]);

  const reset = () => {
    setAnswers({});
    setResults({});
    setIndex(0);
    setFinished(false);
  };

  const summary = summarise(
    exercises
      .filter((exercise) => results[exercise.id])
      .map((exercise) => ({ exercise, result: results[exercise.id] })),
  );

  if (!exercises.length) return null;

  if (mode === "list") {
    return (
      <div className="space-y-4">
        {exercises.map((exercise, position) => (
          <Card key={exercise.id}>
            <CardContent className="space-y-4 pt-5 sm:pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Aufgabe {position + 1} / {exercises.length}
              </p>
              <ExerciseItem
                exercise={exercise}
                value={answers[exercise.id] ?? null}
                onChange={(value) => setAnswer(exercise.id, value)}
                result={results[exercise.id]}
              />
              {!results[exercise.id] ? (
                <Button size="sm" onClick={() => check(exercise)}>
                  Check answer
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
        {checkedCount > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm">
              <span className="font-semibold">{summary.percent}%</span> · {summary.correctCount} of {checkedCount} correct
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw /> Reset
              </Button>
              <Button size="sm" onClick={finish}>
                Save result
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (finished) {
    return (
      <Card>
        <CardContent className="space-y-5 pt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title} finished</p>
          <p className="font-display text-4xl font-semibold tabular-nums">{summary.percent}%</p>
          <p className="text-sm text-muted-foreground">
            {summary.correctCount} of {exercises.length} correct · {summary.points} / {summary.maxPoints} points
          </p>
          <Progress value={summary.percent} className="h-2" />
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={reset}>
              <RotateCcw /> Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-5 pt-5 sm:pt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title} · {index + 1} / {exercises.length}
          </p>
          <Progress value={((index + (results[current.id] ? 1 : 0)) / exercises.length) * 100} className="h-1.5 w-32" />
        </div>

        <ExerciseItem
          exercise={current}
          value={answers[current.id] ?? null}
          onChange={(value) => setAnswer(current.id, value)}
          result={results[current.id]}
        />

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw /> Reset
          </Button>
          {results[current.id] ? (
            index === exercises.length - 1 ? (
              <Button onClick={finish}>See result</Button>
            ) : (
              <Button onClick={() => setIndex((value) => value + 1)}>
                Next <ChevronRight />
              </Button>
            )
          ) : (
            <Button onClick={() => check(current)} disabled={answers[current.id] === undefined}>
              Check
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import type { InputField } from "@/templates/types";

interface SpecFieldProps {
  field: InputField;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}

export function SpecField({ field, value, onChange }: SpecFieldProps) {
  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {field.label}
        </label>
        <select
          value={String(value)}
          onChange={(e) => {
            const opt = field.options?.find((o) => o.value === e.target.value);
            if (opt) onChange(field.key, opt.value);
          }}
          className="h-11 md:h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {field.label}
      </label>
      <div className="relative">
        <NumberInput
          value={Number(value)}
          min={field.min}
          max={field.max}
          step={field.step}
          onCommit={(v) => onChange(field.key, v)}
        />
        {field.unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono pointer-events-none">
            {field.unit}
          </span>
        )}
      </div>
    </div>
  );
}

function NumberInput({
  value,
  min,
  max,
  step,
  onCommit,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // Sync draft from parent when not focused
  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft}
      min={min}
      max={max}
      step={step}
      onFocus={(e) => {
        setFocused(true);
        e.target.select();
      }}
      onChange={(e) => {
        const raw = e.target.value;
        // Allow empty, digits, decimal point, and minus
        if (/^-?\d*\.?\d*$/.test(raw)) {
          setDraft(raw);
          const num = parseFloat(raw);
          if (!isNaN(num)) onCommit(num);
        }
      }}
      onBlur={() => {
        setFocused(false);
        const num = parseFloat(draft);
        if (isNaN(num)) {
          setDraft(String(value));
        } else {
          onCommit(num);
          setDraft(String(num));
        }
      }}
      className="h-11 md:h-10 w-full rounded-md border border-slate-300 bg-white px-3 pr-8 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}

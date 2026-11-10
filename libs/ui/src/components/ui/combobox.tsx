"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export type ComboboxProps = {
  id?: string;
  value: string;
  options: readonly string[];
  /** Called with the committed value (a listed option or custom text). */
  onChange: (value: string) => void;
  /** Decides whether an option matches the typed text. Defaults to substring. */
  filter?: (option: string, query: string) => boolean;
  /** Let the user add text that is not in the list. */
  allowCustom?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Maps typed text to the stored value (trim / canonical casing); defaults to the trimmed text. */
  resolve?: (text: string) => string;
};

const defaultFilter = (option: string, query: string) =>
  option.toLowerCase().includes(query.trim().toLowerCase());

export function Combobox({
  id,
  value,
  options,
  onChange,
  filter = defaultFilter,
  allowCustom = false,
  placeholder,
  className,
  disabled,
  resolve,
}: ComboboxProps) {
  const listId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(value);
  const [active, setActive] = React.useState(-1);
  const listRef = React.useRef<HTMLUListElement>(null);

  // Keep the visible text in sync when the value is changed from outside.
  React.useEffect(() => {
    setText(value);
  }, [value]);

  const query = open ? text : "";
  const matches = React.useMemo(
    () => options.filter((option) => filter(option, query)),
    [options, filter, query]
  );
  const trimmed = text.trim();
  const hasExact = options.some((o) => o.toLowerCase() === trimmed.toLowerCase());
  const showFallback =
    open && allowCustom && trimmed.length > 0 && !hasExact;
  const rowCount = matches.length + (showFallback ? 1 : 0);

  React.useEffect(() => {
    setActive(-1);
  }, [query]);

  React.useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const commit = (next: string) => {
    onChange(next);
    setText(next);
    setOpen(false);
  };

  const commitText = () => {
    if (!trimmed) {
      commit('');
      return;
    }
    const exact = options.find((o) => o.toLowerCase() === trimmed.toLowerCase());
    if (exact) {
      return commit(exact);
    }
    if (allowCustom) {
      return commit(resolve ? resolve(trimmed) : trimmed);
    }
    setText(value);
    setOpen(false);
  };

  const pickRow = (index: number) => {
    if (index < matches.length) {
      commit(matches[index]);
    } else if (showFallback) {
      commit(resolve ? resolve(trimmed) : trimmed);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (rowCount ? (i + 1) % rowCount : -1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (rowCount ? (i <= 0 ? rowCount - 1 : i - 1) : -1));
    } else if (event.key === "Enter") {
      if (open) {
        event.preventDefault();
        if (active >= 0 && active < rowCount) {
          pickRow(active);
        } else {
          commitText();
        }
      }
    } else if (event.key === "Escape" && open) {
      event.stopPropagation();
      setText(value);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        className={className}
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          setOpen(true);
          if (!next.trim()) {
            onChange('');
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          if (open) {
            commitText();
          }
          setOpen(false);
        }}
        onKeyDown={onKeyDown}
      />
      {open && rowCount > 0 ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-card p-1 text-sm shadow-lg"
        >
          {matches.map((option, index) => (
            <li
              key={option}
              role="option"
              aria-selected={option === value}
              data-index={index}
              // mousedown (not click) so the input keeps focus and blur doesn't fire first
              onMouseDown={(e) => {
                e.preventDefault();
                pickRow(index);
              }}
              onMouseEnter={() => setActive(index)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-2",
                index === active && "bg-accent text-accent-foreground",
                option === value && "font-medium text-primary"
              )}
            >
              {option}
            </li>
          ))}
          {showFallback ? (
            <li
              role="option"
              aria-selected={false}
              data-index={matches.length}
              onMouseDown={(e) => {
                e.preventDefault();
                pickRow(matches.length);
              }}
              onMouseEnter={() => setActive(matches.length)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-2 text-muted-foreground",
                matches.length === active && "bg-accent text-accent-foreground"
              )}
            >
              Add “<b className="text-foreground">{trimmed}</b>”
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

import { BookOpen, Heart, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { QUOTES, type Quote, getQuotesByTheme } from "../data/quotes";
import { cn } from "../lib/utils";
import { useVajraStore } from "../store/vajraStore";
import type { QuoteTheme } from "../types/index";

const THEMES: { value: QuoteTheme | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "discipline", label: "Discipline" },
  { value: "stoic", label: "Stoic" },
  { value: "spiritual", label: "Spiritual" },
  { value: "patience", label: "Patience" },
  { value: "self-mastery", label: "Self-Mastery" },
  { value: "brahmacharya", label: "Brahmacharya" },
];

const THEME_BG: Record<QuoteTheme, string> = {
  discipline: "oklch(0.25 0.06 30)",
  stoic: "oklch(0.25 0.05 260)",
  spiritual: "oklch(0.25 0.06 310)",
  "self-mastery": "oklch(0.25 0.05 160)",
  brahmacharya: "oklch(0.25 0.05 40)",
  patience: "oklch(0.25 0.05 200)",
};

const THEME_TEXT: Record<QuoteTheme, string> = {
  discipline: "oklch(0.75 0.14 30)",
  stoic: "oklch(0.78 0.12 260)",
  spiritual: "oklch(0.78 0.12 310)",
  "self-mastery": "oklch(0.75 0.12 160)",
  brahmacharya: "oklch(0.78 0.12 40)",
  patience: "oklch(0.78 0.12 200)",
};

// ─── Quote Card ───────────────────────────────────────────────────────────────

interface QuoteCardProps {
  quote: Quote;
  isSaved: boolean;
  onToggle: (id: string) => void;
  index: number;
  ocidPrefix: string;
}

function QuoteCard({
  quote,
  isSaved,
  onToggle,
  index,
  ocidPrefix,
}: QuoteCardProps) {
  return (
    <motion.div
      data-ocid={`${ocidPrefix}.item.${index}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        delay: index * 0.04,
        type: "spring",
        stiffness: 280,
        damping: 22,
      }}
      className="relative flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border/40 group"
    >
      {/* Theme tag */}
      <Badge
        variant="secondary"
        className="text-[10px] w-fit font-semibold capitalize border"
        style={{
          background: THEME_BG[quote.theme],
          color: THEME_TEXT[quote.theme],
        }}
      >
        {quote.theme}
      </Badge>

      {/* Quote text */}
      <blockquote className="quote-text text-foreground/90 leading-relaxed">
        "{quote.text}"
      </blockquote>

      {/* Author + heart */}
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-muted-foreground font-medium">
          — {quote.author}
        </p>
        <button
          type="button"
          data-ocid={`${ocidPrefix}.heart.${index}`}
          onClick={() => onToggle(quote.id)}
          aria-label={isSaved ? "Remove from saved" : "Save quote"}
          aria-pressed={isSaved}
          className={cn(
            "p-2 rounded-full transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isSaved
              ? "text-red-400 hover:text-red-500"
              : "text-muted-foreground/40 hover:text-red-400",
          )}
        >
          <Heart className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Quotes Page ──────────────────────────────────────────────────────────────

export default function QuotesPage() {
  // Read directly from store — no loading state
  const savedQuoteIds = useVajraStore((s) => s.savedQuoteIds);
  const toggleSavedQuote = useVajraStore((s) => s.toggleSavedQuote);

  const [filter, setFilter] = useState<QuoteTheme | "all">("all");
  const [discoverSeed, setDiscoverSeed] = useState(0);

  const savedIds = new Set(savedQuoteIds);

  function handleToggle(id: string) {
    toggleSavedQuote(id);
  }

  // Build saved quote objects with full data
  const savedQuoteObjects = useMemo(() => {
    return savedQuoteIds
      .map((id) => QUOTES.find((q) => q.id === id))
      .filter((q): q is Quote => q !== undefined);
  }, [savedQuoteIds]);

  // Discover pool — 5 random quotes filtered by theme
  const discoverPool = useMemo(() => {
    const pool = filter === "all" ? QUOTES : getQuotesByTheme(filter);
    const unsaved = pool.filter((q) => !savedIds.has(q.id));
    const source = unsaved.length >= 5 ? unsaved : pool;
    const shuffled = [...source].sort(() => {
      const r = Math.sin(discoverSeed * 9301 + 49297) * 233280;
      return r - Math.floor(r) - 0.5;
    });
    return shuffled.slice(0, 5);
  }, [filter, discoverSeed, savedIds]);

  return (
    <div data-ocid="quotes.page" className="flex flex-col gap-6 pb-4">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/25">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Your Wisdom Collection
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {savedQuoteObjects.length} quote
              {savedQuoteObjects.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>
      </div>

      {/* ── Saved quotes ───────────────────────────────────────────────────── */}
      <div data-ocid="quotes.saved.section" className="flex flex-col gap-3">
        {savedQuoteObjects.length === 0 ? (
          <div
            data-ocid="quotes.saved.empty_state"
            className="flex flex-col items-center gap-3 py-10 rounded-2xl bg-card border border-border/30 text-center px-4"
          >
            <Heart className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Tap the ❤️ on any quote to save it here
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {savedQuoteObjects.map((quote, i) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                isSaved
                onToggle={handleToggle}
                index={i + 1}
                ocidPrefix="quotes.saved"
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Discover section ───────────────────────────────────────────────── */}
      <div data-ocid="quotes.discover.section" className="flex flex-col gap-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Discover More
          </h2>
          <button
            type="button"
            data-ocid="quotes.discover.refresh_button"
            onClick={() => setDiscoverSeed((s) => s + 1)}
            aria-label="Load new quotes"
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-smooth focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-2 py-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Theme filter pills */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Filter quotes by theme"
        >
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              data-ocid={`quotes.filter_tab.${t.value}`}
              aria-selected={filter === t.value}
              onClick={() => {
                setFilter(t.value);
                setDiscoverSeed((s) => s + 1);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-smooth border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filter === t.value
                  ? "bg-primary text-primary-foreground border-primary/60 shadow-sm"
                  : "bg-secondary/60 text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Discover quote cards */}
        <AnimatePresence mode="popLayout">
          {discoverPool.map((quote, i) => (
            <QuoteCard
              key={`${discoverSeed}-${quote.id}`}
              quote={quote}
              isSaved={savedIds.has(quote.id)}
              onToggle={handleToggle}
              index={i + 1}
              ocidPrefix="quotes.discover"
            />
          ))}
        </AnimatePresence>

        {/* Browse all CTA */}
        <Button
          type="button"
          variant="outline"
          data-ocid="quotes.discover.load_more_button"
          onClick={() => setDiscoverSeed((s) => s + 1)}
          className="w-full mt-1 gap-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4" />
          Load 5 more quotes
        </Button>
      </div>
    </div>
  );
}

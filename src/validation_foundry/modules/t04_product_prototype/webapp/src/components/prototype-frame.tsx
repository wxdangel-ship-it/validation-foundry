import type React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

export const PROTOTYPE_TABLET_VIEWPORT = {
  width: 1194,
  height: 834,
} as const;

export function PrototypeViewport({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen px-4 py-4 text-white sm:px-6">
      <div
        data-prototype-viewport="tablet"
        className={cn(
          "mx-auto flex w-full max-w-[1194px] min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[36px] border border-white/10 bg-[#091319]/90 shadow-dune lg:h-[834px] lg:min-h-0",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function TwoPanePrototype({
  header,
  pageLabel,
  title,
  titleBadge,
  subtitle,
  weakActionLabel,
  onWeakAction,
  left,
  footer,
  right,
}: {
  header?: React.ReactNode;
  pageLabel: string;
  title: string;
  titleBadge?: React.ReactNode;
  subtitle?: string;
  weakActionLabel?: string;
  onWeakAction?: () => void;
  left: React.ReactNode;
  footer: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <PrototypeViewport>
      <div className="grid h-full flex-1 gap-4 p-4 lg:grid-cols-[392px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-[30px] border border-white/10 bg-[#0d1b22]/88">
          <div className="border-b border-white/10 px-6 pb-5 pt-6">
            {header ?? (
              <>
                <Badge className="bg-white/12">{pageLabel}</Badge>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                  {titleBadge}
                </div>
                {subtitle ? <p className="mt-3 max-w-[28rem] text-sm leading-6 text-steel">{subtitle}</p> : null}
              </>
            )}
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">{left}</div>
          {weakActionLabel ? (
            <div className="px-6 pb-3">
              <Button
                type="button"
                variant="ghost"
                className="justify-start px-0 text-left text-sand hover:bg-transparent"
                onClick={onWeakAction}
              >
                {weakActionLabel}
              </Button>
            </div>
          ) : null}
          <div className="border-t border-white/10 px-4 py-4">{footer}</div>
        </aside>
        <section className="min-h-0 overflow-hidden rounded-[30px] border border-white/10 bg-[#071218]/95">
          {right}
        </section>
      </div>
    </PrototypeViewport>
  );
}

export function PanelLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-xs uppercase tracking-[0.2em] text-steel", className)}>
      {children}
    </div>
  );
}

export function CompactStatusRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-b-0", className)}>
      <span className="text-sm text-steel">{label}</span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}

export function DualCtaFooter({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  primaryDisabled,
  secondaryDisabled,
}: {
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button type="button" className="w-full" onClick={onPrimary} disabled={primaryDisabled}>
        {primaryLabel}
      </Button>
      <Button
        type="button"
        className="w-full"
        variant="secondary"
        onClick={onSecondary}
        disabled={secondaryDisabled}
      >
        {secondaryLabel}
      </Button>
    </div>
  );
}

export function MapControlBar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="absolute left-5 top-5 z-20 flex flex-wrap gap-2 rounded-full border border-white/10 bg-[#081218]/88 px-3 py-2 backdrop-blur">
      {children}
    </div>
  );
}

export function FloatingMapStatus({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="absolute bottom-5 left-5 z-20 rounded-[20px] border border-white/10 bg-[#081218]/82 px-4 py-3 text-sm text-steel backdrop-blur">
      {children}
    </div>
  );
}

export function PageModeBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Badge className="border-[#295060] bg-[#10232d] text-[#d4ebf3]">
      {children}
    </Badge>
  );
}

export function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <span className="text-sm text-steel">{label}</span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}

export function SectionDivider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] bg-white/5 px-4 py-3 text-sm leading-6 text-steel">
      {children}
    </div>
  );
}

export function TagList({
  items,
}: {
  items: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} className="border-white/6 bg-white/8 text-steel">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function HeaderValue({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-3 text-right">
      <div className="text-[11px] uppercase tracking-[0.18em] text-steel">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

export function TopBackButton({
  label = "返回",
  onClick,
  className,
}: {
  label?: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className={cn("h-9 justify-start rounded-[18px] border border-white/10 bg-white/5 px-3 text-white hover:bg-white/10", className)}
      onClick={onClick}
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      {label}
    </Button>
  );
}

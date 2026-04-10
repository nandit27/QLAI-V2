'use client';
import React from 'react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, SparklesIcon } from 'lucide-react';

function FilledCheck() {
	return (
        <div className="rounded-full p-0.5 bg-[var(--primary)] flex-shrink-0">
            <CheckIcon className="size-3 text-[var(--primary-foreground)]" strokeWidth={3} />
        </div>
    );
}

function PricingCard({
    titleBadge,
    priceLabel,
    priceSuffix = '/month',
    features,
    cta = 'Subscribe',
    className,
    isPopular = false
}) {
	return (
        <div
            className={cn(
                'group relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-1.5 transition-all duration-300 border',
                isPopular 
                    ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
                    : 'border-[var(--border)] bg-[var(--surface-container-low)]',
                className
            )}>
            <div className={cn(
                "relative flex-1 rounded-[calc(2rem-0.375rem)] flex flex-col overflow-hidden transition-all duration-300",
                isPopular ? "bg-[var(--surface)]" : "bg-[var(--surface)] border border-[var(--border-variant)]"
            )}>
                {isPopular && (
                    <div className="absolute inset-0 bg-[var(--primary-muted)] opacity-30 pointer-events-none" />
                )}
                
                <div className="flex items-center justify-between p-6 relative z-10 border-b border-[var(--border)]">
                    <Badge 
                        variant="secondary"
                        className={cn("px-3 py-1 font-semibold", isPopular ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--surface-variant)] text-[var(--foreground-secondary)]')}
                    >
                        {titleBadge}
                    </Badge>
                </div>
                
                <div className="flex items-end gap-2 px-6 pt-6 relative z-10">
                    <span className="font-mono text-5xl font-bold tracking-tighter text-[var(--foreground)]">
                        {priceLabel}
                    </span>
                    {priceLabel.toLowerCase() !== 'free' && (
                        <span className="text-[var(--foreground-muted)] text-sm mb-1 font-medium">{priceSuffix}</span>
                    )}
                </div>
                
                <ul className="text-[var(--foreground-secondary)] grid gap-4 p-6 text-sm relative z-10 flex-1">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <FilledCheck />
                            <span className="leading-snug">{f}</span>
                        </li>
                    ))}
                </ul>

                <div className="p-6 pt-0 mt-auto relative z-10">
                    <button className={cn(
                        "w-full rounded-full py-3 text-sm font-semibold transition-all duration-300 hover:scale-[0.98]",
                        isPopular ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_4px_14px_rgba(var(--highlight-rgb),_0.3)] hover:opacity-90" : "bg-[var(--surface-variant)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    )}>
                        {cta}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function BentoPricing() {
	return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
            
            {/* Row 1: Item 1 - Col Span 2 */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-1.5 transition-all duration-300 border border-[var(--primary)] bg-[var(--primary-muted)] lg:col-span-2">
                <div className="relative flex-1 rounded-[calc(2rem-0.375rem)] flex flex-col md:flex-row overflow-hidden bg-[var(--surface)]">
                    <div className="absolute inset-0 bg-[var(--primary-muted)] opacity-30 pointer-events-none" />
                    
                    <div className="flex flex-col border-b md:border-b-0 md:border-r border-[var(--border)] relative z-10 w-full md:w-[45%]">
                        <div className="flex items-center gap-3 p-6 pb-2">
                            <Badge 
                                variant="secondary"
                                className="bg-[var(--primary-muted)] text-[var(--primary)] px-3 py-1 font-semibold"
                            >
                                CREATORS SPECIAL
                            </Badge>
                        </div>
                        <div className="px-6 flex flex-col flex-1 pb-6 mt-6">
                            <div className="flex items-end gap-2">
                                <span className="font-mono text-6xl font-bold tracking-tighter text-[var(--foreground)]">
                                    $19
                                </span>
                                <span className="text-[var(--foreground-muted)] text-sm mb-1 font-medium">/month</span>
                            </div>
                            <div className="mt-8 mb-auto">
                                <Badge 
                                    variant="outline" 
                                    className="hidden sm:inline-flex bg-[var(--primary-muted)] text-[var(--primary)] border-[var(--border-variant)] gap-1.5"
                                >
                                    <SparklesIcon className="size-3" /> Most Recommended
                                </Badge>
                            </div>
                            <button className="w-full mt-6 rounded-full bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_4px_14px_rgba(var(--highlight-rgb),_0.3)] transition-all duration-300 hover:scale-[0.98] hover:opacity-90">
                                Subscribe
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 p-6 flex-1 flex flex-col justify-center">
                        <ul className="text-[var(--foreground-secondary)] grid gap-4 text-sm">
                            {[
                                'Perfect for individual bloggers & creators',
                                'AI-Powered editing tools & refinements',
                                'Basic Analytics to track content performance',
                                'Access to standard templates',
                            ].map((f, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <FilledCheck />
                                    <span className="leading-snug">{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Row 1: Item 2 - Col Span 1 */}
            <PricingCard
                titleBadge="STARTERS"
                priceLabel="$0"
                features={[
                    'Perfect for beginners',
                    'Basic Content Generation',
                    'Limited editing tools',
                ]}
                className="lg:col-span-1" 
            />

            {/* Row 2: Item 3 - Col Span 1 */}
            <PricingCard
                titleBadge="TEAMS"
                priceLabel="$49"
                features={[
                    'Ideal for small teams',
                    'Shared workspaces & projects',
                    'Advanced Analytics',
                ]}
                className="lg:col-span-1" 
            />

            {/* Row 2: Item 4 - Col Span 2 */}
            <PricingCard
                titleBadge="ENTERPRISE"
                priceLabel="$99"
                features={[
                    'Designed for large companies',
                    'High-volume content creators',
                    'Dedicated account management',
                    'Custom AI model training options',
                ]}
                className="lg:col-span-2" 
            />

        </div>
    );
}

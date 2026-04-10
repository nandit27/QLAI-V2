import React, { useState, useEffect } from 'react';
import { Check, Sparkles } from "lucide-react";
import PaymentButton from './PaymentButton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "./ui/Button";

function FilledCheck() {
  return (
    <div className="rounded-full p-0.5" style={{ backgroundColor: "#0d7a4e" }}>
      <Check size={10} strokeWidth={3} color="#ffffff" />
    </div>
  );
}

function PricingCard({ titleBadge, priceLabel, priceSuffix = "/month", features, className = "", userData, plan, price, isPopular = false }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg ${
      isPopular 
        ? 'border-[#0d7a4e]/30 bg-gradient-to-br from-[#0d7a4e]/5 to-[#22d68a]/5' 
        : 'border-[var(--border)] bg-[var(--surface)]'
    } ${className}`}>
      {isPopular && (
        <div className="absolute inset-0 bg-gradient-radial from-[#0d7a4e]/10 to-transparent pointer-events-none" />
      )}
      
      <div className="flex items-center gap-3 p-4 relative z-10">
        <span 
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
            isPopular ? 'text-[#0d7a4e]' : 'text-[var(--foreground-secondary)]'
          }`}
          style={isPopular ? { backgroundColor: 'rgba(13, 122, 78, 0.1)' } : { backgroundColor: 'var(--surface-variant)' }}
        >
          {titleBadge}
        </span>
        <div className="ml-auto relative z-10">
          {userData ? (
            <div className="[&>button]:!w-auto [&>button]:!h-auto [&>button]:!rounded-full [&>button]:!border [&>button]:!border-[#0d7a4e]/20 [&>button]:!bg-[#0d7a4e] [&>button]:!px-4 [&>button]:!py-1.5 [&>button]:!text-sm [&>button]:!font-semibold [&>button]:!text-white [&>button]:transition [&>button]:hover:!bg-[#085538]">
              <PaymentButton
                membershipType={plan}
                price={parseInt(price)}
                name={userData.name || 'User'}
                email={userData.email || 'user@example.com'}
                contact={userData.contact || '0000000000'}
              />
            </div>
          ) : (
            <Button
              onClick={() => alert('Please login to continue')}
              className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[#0d7a4e]/40 hover:text-[#0d7a4e]"
              variant="shine">
              Login to Subscribe
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-end gap-2 px-4 py-2 relative z-10">
        <span className="font-mono text-5xl font-semibold tracking-tight text-[var(--foreground)]">
          {priceLabel}
        </span>
        {priceLabel !== "Free" && priceLabel !== "₹0" && priceLabel !== "$0" && (
          <span className="mb-1 text-sm text-[var(--foreground-muted)]">{priceSuffix}</span>
        )}
      </div>
      <ul className="grid gap-4 p-4 text-sm text-[var(--foreground-secondary)] relative z-10">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3">
            <FilledCheck />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Subscription() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('user-info');
    if (userInfo) {
      setUserData(JSON.parse(userInfo));
    }
  }, []);

  const plans = [
    {
      plan: "Explorer",
      price: "0",
      features: [
        "Upto 3 video summaries per week",
        "Upto 3 quizzes per week",
        "Gemini / Llama AI Integration"
      ]
    },
    {
      plan: "Scholar",
      price: "49",
      features: [
        "Mind Map Generation",
        "AI Recommendations",
        "RAG Bot Integration",
        "Chat with YouTube Videos",
        "Live Teacher Doubt Resolution",
        "Web Searched Question Bank"
      ]
    },
    {
      plan: "Achiever",
      price: "99",
      features: [
        "QuickLearn AI Premium Access",
        "All Features Included",
        "Priority Support",
        "Advanced Analytics"
      ]
    }
  ];

  const explorerPlan = plans.find(p => p.plan === "Explorer");
  const scholarPlan = plans.find(p => p.plan === "Scholar");
  const achieverPlan = plans.find(p => p.plan === "Achiever");

  return (
    <section className="relative py-24 px-4 overflow-hidden bg-[var(--background)]">
      <ToastContainer />
      
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(13, 122, 78, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(34, 214, 138, 0.12) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Heading */}
      <div className="relative z-10 text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#0d7a4e]/10 px-5 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-[#0d7a4e]" />
          <span className="text-sm font-semibold text-[#0d7a4e] uppercase tracking-wider">
            Pricing
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-[var(--foreground-secondary)] max-w-xl mx-auto text-base">
          Start free, upgrade when you're ready. No hidden fees.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="relative z-10 mx-auto max-w-6xl grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-8">

        {/* Featured/most popular card - Scholar Plan */}
        <div className="relative overflow-hidden rounded-2xl border border-[#0d7a4e]/30 bg-gradient-to-br from-[#0d7a4e]/5 to-[#22d68a]/5 lg:col-span-5">
          <div className="absolute inset-0 bg-gradient-radial from-[#0d7a4e]/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-3 p-4 relative z-10">
            <span 
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#0d7a4e]"
              style={{ backgroundColor: 'rgba(13, 122, 78, 0.1)' }}
            >
              Most Popular
            </span>
            <span 
              className="hidden lg:flex items-center gap-1 rounded-full border border-[#0d7a4e]/20 px-3 py-1 text-xs text-[#0d7a4e]"
              style={{ backgroundColor: 'rgba(13, 122, 78, 0.05)' }}
            >
              <Sparkles size={10} className="mr-1" /> Most Recommended
            </span>
            <div className="ml-auto relative z-10">
              {userData ? (
                <div className="[&>button]:!w-auto [&>button]:!h-auto [&>button]:!rounded-full [&>button]:!bg-[#0d7a4e] [&>button]:!px-5 [&>button]:!py-1.5 [&>button]:!text-sm [&>button]:!font-semibold [&>button]:!text-white [&>button]:transition [&>button]:hover:!bg-[#085538]">
                  <PaymentButton
                    membershipType={scholarPlan.plan}
                    price={parseInt(scholarPlan.price)}
                    name={userData.name || 'User'}
                    email={userData.email || 'user@example.com'}
                    contact={userData.contact || '0000000000'}
                  />
                </div>
              ) : (
                <Button
                  onClick={() => alert('Please login to continue')}
                  className="rounded-full bg-[#0d7a4e] px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#085538]"
                  variant="shine">
                  Login to Subscribe
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col p-4 lg:flex-row relative z-10">
            <div className="pb-4 lg:w-[30%]">
              <span className="font-mono text-5xl font-semibold tracking-tight text-[var(--foreground)]">₹{scholarPlan.price}</span>
              <span className="text-sm text-[var(--foreground-muted)]">/month</span>
            </div>
            <ul className="grid gap-4 text-sm text-[var(--foreground-secondary)] lg:w-[70%]">
              {scholarPlan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <FilledCheck />
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Free plan - Explorer */}
        <PricingCard
          titleBadge={explorerPlan.plan}
          priceLabel={`₹${explorerPlan.price}`}
          features={explorerPlan.features}
          className="lg:col-span-3"
          userData={userData}
          plan={explorerPlan.plan}
          price={explorerPlan.price}
        />

        {/* Bottom card - Achiever */}
        <PricingCard
          titleBadge={achieverPlan.plan}
          priceLabel={`₹${achieverPlan.price}`}
          features={achieverPlan.features}
          className="lg:col-span-4 lg:col-start-3 md:col-span-2"
          userData={userData}
          plan={achieverPlan.plan}
          price={achieverPlan.price}
          isPopular={true}
        />
      </div>
    </section>
  );
}

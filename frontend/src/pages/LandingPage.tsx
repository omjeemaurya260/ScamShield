import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  MessageSquare,
  Camera,
  Phone,
  Link2,
  Users,
  Globe,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}

interface StatItem {
  value: string;
  label: string;
  sub?: string;
}

interface Step {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CyberTip {
  icon: React.ReactNode;
  tip: string;
  detail: string;
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const features: FeatureCard[] = [
  {
    icon: <MessageSquare className="w-7 h-7" />,
    title: "AI Message Detection",
    description:
      "Paste any suspicious SMS, WhatsApp, or email text and our AI instantly flags scam patterns with detailed reasoning.",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    icon: <Camera className="w-7 h-7" />,
    title: "Screenshot Scanner",
    description:
      "Upload screenshots of suspicious conversations or messages. Our OCR + AI pipeline extracts and analyses the content.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: <Phone className="w-7 h-7" />,
    title: "Call Recording Analysis",
    description:
      "Submit call recordings to detect vishing attempts, fake bank calls, and social-engineering tactics automatically.",
    accent: "from-orange-500 to-amber-500",
  },
  {
    icon: <Link2 className="w-7 h-7" />,
    title: "Phishing Link Checker",
    description:
      "Paste any URL to verify whether it leads to a phishing site, fake login page, or known malicious domain.",
    accent: "from-red-500 to-rose-600",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Family Protection Alerts",
    description:
      "Protect elderly relatives and less tech-savvy family members with easy sharing and real-time safety alerts.",
    accent: "from-green-500 to-emerald-500",
  },
  {
    icon: <Globe className="w-7 h-7" />,
    title: "Hindi & English Support",
    description:
      "Full bilingual support lets users report and receive results in both Hindi and English for wider accessibility.",
    accent: "from-pink-500 to-fuchsia-600",
  },
];

const stats: StatItem[] = [
  { value: "50,000+", label: "Scams Detected", sub: "Demo" },
  { value: "98%", label: "Accuracy Rate", sub: "Demo" },
  { value: "1M+", label: "Messages Analyzed", sub: "Demo" },
  { value: "24/7", label: "Protection Active", sub: "Demo" },
];

const steps: Step[] = [
  {
    step: 1,
    title: "Upload or Paste",
    description:
      "Paste suspicious text, upload a screenshot, share a link, or submit a call recording — any format accepted.",
    icon: <MessageSquare className="w-6 h-6" />,
  },
  {
    step: 2,
    title: "AI Analysis",
    description:
      "Our multi-layer AI engine cross-references patterns, databases, and language models to evaluate the threat level.",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    step: 3,
    title: "Get Results",
    description:
      "Receive a clear risk score, explanation, recommended actions, and one-click reporting to Indian cybercrime portals.",
    icon: <CheckCircle className="w-6 h-6" />,
  },
];

const cyberTips: CyberTip[] = [
  {
    icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
    tip: "Never share OTPs or passwords",
    detail:
      "Legitimate banks, government bodies, and companies will never call to ask for your OTP, PIN, or password.",
  },
  {
    icon: <Link2 className="w-5 h-5 text-cyan-400" />,
    tip: "Verify links before clicking",
    detail:
      "Hover over links to inspect the real URL. Scammers use lookalike domains (e.g. amaz0n-deals.com) to steal credentials.",
  },
  {
    icon: <Phone className="w-5 h-5 text-green-400" />,
    tip: "Report on Cybercrime Helpline 1930",
    detail:
      "If you've been scammed, call 1930 immediately or visit cybercrime.gov.in to file a complaint within the golden hour.",
  },
];

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

/** Animated glowing shield */
const AnimatedShield: React.FC = () => (
  <div className="relative flex items-center justify-center mb-8">
    {/* Outer pulse rings */}
    <span className="absolute w-40 h-40 rounded-full border border-cyan-500/20 animate-ping" />
    <span
      className="absolute w-32 h-32 rounded-full border border-cyan-500/30"
      style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
    />
    {/* Glow blob */}
    <div className="absolute w-28 h-28 rounded-full bg-cyan-500/10 blur-2xl" />
    {/* Shield icon container */}
    <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
      <Shield className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
    </div>
  </div>
);

/** Feature card */
const FeatureCard: React.FC<{ feature: FeatureCard }> = ({ feature }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 backdrop-blur p-6 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(34,211,238,0.12)]">
    {/* Gradient top-bar */}
    <div
      className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
    />
    {/* Icon */}
    <div
      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.accent} bg-opacity-10 mb-4 text-white shadow-lg`}
    >
      {feature.icon}
    </div>
    <h3 className="text-lg font-semibold text-slate-100 mb-2">
      {feature.title}
    </h3>
    <p className="text-sm text-slate-400 leading-relaxed">
      {feature.description}
    </p>
  </div>
);

/** Step card */
const StepCard: React.FC<{ step: Step; isLast: boolean }> = ({
  step,
  isLast,
}) => (
  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0">
    <div className="flex flex-col items-center text-center flex-1 px-4">
      {/* Number badge */}
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xl mb-4 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
        {step.step}
      </div>
      {/* Icon inside translucent chip */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 mb-3">
        {step.icon}
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1">
        {step.title}
      </h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
        {step.description}
      </p>
    </div>
    {/* Arrow connector (hidden after last) */}
    {!isLast && (
      <div className="hidden md:flex items-center text-cyan-500/40">
        <ArrowRight className="w-6 h-6" />
      </div>
    )}
  </div>
);

/** Stat card */
const StatCard: React.FC<{ stat: StatItem }> = ({ stat }) => (
  <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur hover:border-cyan-500/30 transition-colors duration-300">
    <span className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
      {stat.value}
    </span>
    <span className="text-sm text-slate-300 mt-1 font-medium">
      {stat.label}
    </span>
    {stat.sub && (
      <span className="mt-1 text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        {stat.sub} Statistics
      </span>
    )}
  </div>
);

/** Cyber tip card */
const TipCard: React.FC<{ tip: CyberTip }> = ({ tip }) => (
  <div className="flex gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur hover:border-slate-600/60 transition-colors duration-300">
    <div className="mt-0.5 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
      {tip.icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-100 mb-1">{tip.tip}</p>
      <p className="text-xs text-slate-400 leading-relaxed">{tip.detail}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 overflow-x-hidden">
      {/* ── Background grid + radial glow ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Hero glow */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
        {/* Bottom glow */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      {/* ── NAV ──────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-800/60 backdrop-blur-md bg-[#0a0f1e]/80 sticky top-0">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-cyan-400" />
          <span className="font-bold text-lg tracking-tight">
            Scam
            <span className="text-cyan-400">Shield</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/scanner"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Scanner
          </Link>
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-cyan-400 transition-colors mx-4"
          >
            Dashboard
          </Link>
          <Link
            to="/scanner"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            Get Protected
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-28">
        <AnimatedShield />

        {/* Pill badge */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          AI-Powered Cyber Protection · India
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight max-w-3xl mb-6">
          Don't Let{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Scammers
          </span>{" "}
          Steal Your Peace
        </h1>

        {/* Tagline */}
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
          Think Before You Click. Stay Safe with ScamShield.{" "}
          <span className="text-slate-500">|</span>{" "}
          <span className="text-cyan-500/80 font-medium">
            Developed by Team BrainByte
          </span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/scanner"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-[0_0_30px_rgba(34,211,238,0.35)]"
          >
            <MessageSquare className="w-4 h-4" />
            Check a Message Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 font-semibold text-sm hover:border-cyan-500/50 hover:text-cyan-400 hover:scale-105 transition-all duration-200 backdrop-blur"
          >
            Explore Protection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-1 text-slate-600">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Stay Safe
              </span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
              Six powerful modules — powered by AI — to protect you from every
              angle of cyber fraud.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-24 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              How{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                It Works
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Three simple steps from suspicious content to verified safety.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-0">
            {steps.map((s, i) => (
              <StepCard key={s.step} step={s} isLast={i === steps.length - 1} />
            ))}
          </div>
          {/* CTA under steps */}
          <div className="mt-12 text-center">
            <Link
              to="/scanner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_24px_rgba(34,211,238,0.3)]"
            >
              Try It Now — It's Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATISTICS ───────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Trusted{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Protection
              </span>
            </h2>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-10">
              ⚠ Numbers below are demo statistics for illustration only
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <StatCard key={s.label} stat={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CYBER SAFETY TIPS ────────────────── */}
      <section className="relative z-10 px-6 md:px-12 py-24 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Cyber Safety{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Awareness
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Quick reminders to keep you and your family protected online.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {cyberTips.map((t) => (
              <TipCard key={t.tip} tip={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className="relative z-10 px-6 md:px-12 py-14 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-lg">
                  Scam<span className="text-cyan-400">Shield</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                An AI-powered cyber fraud detection platform built to protect
                Indian citizens from scams, phishing, and digital deception.
              </p>
              <p className="mt-3 text-xs text-slate-500 italic">
                Developed by Team BrainByte
              </p>
            </div>

            {/* Emergency */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Emergency Reporting
              </h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="text-red-400 font-bold text-base">
                      1930
                    </span>{" "}
                    — National Cybercrime Helpline
                    <br />
                    <span className="text-xs text-slate-500">
                      Available 24 × 7 across India
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>
                    File complaint at{" "}
                    <a
                      href="https://cybercrime.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline"
                    >
                      cybercrime.gov.in
                    </a>
                    <br />
                    <span className="text-xs text-slate-500">
                      Report financial fraud within the golden hour
                    </span>
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    to="/scanner"
                    className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3 h-3" /> Message Scanner
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3 h-3" /> Dashboard
                  </Link>
                </li>
                <li>
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3 h-3" /> Cybercrime Portal
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800/60">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} ScamShield by Team BrainByte. For
              educational &amp; awareness purposes only.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              No personal data stored · Privacy first
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

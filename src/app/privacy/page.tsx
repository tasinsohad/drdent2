import Link from "next/link";
import { Shield, ArrowLeft, Lock, FileText, CheckCircle } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-50/50 to-transparent opacity-80 blur-3xl rounded-full" />

      {/* Header navbar */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span>Dr. Dent AI</span>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 text-xs font-semibold text-emerald-700 mb-4 animate-fade-in">
            <Lock className="w-3.5 h-3.5" />
            Patient Data Encryption Enabled
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-500">
            Last Updated: May 22, 2026. Learn how we collect, protect, and safely use patient information via our WhatsApp AI assistant.
          </p>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 p-8 md:p-12 prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
              1. Introduction
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Welcome to <strong>Dr. Dent AI</strong>. We are committed to safeguarding the privacy and medical data confidentiality of all our patients and visitors. This Privacy Policy details how we handle communication history, contact information, and interactions processed through our automated WhatsApp virtual assistant.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
              2. Data We Process
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              When patients contact us through the WhatsApp Business platform, we receive and process specific details essential to provide automated answers and seamless dental service booking support:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 list-none pl-0">
              <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 font-medium">WhatsApp phone numbers and sender display names.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 font-medium">Text message conversation transcripts and historical queries.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 font-medium">Dental clinic scheduling requests and service inquiry details.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 font-medium">User opt-in records and explicit communication permissions.</span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
              3. Purpose of Processing
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Your patient data is processed strictly for clinical coordination and scheduling purposes, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Generating instant, automated dental care responses using secure Artificial Intelligence integrations.</li>
              <li>Booking dental check-ups, follow-ups, and managing clinical appointments.</li>
              <li>Allowing our administrative staff (human agents) to step in and chat directly with you to resolve complex medical inquiries.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
              4. Data Retention &amp; Security
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We employ strict, industry-standard cryptographic practices to safeguard patient records:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>All chat history and medical scheduling info are stored securely inside our fully encrypted database layer (managed via Supabase on AWS).</li>
              <li>Any transmission of patient details between Meta APIs, AI pipelines, and our dashboard is fully protected using TLS 1.3 encryption protocols.</li>
              <li>We strictly <strong>never sell, lease, or share</strong> patient phone numbers, clinical data, or details with third-party advertisers.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
              5. User Rights &amp; Opt-Out
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Patients maintain absolute ownership of their communication data. You have the right at any time to request access to your logs or ask for full erasure of your details from our clinic dashboard. If you wish to stop receiving messages from Dr. Dent AI, simply reply with the word <strong>STOP</strong> or contact our support team.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              © {new Date().getFullYear()} Dr. Dent AI. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <Link href="/terms" className="hover:text-emerald-600 transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> HIPAA Compliant Architecture
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

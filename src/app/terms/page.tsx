import Link from "next/link";
import { Scale, ArrowLeft, ShieldCheck, FileText, HelpCircle } from "lucide-react";

export default function TermsOfService() {
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
              <Scale className="w-4 h-4" />
            </div>
            <span>Dr. Dent AI</span>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 text-xs font-semibold text-emerald-700 mb-4 animate-fade-in">
            <ShieldCheck className="w-3.5 h-3.5" />
            Standard Clinic Messaging Terms
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-500">
            Last Updated: May 22, 2026. Please read the messaging terms, disclaimer, and guidelines for interacting with our virtual agent.
          </p>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 p-8 md:p-12 prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 leading-relaxed">
              By initiating a chat or subscribing to services provided by <strong>Dr. Dent AI</strong> through our verified WhatsApp channel (`01814891810` / `+8801814891810`), you agree to be bound by these Terms of Service. If you do not accept these terms, please do not start the WhatsApp chat or interact with our automated assistant.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
              2. Medical Disclaimer (Critical Information)
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
              <h3 className="text-amber-900 font-bold flex items-center gap-2 mb-2 text-sm">
                <HelpCircle className="w-4 h-4 text-amber-700" />
                IMPORTANT MEDICAL NOTICE: NOT FOR EMERGENCIES
              </h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                The Dr. Dent AI WhatsApp assistant is an automated tool designed solely to assist with scheduling, dental general advice, and clinic hour inquiries. <strong>It does NOT provide professional clinical medical diagnosis, treatment, or dental surgeries.</strong> In the event of a dental emergency or severe oral infection, please proceed immediately to an emergency clinic or dial your national emergency number.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
              3. Messaging Rules &amp; User Conduct
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Patients using the WhatsApp scheduling assistant must agree to the following guidelines:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>You must provide truthful and accurate information when coordinating appointments.</li>
              <li>You agree not to spam, send abusive media, or engage in malicious or harassing language with our clinic agent.</li>
              <li>You understand that messages may be processed by safe OpenAI/OpenRouter large language models to format replies.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
              4. SMS/WhatsApp Communication Costs
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Dr. Dent AI does not charge patients any additional premium fees to send or receive WhatsApp messages. However, standard internet data charges and mobile messaging rates from your network provider (or WhatsApp data usage terms) will apply as usual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
              5. Limitation of Liability
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Dr. Dent AI and its medical directors, developers, or affiliates shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the WhatsApp automated scheduling service or reliance on general AI-generated information.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              © {new Date().getFullYear()} Dr. Dent AI. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <Link href="/privacy" className="hover:text-emerald-600 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" /> General Terms of Service
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

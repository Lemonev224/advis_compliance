"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
          subject: `New enquiry from ${name || "website"}`,
          name,
          email,
          company,
          message,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }


  return (
    <section
      id="contact"
      className="relative isolate py-24 lg:py-32 overflow-hidden bg-[#071B3A]"
    >
      {/* solid + gradient background, always behind content */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(135deg, #071B3A 0%, #0d2450 55%, #16326b 100%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-[0.06]" />
      <motion.div
        aria-hidden
        className="absolute -z-10 top-[-140px] right-[-100px] h-[440px] w-[440px] rounded-full opacity-30 blur-[110px]"
        style={{ background: "radial-gradient(circle, #18C6D1, transparent 70%)" }}
        animate={{ x: [0, 18, 0], y: [0, 14, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* Left: copy */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease }}
              className="text-balance text-[32px] sm:text-[44px] leading-[1.12] font-semibold tracking-[-0.015em] text-white"
            >
              Ready to build compliance into your business?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="mt-6 text-[17px] leading-[1.7] text-white/70 max-w-[420px]"
            >
              Talk to us about the compliance infrastructure your business needs.
            </motion.p>


          </div>

          {/* Right: form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="rounded-xl border border-white/20 bg-white/[0.07] backdrop-blur-sm p-6 sm:p-8"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-white/80 mb-1.5" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-white/20 bg-white/[0.06] px-3.5 py-2.5 text-[14.5px] text-white placeholder:text-white/40 outline-none focus:border-cyan/70 transition-colors"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-white/80 mb-1.5" htmlFor="email">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-white/20 bg-white/[0.06] px-3.5 py-2.5 text-[14.5px] text-white placeholder:text-white/40 outline-none focus:border-cyan/70 transition-colors"
                  placeholder="jane@company.com"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-[13px] font-medium text-white/80 mb-1.5" htmlFor="company">
                Company
              </label>
              <input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/[0.06] px-3.5 py-2.5 text-[14.5px] text-white placeholder:text-white/40 outline-none focus:border-cyan/70 transition-colors"
                placeholder="Company name"
              />
            </div>

            <div className="mt-4">
              <label className="block text-[13px] font-medium text-white/80 mb-1.5" htmlFor="message">
                What are you looking to solve?
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/[0.06] px-3.5 py-2.5 text-[14.5px] text-white placeholder:text-white/40 outline-none focus:border-cyan/70 transition-colors resize-none"
                placeholder="Tell us a bit about your compliance needs"
              />
            </div>
            <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

           <motion.button
  type="submit"
  disabled={status === "loading"}
  whileTap={{ scale: 0.98 }}
  className="mt-6 inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-[14.5px] font-medium text-navy w-full sm:w-auto disabled:opacity-60"
>
  {status === "loading" ? "Sending…" : "Send message"}
</motion.button>

{status === "success" && (
  <p className="mt-4 text-[14px] text-cyan">Thanks — we&apos;ll be in touch shortly.</p>
)}
{status === "error" && (
  <p className="mt-4 text-[14px] text-red-400">{errorMsg}</p>
)}
          </motion.form>
        </div>
      </div>
    </section>
  );
}
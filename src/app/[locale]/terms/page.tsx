import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <section className="mx-auto max-w-[820px] px-6 lg:px-8 pt-32 pb-24">
        <h1 className="text-[36px] font-semibold tracking-[-0.015em] text-navy">
          Terms of Use
        </h1>
        <p className="mt-3 text-[14px] text-navy/45">Last updated: [date]</p>

        <div className="mt-10 space-y-8 text-[15.5px] leading-[1.75] text-navy/70">
          <p>
            These Terms of Use (&quot;Terms&quot;) govern your access to and use of the
            website located at [advisorly.tech] (the &quot;Site&quot;), operated by
            Advisorly (&quot;Advisorly&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using the
            Site, you agree to be bound by these Terms. If you do not agree,
            please do not use the Site.
          </p>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">1. About the Site</h2>
            <p>
              The Site is an informational landing page describing Advisorly&apos;s
              compliance infrastructure offering. The Site does not currently
              provide any software, account, or paid service directly through
              it — its purpose is to introduce Advisorly and allow visitors to
              get in touch via the contact form.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">2. Permitted use</h2>
            <p>
              You may access and browse the Site for lawful, personal, or
              business informational purposes only. You agree not to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the Site in any way that violates applicable law or regulation;</li>
              <li>Attempt to gain unauthorized access to the Site, its servers, or any connected systems;</li>
              <li>Interfere with or disrupt the Site&apos;s operation, including via automated scraping, bots, or excessive requests;</li>
              <li>Submit false, misleading, or malicious information through the contact form;</li>
              <li>Reproduce, copy, or resell any part of the Site without our prior written consent.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">3. Contact form submissions</h2>
            <p>
              When you submit an enquiry through the contact form, you are
              sending us your name, email address, company (optional), and
              message content so that we can respond to you. See our{" "}
              <a href="/privacy" className="underline hover:text-navy">
                Privacy Policy
              </a>{" "}
              for details on how this information is processed. You are
              responsible for ensuring the accuracy of the information you
              submit and for having the right to share any information you
              include in your message (for example, not including
              confidential information belonging to a third party without
              authorization).
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">4. Intellectual property</h2>
            <p>
              All content on the Site — including text, graphics, logos, and
              the Statum name and branding — is owned by or licensed to
              Statum and is protected by applicable intellectual property
              laws. Nothing in these Terms grants you any right to use our
              trademarks, logos, or branding without our prior written
              consent.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">5. No warranty</h2>
            <p>
              The Site and its content are provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, express or implied.
              We do not guarantee that the Site will be uninterrupted, secure,
              or error-free, or that any information on it is complete,
              accurate, or up to date.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">6. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, Statum shall not be
              liable for any indirect, incidental, special, or consequential
              damages arising out of or in connection with your use of, or
              inability to use, the Site.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">7. Third-party links</h2>
            <p>
              The Site may contain links to third-party websites. We are not
              responsible for the content, privacy practices, or availability
              of any third-party site.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">8. Changes to these Terms</h2>
            <p>
              We may update these Terms from time to time. Changes will be
              posted on this page with an updated &quot;Last updated&quot; date.
              Continued use of the Site after changes are posted constitutes
              acceptance of the revised Terms.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">9. Governing law</h2>
            <p>
              These Terms are governed by the laws of [Andorra / your
              jurisdiction], without regard to conflict-of-law principles.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">10. Contact</h2>
            <p>
              Questions about these Terms can be sent to{" "}
              <a href="mailto:contact@advisorly.uk" className="underline hover:text-navy">
                contact@advisorly.uk
              </a>.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
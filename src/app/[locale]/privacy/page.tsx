import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <section className="mx-auto max-w-[820px] px-6 lg:px-8 pt-32 pb-24">
        <h1 className="text-[36px] font-semibold tracking-[-0.015em] text-navy">
          Privacy Policy
        </h1>
        <p className="mt-3 text-[14px] text-navy/45">Last updated: [10/08/2026]</p>

        <div className="mt-10 space-y-8 text-[15.5px] leading-[1.75] text-navy/70">
          <p>
            This Privacy Policy explains how Advisorly (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
            collects, uses, and protects information when you visit
            [advisorly.tech] (the &quot;Site&quot;). Advisorly acts as the data
            controller for the information described below.
          </p>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">1. Information we collect</h2>
            <p>We collect information in the following ways:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <span className="font-medium text-navy">Contact form data:</span>{" "}
                when you submit the contact form, we collect your name, email
                address, company name (optional), and the content of your
                message.
              </li>
              <li>
                <span className="font-medium text-navy">Automatically collected data:</span>{" "}
                like most websites, our hosting provider automatically logs
                basic technical information such as IP address, browser
                type, and access times for security and reliability purposes.
              </li>
            </ul>
            <p className="mt-2">
              We do not currently use tracking or advertising cookies on this
              Site. If that changes, this policy will be updated and, where
              required, we will ask for your consent.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">2. How we use your information</h2>
            <p>We use the information collected to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Respond to enquiries submitted through the contact form;</li>
              <li>Maintain the security and proper functioning of the Site;</li>
              <li>Comply with our legal obligations.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">3. Legal basis for processing</h2>
            <p>
              Where the GDPR applies, we process your contact form data based
              on our legitimate interest in responding to business enquiries,
              and/or on the basis that processing is necessary to take steps
              at your request prior to entering into a potential business
              relationship (Article 6(1)(b) and 6(1)(f) GDPR).
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">4. How we share your information</h2>
            <p>
              We do not sell or rent your personal information. We share
              contact form submissions only with:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Our email service provider, solely to deliver your enquiry to our inbox;</li>
              <li>Authorities or third parties where required by law.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">5. Data retention</h2>
            <p>
              We retain contact form submissions for as long as necessary to
              respond to your enquiry and for a reasonable period afterward
              for record-keeping purposes, typically no longer than 24
              months, unless a longer retention period is required by law or
              we enter into a business relationship with you.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">6. International transfers</h2>
            <p>
              If your information is transferred outside your country of
              residence (for example, to our email provider&apos;s servers), we
              take reasonable steps to ensure it is protected in accordance
              with this Privacy Policy and applicable law.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">7. Your rights</h2>
            <p>
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access the personal information we hold about you;</li>
              <li>Request correction of inaccurate information;</li>
              <li>Request deletion of your information;</li>
              <li>Object to or restrict certain processing;</li>
              <li>Request a copy of your data in a portable format;</li>
              <li>Lodge a complaint with your local data protection authority.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us using the details
              below.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">8. Security</h2>
            <p>
              We take reasonable technical and organizational measures to
              protect your information against unauthorized access, loss, or
              misuse. However, no method of transmission over the internet is
              completely secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">9. Children&apos;s privacy</h2>
            <p>
              The Site is not directed at children under 16, and we do not
              knowingly collect personal information from them.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">10. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes
              will be posted on this page with an updated &quot;Last updated&quot;
              date.
            </p>
          </div>

          <div>
            <h2 className="text-[19px] font-semibold text-navy mb-2">11. Contact us</h2>
            <p>
              For any questions about this Privacy Policy or to exercise your
              rights, contact us at{" "}
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
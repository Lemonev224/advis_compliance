import { Logo } from "./Logo";

const links = [
  { label: "Industries", href: "#industries" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-navy/8 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <Logo />
            <p className="mt-3 text-[13.5px] text-navy/45">Andorra · Europe</p>
          </div>

          <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[14px] font-medium text-navy/60 hover:text-navy transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 pt-8 border-t border-navy/8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <span className="text-[13px] text-navy/40">
            © {new Date().getFullYear()} Advisorly. All rights reserved.
          </span>
          <div className="flex items-center gap-6">

          </div>
        </div>
      </div>
    </footer>
  );
}
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // shiftcomply-demo is the ShiftComply demo app. It has its own layout and its own translations (src/shiftcomply/lib/i18n.tsx).
  // compliance-demo is the Advisorly compliance demo app. It has its own English/Spanish translations (src/compliance/lib/i18n.ts).
  matcher: ["/((?!api|_next|_vercel|shiftcomply-demo|compliance-demo|.*\\..*).*)"],
};

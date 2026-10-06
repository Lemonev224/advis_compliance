import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // shiftcomply-demo is the ShiftComply demo app. It has its own layout and its own translations (src/shiftcomply/lib/i18n.tsx).
  matcher: ["/((?!api|_next|_vercel|shiftcomply-demo|.*\\..*).*)"],
};

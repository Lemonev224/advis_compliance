import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // shiftcomply-demo is the ShiftComply demo app, which is not translated and has its own layout.
  matcher: ["/((?!api|_next|_vercel|shiftcomply-demo|.*\\..*).*)"],
};

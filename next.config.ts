import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` on script-src is required by the App Router's inline
 * bootstrap/flight scripts unless you generate a per-request nonce in proxy.ts.
 * The remaining directives still carry real weight: they block plugin content,
 * lock `<base>` rewriting, restrict where forms can post, and stop framing.
 * Upgrade path: emit a nonce from the proxy and swap the two script-src values.
 */
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  // 'unsafe-eval' is only needed by the dev-mode React refresh runtime; production
  // builds must not allow it.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // wa.me is a plain link target, not a fetch destination, so connect-src stays
  // tight. Dev additionally needs the HMR websocket.
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Deliberately 0, not "1; mode=block". The legacy XSS auditor is removed
          // from every current browser, and where it survives it introduces
          // cross-site leak vectors. CSP above is the real control.
          { key: "X-XSS-Protection", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * Render the storefront per request rather than prerendering it.
 *
 * The catalogue is small and edited directly by the shop owner, so a product
 * added in /admin has to be visible the moment it's saved — no revalidation
 * window. It also means `next build` doesn't need a reachable database.
 *
 * If the catalogue grows and traffic makes this expensive, the upgrade is to
 * drop this line and call `revalidatePath('/')` from the product/category
 * write paths instead.
 */
export const dynamic = "force-dynamic";

export default function StorefrontLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

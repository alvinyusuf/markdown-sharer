import { SiteHeader } from "@/components/layout/site-header";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[linear-gradient(to_bottom,oklch(0.97_0.004_90),transparent_320px)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          {children}
        </div>
      </main>
    </>
  );
}

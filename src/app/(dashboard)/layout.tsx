import "../globals.css";

export default function DashboardLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <div className="min-h-screen bg-sj-bg-soft text-sj-brand">{children}</div>
  );
}

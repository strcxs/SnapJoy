export default function PublicLayout({
  children,
}: React.PropsWithChildren) {
  return <div className="min-h-screen">{children}</div>;
}

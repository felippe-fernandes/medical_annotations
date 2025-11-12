import { DesktopHeader } from "@/components/layout/DesktopHeader";

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DesktopHeader />
      {children}
    </>
  );
}

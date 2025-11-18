import DeskLayout from '@/components/DeskLayout';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DeskLayout>{children}</DeskLayout>;
}

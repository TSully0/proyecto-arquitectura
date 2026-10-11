interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <>
      <h1>{title}</h1>
      <p className="admin-subtitle">{subtitle}</p>
    </>
  );
}

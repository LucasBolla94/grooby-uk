export function Card({ children, className, ...props }) {
  return (
    <div className={`bg-white shadow rounded-lg p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="p-2">{children}</div>;
}

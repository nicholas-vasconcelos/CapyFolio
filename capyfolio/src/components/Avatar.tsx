const sizeClass = { xs: 'h-10 w-10 text-[15px]', sm: '', md: 'md', lg: 'lg' };

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

export function Avatar({ name, src, size = 'sm', tone = 'green', className = '' }: {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: 'green' | 'navy' | 'gold';
  className?: string;
}) {
  const classes = `cf-avatar ${sizeClass[size]} ${tone === 'green' ? '' : tone} ${className}`;

  if (src) return <img src={src} alt={name} className={classes} />;
  return <span aria-hidden="true" className={classes}>{initials(name)}</span>;
}

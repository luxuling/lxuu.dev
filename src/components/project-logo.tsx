import { logoInitials } from '@/utils/content-items';

interface Props {
  title: string;
  logo: string | null;
  className?: string;
}

export const ProjectLogo = ({ title, logo, className = '' }: Props) => (
  <span
    className={`flex shrink-0 items-center justify-center overflow-hidden border border-line bg-surface-2 text-body font-semibold text-fg ${className}`}
    aria-hidden='true'
  >
    {logo ? (
      <img src={logo} alt='' className='size-full object-cover' />
    ) : (
      logoInitials(title)
    )}
  </span>
);

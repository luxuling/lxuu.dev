import type { ComponentProps } from 'react';
import { useToggle } from '@/hooks/use-toggle';

interface Props extends ComponentProps<'img'> {
  frameClassName: string;
}

export const LoadingImage = ({ frameClassName, ...image }: Props) => {
  const { isOpen: isLoaded, open: markLoaded } = useToggle();

  return (
    <span
      className={`image-loading ${frameClassName} ${isLoaded ? 'is-loaded' : ''}`}
    >
      <span className='image-loading-placeholder' aria-hidden='true' />
      <img {...image} onLoad={markLoaded} onError={markLoaded} />
    </span>
  );
};

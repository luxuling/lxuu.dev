interface Props {
  path: string;
  title: string;
  subtitle: string;
}

export const PageHeader = ({ path, title, subtitle }: Props) => (
  <header className='flex flex-col gap-2'>
    <p className='text-micro text-fg-subtle'>{path}</p>
    <h1 className='text-h1 font-bold text-fg'>
      {title}
      <span className='text-fg-subtle'>.</span>
    </h1>
    <p className='text-body text-fg-muted'>{subtitle}</p>
  </header>
);

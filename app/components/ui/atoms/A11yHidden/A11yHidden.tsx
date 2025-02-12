import { type ElementType, type ReactNode } from 'react';

interface A11yHiddenProps {
  as?: ElementType;
  children: ReactNode;
}

function A11yHidden({
  as: Component = 'span',
  children,
  ...restProps
}: A11yHiddenProps) {
  return (
    <Component className='sr-only' {...restProps}>
      {children}
    </Component>
  );
}

export default A11yHidden;

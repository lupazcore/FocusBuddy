import React from 'react';

type Shadow = 'hero' | 'normal' | 'small';

interface TileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shadow?: Shadow;
  bg?: string;
  textClass?: string;
  as?: 'button' | 'div';
  pressable?: boolean;
}

export const Tile = React.forwardRef<HTMLButtonElement, TileProps>(function Tile(
  { shadow = 'normal', bg, textClass, as = 'button', pressable = true, className = '', style, children, ...rest },
  ref,
) {
  const shadowClass = shadow === 'hero' ? 'tile-hero' : shadow === 'small' ? 'tile-small' : 'tile-normal';
  const Comp: any = as;
  return (
    <Comp
      ref={ref}
      className={`tile-base ${shadowClass} ${pressable ? 'tile-pressable' : ''} focus-ring ${textClass ?? ''} ${className}`}
      style={{ background: bg, ...style }}
      {...rest}
    >
      {children}
    </Comp>
  );
});

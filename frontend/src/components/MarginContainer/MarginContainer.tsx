import { PropsWithChildren, CSSProperties, HTMLAttributes } from 'react';

import { StyledContainer } from './MarginContainer.styles';

type Props = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & CSSProperties;

function MarginContainer({ children, ...props }: Props) {
  return <StyledContainer {...props}>{children}</StyledContainer>;
}

export default MarginContainer;

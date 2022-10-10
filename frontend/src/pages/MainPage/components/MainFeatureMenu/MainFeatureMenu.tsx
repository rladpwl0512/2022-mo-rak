import { MouseEventHandler } from 'react';
import {
  StyledMenuContainer,
  StyledWrapper,
  StyledName,
  StyledImage
} from './MainFeatureMenu.styles';

interface Props {
  onClick: MouseEventHandler<HTMLDivElement>;
  name: '투표하기' | '약속잡기' | '역할 정하기';
  img: string;
}

function MainFeatureMenu({ onClick, name, img }: Props) {
  return (
    <StyledWrapper onClick={onClick}>
      <StyledMenuContainer>
        {/* TODO: StyledImage 네이밍 고민 */}
        <StyledImage src={img} alt={name} />
        <StyledName>{name}</StyledName>
      </StyledMenuContainer>
    </StyledWrapper>
  );
}

export default MainFeatureMenu;

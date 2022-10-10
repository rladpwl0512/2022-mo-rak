import styled from '@emotion/styled';

const StyledHamburgerMenu = styled.button`
  display: none;
  position: fixed;
  top: 4rem;
  left: 4rem;

  @media (max-width: 700px) {
    display: block;
  }
`;

const StyledContainer = styled.div<{
  isVisible: boolean;
}>(
  ({ isVisible, theme }) => `
  position: sticky;
  top: 0;
  width: 36.4rem;
  height: 100vh;
  z-index: 1; 
  background: ${theme.colors.WHITE_100};
  padding-left: 4rem;
  gap: 2rem;
  
  @media (max-width: 700px) {
    display: ${isVisible ? 'block' : 'none'};
    position: absolute;
    width: 100vw;
  }
`
);

const StyledCloseButton = styled.button`
  display: none;
  position: absolute;
  top: 4rem;
  left: 4rem;

  @media (max-width: 700px) {
    display: block;
  }
`;

const StyledLogo = styled.img`
  display: block;
  margin: 2rem auto;
  width: 16rem;
  aspect-ratio: 16 / 9;
  cursor: pointer;
  padding-right: 4rem;
`;

const StyledBottomMenu = styled.div`
  position: absolute;
  bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export { StyledHamburgerMenu, StyledContainer, StyledLogo, StyledBottomMenu, StyledCloseButton };

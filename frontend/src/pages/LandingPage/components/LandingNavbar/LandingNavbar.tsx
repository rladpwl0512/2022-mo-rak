import { StyledMenu, StyledContainer } from './LandingNavbar.styles';

function LandingNavbar() {
  return (
    <StyledContainer>
      <StyledMenu href="#main-section">LOGIN</StyledMenu>
      <StyledMenu href="#service-introduction-section">ABOUT</StyledMenu>
      <StyledMenu href="#feature-introduction-section">FEATURES</StyledMenu>
    </StyledContainer>
  );
}

export default LandingNavbar;

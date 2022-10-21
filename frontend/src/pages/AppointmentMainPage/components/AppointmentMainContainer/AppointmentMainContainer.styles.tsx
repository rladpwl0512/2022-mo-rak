import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const StyledTitle = styled.h1`
  font-size: 2.2rem;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-top: 1.2rem;
`;

const LottieContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledGuide = styled.p(
  ({ theme }) => `
  text-align: center;
  font-size: 4rem;

  color: ${theme.colors.GRAY_400}
`
);

const StyledAppointmentContainer = styled.div`
  padding: 1rem;
  width: calc(100% / 3);

  // TODO: 목록 리팩토링
  @media (max-width: 1250px) {
    width: calc(100% / 2);
  }

  @media (max-width: 1000px) {
    width: 100%;
  }
`;
export { StyledContainer, StyledTitle, LottieContainer, StyledGuide, StyledAppointmentContainer };

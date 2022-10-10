import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  width: calc(100% - 36.4rem);
  padding: 6.4rem 20rem;

  @media (max-width: 700px) {
    width: 100vw;
  }
`;

export { StyledContainer };

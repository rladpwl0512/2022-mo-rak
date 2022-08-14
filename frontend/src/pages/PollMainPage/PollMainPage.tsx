import styled from '@emotion/styled';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PollMainContainer from '../../components/PollMain/PollMainContainer/PollMainContainer';
import PollMainHeader from '../../components/PollMain/PollMainHeader/PollMainHeader';

function PollMainPage() {
  const { setClickedMenu }: any = useOutletContext();
  setClickedMenu('poll');

  return (
    <StyledContainer>
      <PollMainHeader />
      <PollMainContainer />
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  width: calc(100% - 36.4rem);
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding: 6.4rem 20rem;
`;

export default PollMainPage;

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { StyledTitle } from './PollProgressForm.styles';
import Box from '../../../../components/Box/Box';
import Divider from '../../../../components/Divider/Divider';
import MarginContainer from '../../../../components/MarginContainer/MarginContainer';
import PollProgressButtonGroup from '../PollProgressButtonGroup/PollProgressButtonGroup';
import { getPoll, progressPoll, getPollItems } from '../../../../api/poll';
import PollProgressItemGroup from '../PollProgressItemGroup/PollProgressItemGroup';
import {
  Poll,
  SelectedPollItem,
  getPollResponse,
  getPollItemsResponse,
  PollItem
} from '../../../../types/poll';
import PollProgressDetail from '../PollProgressDetail/PollProgressDetail';
import { Group } from '../../../../types/group';
import { AxiosError } from 'axios';

const getInitialSelectedPollItems = (pollItems: getPollItemsResponse) =>
  pollItems
    .filter((pollItem) => pollItem.isSelected)
    .map((pollItem) => ({
      id: pollItem.id,
      description: pollItem.description
    }));

function PollProgressForm() {
  const navigate = useNavigate();
  const { groupCode, pollCode } = useParams() as {
    groupCode: Group['code'];
    pollCode: Poll['code'];
  };
  const [poll, setPoll] = useState<getPollResponse>();
  const [pollItems, setPollItems] = useState<getPollItemsResponse>([]);
  const [selectedPollItems, setSelectedPollItems] = useState<Array<SelectedPollItem>>([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedPollItems.length <= 0) {
      alert('최소 1개의 선택항목을 선택해주세요!');

      return;
    }

    try {
      await progressPoll(groupCode, pollCode, selectedPollItems);
      navigate(`/groups/${groupCode}/poll/${pollCode}/result`);
    } catch (err) {
      if (err instanceof AxiosError) {
        const errCode = err.response?.data.codeNumber;

        switch (errCode) {
          case '2300': {
            alert('존재하지 않는 투표입니다!');
            navigate(`/groups/${groupCode}/poll`);

            break;
          }

          case '2100': {
            alert('마감된 투표입니다.');
            navigate(`/groups/${groupCode}/poll`);

            break;
          }
        }
      }
    }
  };

  const handleSelectPollItems = (e: ChangeEvent<HTMLInputElement>) => {
    const id = Number(e.target.id);
    const isSelected = e.target.checked;
    // TODO: 깊은 복사 함수 만들어보기!
    const copiedSelectedPollItems: Array<SelectedPollItem> = JSON.parse(
      JSON.stringify(selectedPollItems)
    );

    if (isSelected) {
      // NOTE: EMPTY_STRING 상수화 어떤가요?
      setSelectedPollItems([...copiedSelectedPollItems, { id, description: '' }]);

      return;
    }

    setSelectedPollItems(
      copiedSelectedPollItems.filter((selectedPollItem) => selectedPollItem.id !== id)
    );
  };

  const handleSelectPollItem = (e: ChangeEvent<HTMLInputElement>) => {
    const id = Number(e.target.id);

    setSelectedPollItems([{ id, description: '' }]);
  };

  const handleDescription = (pollItemId: PollItem['id']) => (e: ChangeEvent<HTMLInputElement>) => {
    const copiedSelectedPollItems: Array<SelectedPollItem> = JSON.parse(
      JSON.stringify(selectedPollItems)
    );

    const targetPollItem = copiedSelectedPollItems.find(
      (copiedSelectedPollItem) => copiedSelectedPollItem.id === pollItemId
    );

    if (targetPollItem) {
      targetPollItem.description = e.target.value;
      setSelectedPollItems(copiedSelectedPollItems);
    }
  };

  useEffect(() => {
    (async (pollCode: Poll['code']) => {
      try {
        const res = await getPoll(pollCode, groupCode);

        // TODO: res.data vs poll => 이후에 통일해줘야함
        if (res.data.status === 'CLOSED') {
          navigate(`/groups/${groupCode}/poll`);

          return;
        }

        setPoll(res.data);
      } catch (err) {
        if (err instanceof AxiosError) {
          const errCode = err.response?.data.codeNumber;

          if (errCode === '2300') {
            alert('존재하지 않는 투표입니다!');
            navigate(`/groups/${groupCode}/poll`);
          }
        }
      }
    })(pollCode);
  }, []);

  useEffect(() => {
    (async (pollCode: Poll['code']) => {
      try {
        const res = await getPollItems(pollCode, groupCode);
        setPollItems(res.data);
      } catch (err) {}
    })(pollCode);
  }, []);

  useEffect(() => {
    const initialSelectedPollItems = getInitialSelectedPollItems(pollItems);

    setSelectedPollItems(initialSelectedPollItems);
  }, [pollItems]);

  return (
    <Box width="84.4rem" padding="6.4rem 4.8rem">
      {poll ? (
        <form onSubmit={handleSubmit}>
          <MarginContainer margin="0 0 4rem 0">
            <StyledTitle>{poll.title}</StyledTitle>
            <Divider />
          </MarginContainer>
          <MarginContainer margin="0 0 1.6rem 0">
            <PollProgressDetail
              isAnonymous={poll.isAnonymous}
              allowedPollCount={poll.allowedPollCount}
            />
          </MarginContainer>
          <MarginContainer margin="0 0 23.6rem 0">
            <PollProgressItemGroup
              pollItems={pollItems}
              selectedPollItems={selectedPollItems}
              allowedPollCount={poll.allowedPollCount}
              onChangeCheckbox={handleSelectPollItems}
              onChangeRadio={handleSelectPollItem}
              onChangeText={handleDescription}
            />
          </MarginContainer>
          <PollProgressButtonGroup pollCode={pollCode} isHost={poll.isHost} groupCode={groupCode} />
        </form>
      ) : (
        <div>로딩중</div>
      )}
    </Box>
  );
}

export default PollProgressForm;

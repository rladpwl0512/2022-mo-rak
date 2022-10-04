import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../../../../api/group';
import { GroupInterface } from '../../../../types/group';
import FlexContainer from '../../../../components/FlexContainer/FlexContainer';
import GroupCreateFormNameInput from '../GroupCreateFormNameInput/GroupCreateFormNameInput';
import GroupCreateFormSubmitButton from '../GroupCreateFormSubmitButton/GroupCreateFormSubmitButton';
import { StyledForm } from './GroupCreateForm.style';

function GroupCreateForm() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState<GroupInterface['name']>('');

  const handleCreateGroup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await createGroup(groupName);
      const groupCode = res.headers.location.split('groups/')[1];

      navigate(`/groups/${groupCode}`);
    } catch (err) {
      alert(err);
    }
  };

  const handleGroupName = (e: ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  return (
    <StyledForm onSubmit={handleCreateGroup}>
      <FlexContainer>
        <GroupCreateFormNameInput groupName={groupName} onChange={handleGroupName} />
        <GroupCreateFormSubmitButton />
      </FlexContainer>
    </StyledForm>
  );
}

export default GroupCreateForm;

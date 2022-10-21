import FlexContainer from '../../../../components/FlexContainer/FlexContainer';
import Button from '../../../../components/Button/Button';
import { useTheme } from '@emotion/react';
import { MouseEventHandler } from 'react';

type Props = {
  onClickCancelButton: MouseEventHandler<HTMLButtonElement>;
};

function RoleMainRoleEditModalButtonGroup({ onClickCancelButton }: Props) {
  const theme = useTheme();
  return (
    <FlexContainer gap="2rem">
      <Button
        variant="filled"
        colorScheme={theme.colors.GRAY_400}
        width="14rem"
        padding="1.6rem 3.2rem"
        borderRadius="1.2rem"
        fontSize="1.6rem"
        onClick={onClickCancelButton}
      >
        취소
      </Button>
      <Button
        variant="filled"
        colorScheme={theme.colors.YELLOW_200}
        width="14rem"
        padding="1.6rem 3.2rem"
        borderRadius="1.2rem"
        fontSize="1.6rem"
        type="submit"
      >
        확인
      </Button>
    </FlexContainer>
  );
}

export default RoleMainRoleEditModalButtonGroup;

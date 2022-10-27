import { useEffect, useState } from 'react';
import RoleMainRoleEditModal from '../RoleMainRoleEditModal/RoleMainRoleEditModal';
import RoleMainRoles from '../RoleMainRoles/RoleMainRoles';
import { getRoles } from '../../../../api/role';
import { useParams } from 'react-router-dom';
import { Group } from '../../../../types/group';
import { EditRolesRequest } from '../../../../types/role';
import { AxiosError } from 'axios';
import RoleMainButtons from '../RoleMainButtons/RoleMainButtons';

type Props = {
  onClickAllocateRolesButton: () => void;
};

function RoleMainProgress({ onClickAllocateRolesButton }: Props) {
  const { groupCode } = useParams() as { groupCode: Group['code'] };
  const [roles, setRoles] = useState<EditRolesRequest['roles']>([]);
  const [isRoleEditModalVisible, setIsRoleEditModalVisible] = useState(false);

  const handleCloseRoleEditModal = () => {
    setIsRoleEditModalVisible(false);
  };

  const handleOpenRoleEditModal = () => {
    setIsRoleEditModalVisible(true);
  };

  const fetchRoles = async () => {
    try {
      const res = await getRoles(groupCode);
      setRoles(res.data.roles);
    } catch (err) {
      if (err instanceof AxiosError) {
        const errCode = err.response?.data.codeNumber;
        if (errCode === '5300') {
          alert('역할이 존재하지 않습니다');
        }
      }
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <>
      <RoleMainRoles roles={roles} />
      <RoleMainButtons
        onClickAllocateRolesButton={onClickAllocateRolesButton}
        onClickEditRolesButton={handleOpenRoleEditModal}
      />
      {isRoleEditModalVisible && (
        <RoleMainRoleEditModal
          close={handleCloseRoleEditModal}
          initialRoles={roles}
          onSubmit={fetchRoles}
        />
      )}
    </>
  );
}

export default RoleMainProgress;

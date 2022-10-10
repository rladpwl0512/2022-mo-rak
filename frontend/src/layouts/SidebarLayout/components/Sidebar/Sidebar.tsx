import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '../../../../assets/logo.svg';
import HamburgerMenu from '../../../../assets/hamburger-menu.svg';
import CloseButton from '../../../../assets/close-button.svg';

import { getGroups } from '../../../../api/group';
import { GroupInterface } from '../../../../types/group';

import Divider from '../../../../components/Divider/Divider';
import SidebarGroupsMenu from '../SidebarGroupsMenu/SidebarGroupsMenu';
import SidebarMenuModals from '../SidebarMenuModals/SidebarMenuModals';

import SidebarMembersProfileMenu from '../SidebarMembersProfileMenu/SidebarMembersProfileMenu';
import SidebarFeatureMenu from '../SidebarFeatureMenu/SidebarFeatureMenu';
import SidebarInvitationMenu from '../SidebarInvitationMenu/SidebarInvitationMenu';
import SidebarSlackMenu from '../SidebarSlackMenu/SidebarSlackMenu';
import SidebarLogoutMenu from '../SidebarLogoutMenu/SidebarLogoutMenu';
import {
  StyledHamburgerMenu,
  StyledContainer,
  StyledLogo,
  StyledBottomMenu,
  StyledCloseButton
} from './Sidebar.styles';

function Sidebar() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Array<GroupInterface>>([]);
  const [activeModalMenu, setActiveModalMenu] = useState<null | string>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { groupCode } = useParams() as { groupCode: GroupInterface['code'] };

  const navigate = useNavigate();

  const handleNavigate = (location: string) => () => {
    navigate(location);
  };

  const handleActiveModalMenu = (menu: null | string) => () => {
    setActiveModalMenu(menu);
  };

  const handleOpenMenu = () => {
    setIsVisible(true);
  };

  const handleCloseMenu = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await getGroups();
        setGroups(res.data);
        setIsLoading(false);
      } catch (err) {
        alert(err);
        setIsLoading(true);
      }
    };

    fetchGroups();
  }, [groupCode]);

  return (
    <>
      <StyledHamburgerMenu onClick={handleOpenMenu}>
        <img src={HamburgerMenu} alt="메뉴" />
      </StyledHamburgerMenu>

      <StyledContainer isVisible={isVisible}>
        {isLoading ? (
          <div>로딩중</div>
        ) : (
          <>
            <StyledLogo src={Logo} alt={Logo} onClick={handleNavigate(`/groups/${groupCode}`)} />
            <StyledCloseButton onClick={handleCloseMenu}>
              <img src={CloseButton} alt="메뉴닫기" />
            </StyledCloseButton>
            <SidebarGroupsMenu
              onClickMenu={handleActiveModalMenu}
              groupCode={groupCode}
              groups={groups}
            />

            <Divider />
            <SidebarFeatureMenu groupCode={groupCode} />

            <Divider />
            <SidebarMembersProfileMenu groupCode={groupCode} />

            <StyledBottomMenu>
              <SidebarSlackMenu onClick={handleActiveModalMenu('slack')} />
              <SidebarInvitationMenu groupCode={groupCode} />
              <SidebarLogoutMenu />
            </StyledBottomMenu>
          </>
        )}
      </StyledContainer>

      {/* TODO: 모달이 모여있음  */}
      <SidebarMenuModals
        activeModalMenu={activeModalMenu}
        closeModal={handleActiveModalMenu(null)}
        groupCode={groupCode}
      />
    </>
  );
}

export default Sidebar;

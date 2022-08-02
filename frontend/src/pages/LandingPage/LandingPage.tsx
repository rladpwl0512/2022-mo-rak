import styled from '@emotion/styled';

import React, { RefObject, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getLocalStorageItem,
  saveLocalStorageItem,
  removeLocalStorageItem,
  getSessionStorageItem,
  removeSessionStorageItem
} from '../../utils/storage';
import Logo from '../../assets/logo.svg';
import Circle from '../../assets/half_circle.svg';
import Smile from '../../assets/smile.svg';
import Line from '../../assets/line.svg';
import Glitter from '../../assets/glitter.svg';
import Highlight from '../../assets/highlight.svg';
import Poll from '../../assets/poll_small.svg';
import Appointment from '../../assets/time.svg';
import Undefined from '../../assets/question.svg';
import Services from '../../assets/service_group.svg';
import Blob from '../../assets/blob.svg';
import CircleHighlight from '../../assets/circle_highlight.svg';
import GithubLogo from '../../assets/githubLogo.svg';
import { signin } from '../../api/auth';
import { getDefaultGroup } from '../../api/group';

// TODO: 페이지 추상화
function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = getSessionStorageItem('redirectUrl');
  // TODO: 중복 로직해결
  // TODO: 다시 한 번 token을 가져오는
  const token = getLocalStorageItem('token');
  useEffect(() => {
    const fetchGetDefaultGroup = async () => {
      try {
        const { code: groupCode } = await getDefaultGroup();

        navigate(`/groups/${groupCode}`);
      } catch (err) {
        if (err instanceof Error) {
          const statusCode = err.message;
          if (statusCode === '401') {
            removeLocalStorageItem('token');
            navigate('/');

            return;
          }

          if (statusCode === '404') {
            navigate('/init');
            console.log('랜딩페이지에서 로그인을 했지만, 속해있는 그룹이 없습니다.');
          }
        }
      }
    };

    if (token) {
      fetchGetDefaultGroup();
    }
  }, []);

  useEffect(() => {
    // TODO: fetch하는 함수이지만 navigate도 해주고있다..근데 try..catch...사용하려면 이렇게밖에 못함
    // TODO: strict mode라서 로그인이 된 이후에도 요청을 다시 보내서 에러가 나온다.
    const fetchSignin = async (code: string) => {
      try {
        const { token } = await signin(code);

        saveLocalStorageItem<string>('token', token);

        if (redirectUrl) {
          navigate(redirectUrl);
          removeSessionStorageItem('redirectUrl');

          return;
        }

        navigate('/init');
      } catch (err) {
        alert('로그인에 실패하였습니다. 다시 시도해주세요');
        navigate('/');
      }
    };

    const code = searchParams.get('code');

    if (code) {
      fetchSignin(code);
    }
  }, []);

  return (
    <StyledContainer>
      <StyledMainSection>
        <StyledLogo src={Logo} alt="logo" />
        <StyledSmallTitle>
          모락이 해줄게요
        </StyledSmallTitle>
        <StyledBigTitle>
          <StyledSmileImage src={Smile} alt="smile" />
          <StyledLineImage src={Line} alt="line" />
          <StyledGlitterImage src={Glitter} alt="glitter" />
          모임을
          <br />
          즐겁게, 편하게!
        </StyledBigTitle>
        <StyledLink href="https://github.com/login/oauth/authorize?client_id=f67a30d27afefe8b241f">
          <StyledLoginContainer>
            <StyledGithubLogo src={GithubLogo} alt="github-logo" />
            <StyledTitle>GITHUB으로 로그인</StyledTitle>
          </StyledLoginContainer>
        </StyledLink>
        <StlyedSectionGuideContainer>
          <StlyedBlobContainer>
            <img src={Blob} alt="blob" />
            <StyledGuideText>모락 소개</StyledGuideText>
          </StlyedBlobContainer>
        </StlyedSectionGuideContainer>
      </StyledMainSection>

      <StyledIntroduceSection>
        <div>
          <StyledMainIntroduceText>
            분산된 서비스...
            <br />
            불편하지 않으셨나요?
            <StyledHighlightImage src={CircleHighlight} alt="highlight" />
          </StyledMainIntroduceText>
          <StyledDetailIntroduceText>
            투표 하기, 일정 정하기...
            분산 되어있는 서비스에 불편함을 느끼지 않으셨나요?
            <br />
            모락에 모두 모여있어요!
          </StyledDetailIntroduceText>
        </div>

        {/* TODO: 야매말고 배치 제대로... */}
        <StyledImageContainer>
          <img src={Services} alt="services" />
        </StyledImageContainer>
      </StyledIntroduceSection>

      <StyledServiceIntroduceSection>
        <StyledExplainTextContainer>
          <StyledExplainBigText>
            모락을 통해서 할 수 있어요!
          </StyledExplainBigText>
          <StyledExplainSmallText>
            모락이 모임을 더 편하고, 즐겁게 할 수 있도록 도와줄게요
          </StyledExplainSmallText>
        </StyledExplainTextContainer>

        <StyledServiceContainer>

          <div>
            <StyledServiceWrapper>
              <StyledPollImage src={Poll} alt="poll" />
              <StyledServieHighlightImage src={Highlight} alt="highlight" />
            </StyledServiceWrapper>
            <StyledServiceName>투표하기</StyledServiceName>
          </div>

          <div>
            <StyledServiceWrapper>
              <StyledAppointmentImage src={Appointment} alt="appointment" />
            </StyledServiceWrapper>
            <StyledServiceName>약속잡기</StyledServiceName>
          </div>

          <div>
            <StyledServiceWrapper>
              <StyledUndefinedImage src={Undefined} alt="undefined" />
              <StyledServieGlitterImage src={Glitter} alt="glitter" />
            </StyledServiceWrapper>
            <StyledServiceName>coming soon!</StyledServiceName>
          </div>

          <div>
            <StyledServiceWrapper>
              <StyledUndefinedImage src={Undefined} alt="undefined" />
            </StyledServiceWrapper>
            <StyledServiceName>coming soon!</StyledServiceName>
          </div>
        </StyledServiceContainer>
      </StyledServiceIntroduceSection>

    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
  font-family: 'Nanum Gothic', sans-serif;
`;

const StyledLogo = styled.img`
  width: 5%; 
  position: absolute; 
  top: 2rem; 
  left: 4rem;
`;

// section 1
const StyledMainSection = styled.section`
  position: relative;
  flex-direction: column;
  background-image: url(${Circle});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom 0px right 0px;
`;

const StyledSmallTitle = styled.div`
  font-size: 2.4rem;
  margin-bottom: 12px;
  color: black;
  letter-spacing: 2px;
`;

const StyledBigTitle = styled.h1`
  font-size: 10.4rem;
  font-weight: 700;
  text-align: center;
  position: relative;
  color: black;
  line-height: 12rem;
  letter-spacing: -0.4rem;
`;

const StyledSmileImage = styled.img`
  position: absolute; 
  bottom: 0;
  left: -6.8rem;
  top: 7.6rem;
  width: 10rem;
`;

const StyledLineImage = styled.img`
  position: absolute; 
  right: 46px;
  bottom: -4.4rem;
  width: 26rem;
`;

const StyledGlitterImage = styled.img`
  position: absolute; 
  bottom: 0;
  right: -32px;
  top: 5.2rem;
  width: 6rem;
`;

const StlyedSectionGuideContainer = styled.div`
  position: absolute; 
  right: 140px; 
  bottom: 60px;
`;

const StlyedBlobContainer = styled.div`
  position: relative;
`;

const StyledGuideText = styled.span`
  position: absolute; 
  top: 72px; 
  left: 42px; 
  font-size: 2.4rem; 
  color: black;
`;

// section2
const StyledIntroduceSection = styled.section`
  position: relative;
  justify-content: space-evenly;
`;

const StyledMainIntroduceText = styled.h1`
  font-size: 40px;
  text-align: left;
  color: black;
  margin-bottom: 20px;
  position: relative;
  font-weight: 700;
  line-height: 45px;
  letter-spacing: 4px;
`;

const StyledHighlightImage = styled.img`
  position: absolute; 
  left: -12px; 
  top: 32px;
`;

const StyledDetailIntroduceText = styled.span`
  font-size: 20px;
  text-align: left;
  color: black;
  letter-spacing: 1px;
  line-height: 24px;
`;

const StyledImageContainer = styled.div`
  position: relative;
`;

// section3
const StyledServiceIntroduceSection = styled.section`
  position: relative;
  flex-direction: column;
`;

const StyledExplainTextContainer = styled.div`
  margin-bottom: 80px;
`;

const StyledExplainBigText = styled.h1`
  font-size: 40px;
  text-align: left;
  color: black;
  margin-bottom: 10px;
  position: relative;
  font-weight: 700;
  line-height: 45px;
  letter-spacing: 4px
`;

const StyledExplainSmallText = styled.div`
  font-size: 20px;
  text-align: left;
  color: black;
  letter-spacing: 1px;
  line-height: 24px;
`;

const StyledServiceContainer = styled.div`
  display: flex; 
  gap: 40px;
`;

const StyledServiceWrapper = styled.div`
  position: relative;
  border-radius: 100%;
  width: 260px;
  height: 260px;
  background: #F8C846;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
`;

const StyledServieHighlightImage = styled.img`
  position: absolute; 
  top: 10px; 
  left: -40px;
`;

const StyledServiceName = styled.div`
  text-align: center; 
  font-size: 20px;
`;

const StyledServieGlitterImage = styled.img`
  position: absolute; 
  bottom: -20px; 
  right: -10px; 
  width: 40px;
`;

const StyledPollImage = styled.img`
  width: 12rem;
`;

const StyledAppointmentImage = styled.img`
  width: 12rem;
`;

const StyledUndefinedImage = styled.img`
  width: 12rem;
`;

const StyledLink = styled.a`
  position: absolute;
  bottom: 20rem;
  text-decoration: none;
`;

const StyledGithubLogo = styled.img`
  width: 3.8rem;
`;

const StyledTitle = styled.p`
  color: white;
  padding: 2rem 0;
  font-size: 2rem;
`;

const StyledLoginContainer = styled.div(
  ({ theme }) => `
  display: flex;
  justify-content: center;
  gap: 2.4rem;
  width: 33.6rem;
  color: ${theme.colors.WHITE_100};
  background-color: ${theme.colors.BLACK_100};
  border-radius: 15px;
  padding: 10px;
`
);

export default LandingPage;
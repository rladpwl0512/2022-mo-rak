import { HTMLAttributes } from 'react';
import {
  StyledAppointmentImage,
  StyledFeatureCircle,
  StyledFeaturesContainer,
  StyledContainer,
  StyledFeatureName,
  StyledGlitterImage,
  StyledUndefinedImage,
  StyledPollImage,
  StyledHighlightImage,
  StyledSubTitle,
  StyledTitle,
  StyledIntroductionTitleContainer
} from './LandingFeatureIntroductionSection.styles';

import Glitter from '../../../../assets/glitter.svg';
import Highlight from '../../../../assets/highlight.svg';
import Poll from '../../../../assets/poll-small.svg';
import Appointment from '../../../../assets/time.svg';
import Undefined from '../../../../assets/question.svg';
import LandingNavbar from '../LandingNavbar/LandingNavbar';

interface Props extends HTMLAttributes<HTMLElement> {}

function LandingFeatureIntroductionSection({ id }: Props) {
  return (
    <StyledContainer id={id}>
      <LandingNavbar />

      <StyledIntroductionTitleContainer>
        <StyledTitle>모락을 통해서 할 수 있어요!</StyledTitle>
        <StyledSubTitle>모락이 모임을 더 편하고, 즐겁게 할 수 있도록 도와줄게요</StyledSubTitle>
      </StyledIntroductionTitleContainer>

      <StyledFeaturesContainer>
        <div>
          <StyledFeatureCircle>
            <StyledPollImage src={Poll} alt="poll" />
            <StyledHighlightImage src={Highlight} alt="highlight" />
          </StyledFeatureCircle>
          <StyledFeatureName>투표하기</StyledFeatureName>
        </div>

        <div>
          <StyledFeatureCircle>
            <StyledAppointmentImage src={Appointment} alt="appointment" />
          </StyledFeatureCircle>
          <StyledFeatureName>약속잡기</StyledFeatureName>
        </div>

        <div>
          <StyledFeatureCircle>
            <StyledUndefinedImage src={Undefined} alt="undefined" />
            <StyledGlitterImage src={Glitter} alt="glitter" />
          </StyledFeatureCircle>
          <StyledFeatureName>coming soon!</StyledFeatureName>
        </div>
      </StyledFeaturesContainer>
    </StyledContainer>
  );
}

export default LandingFeatureIntroductionSection;

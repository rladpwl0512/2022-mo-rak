import { Appointment } from '../../../../types/appointment';
import { getFormattedHourMinuteDuration } from '../../../../utils/date';
import { StyledContainer } from './AppointmentProgressDetail.styles';

type Props = {
  durationHours: Appointment['durationHours'];
  durationMinutes: Appointment['durationMinutes'];
  startTime: Appointment['startTime'];
  endTime: Appointment['endTime'];
};

function AppointmentProgressDetail({ durationHours, durationMinutes, startTime, endTime }: Props) {
  return (
    <StyledContainer>
      진행 시간: {getFormattedHourMinuteDuration(durationHours, durationMinutes)} ({startTime}~
      {endTime})
    </StyledContainer>
  );
}

export default AppointmentProgressDetail;

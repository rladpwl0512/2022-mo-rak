package com.morak.back.appointment.application;

import com.morak.back.appointment.domain.Appointment;
import com.morak.back.appointment.domain.AppointmentRepository;
import com.morak.back.appointment.domain.AvailableTime;
import com.morak.back.appointment.domain.AvailableTimeRepository;
import com.morak.back.appointment.domain.RankRecommendation;
import com.morak.back.appointment.domain.RecommendationCells;
import com.morak.back.appointment.exception.AppointmentAuthorizationException;
import com.morak.back.appointment.exception.AppointmentDomainLogicException;
import com.morak.back.appointment.exception.AppointmentNotFoundException;
import com.morak.back.appointment.ui.dto.AppointmentAllResponse;
import com.morak.back.appointment.ui.dto.AppointmentCreateRequest;
import com.morak.back.appointment.ui.dto.AppointmentResponse;
import com.morak.back.appointment.ui.dto.AppointmentStatusResponse;
import com.morak.back.appointment.ui.dto.AvailableTimeRequest;
import com.morak.back.appointment.ui.dto.RecommendationResponse;
import com.morak.back.auth.domain.Member;
import com.morak.back.auth.domain.MemberRepository;
import com.morak.back.auth.exception.MemberNotFoundException;
import com.morak.back.core.application.NotificationService;
import com.morak.back.core.domain.Code;
import com.morak.back.core.domain.CodeGenerator;
import com.morak.back.core.domain.RandomCodeGenerator;
import com.morak.back.core.domain.slack.FormattableData;
import com.morak.back.core.exception.CustomErrorCode;
import com.morak.back.core.support.Generated;
import com.morak.back.core.util.MessageFormatter;
import com.morak.back.team.domain.Team;
import com.morak.back.team.domain.TeamMember;
import com.morak.back.team.domain.TeamMemberRepository;
import com.morak.back.team.domain.TeamRepository;
import com.morak.back.team.exception.TeamAuthorizationException;
import com.morak.back.team.exception.TeamNotFoundException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AppointmentService {

    private static final CodeGenerator CODE_GENERATOR = new RandomCodeGenerator();

    private final AppointmentRepository appointmentRepository;
    private final AvailableTimeRepository availableTimeRepository;
    private final MemberRepository memberRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    private final NotificationService notificationService;

    public String createAppointment(String teamCode, Long memberId, AppointmentCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> MemberNotFoundException.of(CustomErrorCode.MEMBER_NOT_FOUND_ERROR, memberId));
        Team team = teamRepository.findByCode(teamCode)
                .orElseThrow(() -> TeamNotFoundException.ofTeam(CustomErrorCode.TEAM_NOT_FOUND_ERROR, teamCode));
        validateMemberInTeam(team, member);

        Appointment savedAppointment = appointmentRepository.save(
                request.toAppointment(team, member, Code.generate(CODE_GENERATOR))
        );
        notificationService.notifyMenuStatus(team, MessageFormatter.formatOpen(FormattableData.from(savedAppointment)));
        return savedAppointment.getCode();
    }

    @Transactional(readOnly = true)
    public List<AppointmentAllResponse> findAppointments(String teamCode, Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> MemberNotFoundException.of(CustomErrorCode.MEMBER_NOT_FOUND_ERROR, memberId));
        Team team = teamRepository.findByCode(teamCode)
                .orElseThrow(() -> TeamNotFoundException.ofTeam(CustomErrorCode.TEAM_NOT_FOUND_ERROR, teamCode));
        validateMemberInTeam(team, member);

        return appointmentRepository.findAllByTeam(team).stream()
                .map(AppointmentAllResponse::from)
                .sorted()
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse findAppointment(String teamCode, Long memberId, String appointmentCode) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> MemberNotFoundException.of(CustomErrorCode.MEMBER_NOT_FOUND_ERROR, memberId));
        Team team = teamRepository.findByCode(teamCode)
                .orElseThrow(() -> TeamNotFoundException.ofTeam(CustomErrorCode.TEAM_NOT_FOUND_ERROR, teamCode));
        validateMemberInTeam(team, member);

        Appointment appointment = appointmentRepository.findByCode(appointmentCode)
                .orElseThrow(() -> AppointmentNotFoundException.ofAppointment(
                        CustomErrorCode.APPOINTMENT_NOT_FOUND_ERROR, appointmentCode
                ));
        validateAppointmentInTeam(team, appointment);
        return AppointmentResponse.from(appointment, member);
    }

    private void validateAppointmentInTeam(Team findTeam, Appointment appointment) {
        if (!appointment.isBelongedTo(findTeam)) {
            throw new AppointmentAuthorizationException(
                    CustomErrorCode.APPOINTMENT_TEAM_MISMATCHED_ERROR,
                    String.format("%s 코드의 약속잡기는 %s 코드의 팀에 속해있지 않습니다.",
                            appointment.getCode(), findTeam.getCode()
                    )
            );
        }
    }

    public void selectAvailableTimes(String teamCode, Long memberId, String appointmentCode,
                                     List<AvailableTimeRequest> requests) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> MemberNotFoundException.of(CustomErrorCode.MEMBER_NOT_FOUND_ERROR, memberId));
        Team team = teamRepository.findByCode(teamCode)
                .orElseThrow(() -> TeamNotFoundException.ofTeam(CustomErrorCode.TEAM_NOT_FOUND_ERROR, teamCode));
        validateMemberInTeam(team, member);

        Appointment appointment = appointmentRepository.findByCode(appointmentCode)
                .orElseThrow(() -> AppointmentNotFoundException.ofAppointment(
                        CustomErrorCode.APPOINTMENT_NOT_FOUND_ERROR, appointmentCode
                ));

        validateDuplicatedRequest(requests);
        validateAppointmentInTeam(team, appointment);
        validateAppointmentStatus(appointment);

        availableTimeRepository.deleteAllByMemberAndAppointment(member, appointment);
        List<AvailableTime> availableTimes = requests.stream()
                .map(request -> request.toAvailableTime(member, appointment))
                .collect(Collectors.toList());
        availableTimeRepository.saveAll(availableTimes);
    }

    private void validateAppointmentStatus(Appointment appointment) {
        if (appointment.isClosed()) {
            throw new AppointmentDomainLogicException(
                    CustomErrorCode.APPOINTMENT_ALREADY_CLOSED_ERROR,
                    appointment.getCode() + "코드의 약속잡기는 마감되었습니다."
            );
        }
    }

    private void validateDuplicatedRequest(List<AvailableTimeRequest> availableTimeRequest) {
        HashSet<AvailableTimeRequest> availableTimeRequestsSet = new HashSet<>(availableTimeRequest);
        if (availableTimeRequestsSet.size() != availableTimeRequest.size()) {
            throw new AppointmentDomainLogicException(
                    CustomErrorCode.APPOINTMENT_DUPLICATED_AVAILABLE_TIME_ERROR,
                    availableTimeRequest + " 요청된 시간에 중복된 시간이 있습니다."
            );
        }
    }

    @Transactional(readOnly = true)
    public List<RecommendationResponse> recommendAvailableTimes(String teamCode, Long memberId,
                                                                String appointmentCode) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> MemberNotFoundException.of(CustomErrorCode.MEMBER_NOT_FOUND_ERROR, memberId));
        Team team = teamRepository.findByCode(teamCode)
                .orElseThrow(() -> TeamNotFoundException.ofTeam(CustomErrorCode.TEAM_NOT_FOUND_ERROR, teamCode));
        validateMemberInTeam(team, member);

        Appointment appointment = appointmentRepository.findByCode(appointmentCode)
                .orElseThrow(() -> AppointmentNotFoundException.ofAppointment(
                        CustomErrorCode.APPOINTMENT_NOT_FOUND_ERROR, appointmentCode
                ));
        validateAppointmentInTeam(team, appointment);
        List<Member> members = teamMemberRepository.findAllByTeam(team)
                .stream()
                .map(TeamMember::getMember)
                .collect(Collectors.toList());

        RecommendationCells recommendationCells = RecommendationCells.of(appointment, members);

        List<AvailableTime> availableTimes = availableTimeRepository.findAllByAppointment(appointment);
        List<RankRecommendation> rankRecommendations = recommendationCells.recommend(availableTimes);

        return rankRecommendations.stream()
                .map(RecommendationResponse::from)
                .collect(Collectors.toList());
    }

    public void closeAppointment(String teamCode, Long memberId, String appointmentCode) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> MemberNotFoundException.of(CustomErrorCode.MEMBER_NOT_FOUND_ERROR, memberId));
        Team team = teamRepository.findByCode(teamCode)
                .orElseThrow(() -> TeamNotFoundException.ofTeam(CustomErrorCode.TEAM_NOT_FOUND_ERROR, teamCode));
        validateMemberInTeam(team, member);

        Appointment appointment = appointmentRepository.findByCode(appointmentCode)
                .orElseThrow(() -> AppointmentNotFoundException.ofAppointment(
                        CustomErrorCode.APPOINTMENT_NOT_FOUND_ERROR, appointmentCode
                ));
        validateHost(member, appointment);
        validateAppointmentInTeam(team, appointment);
        appointment.close(member);
        notificationService.notifyMenuStatus(team, MessageFormatter.formatClosed(FormattableData.from(appointment)));
    }

    public void deleteAppointment(String teamCode, Long memberId, String appointmentCode) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> MemberNotFoundException.of(CustomErrorCode.MEMBER_NOT_FOUND_ERROR, memberId));
        Team team = teamRepository.findByCode(teamCode)
                .orElseThrow(() -> TeamNotFoundException.ofTeam(CustomErrorCode.TEAM_NOT_FOUND_ERROR, teamCode));
        validateMemberInTeam(team, member);

        Appointment appointment = appointmentRepository.findByCode(appointmentCode)
                .orElseThrow(() -> AppointmentNotFoundException.ofAppointment(
                        CustomErrorCode.APPOINTMENT_NOT_FOUND_ERROR, appointmentCode
                ));
        validateHost(member, appointment);
        validateAppointmentInTeam(team, appointment);
        availableTimeRepository.deleteAllByAppointment(appointment);
        appointmentRepository.delete(appointment);
    }

    private void validateHost(Member member, Appointment appointment) {
        if (!appointment.isHost(member)) {
            throw new AppointmentAuthorizationException(
                    CustomErrorCode.APPOINTMENT_MEMBER_MISMATCHED_ERROR,
                    member.getId() + "번 멤버는 " + appointment.getCode() + "코드의 약속잡기의 호스트가 아닙니다."
            );
        }
    }

    private void validateMemberInTeam(Team team, Member member) {
        if (!teamMemberRepository.existsByTeamAndMember(team, member)) {
            throw TeamAuthorizationException.of(
                    CustomErrorCode.TEAM_MEMBER_MISMATCHED_ERROR,
                    team.getId(),
                    member.getId()
            );
        }
    }

    @Generated
    public void notifyClosedBySchedule() {
        List<Appointment> appointmentsToBeClosed = appointmentRepository.findAllToBeClosed(LocalDateTime.now());

        appointmentRepository.closeAll(appointmentsToBeClosed);
        notifyStatusAll(appointmentsToBeClosed);
    }

    private void notifyStatusAll(List<Appointment> appointmentsToBeClosed) {
        Map<Team, String> teamMessages = appointmentsToBeClosed.stream()
                .collect(Collectors.toMap(
                        Appointment::getTeam,
                        appointment -> MessageFormatter.formatClosed(FormattableData.from(appointment))
                ));
        notificationService.notifyAllMenuStatus(teamMessages);
    }

    public AppointmentStatusResponse findAppointmentStatus(String teamCode, Long memberId, String appointmentCode) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> MemberNotFoundException.of(CustomErrorCode.MEMBER_NOT_FOUND_ERROR, memberId));
        Team team = teamRepository.findByCode(teamCode)
                .orElseThrow(() -> TeamNotFoundException.ofTeam(CustomErrorCode.TEAM_NOT_FOUND_ERROR, teamCode));
        validateMemberInTeam(team, member);

        Appointment appointment = appointmentRepository.findByCode(appointmentCode)
                .orElseThrow(() -> AppointmentNotFoundException.ofAppointment(
                        CustomErrorCode.APPOINTMENT_NOT_FOUND_ERROR, appointmentCode
                ));
        validateAppointmentInTeam(team, appointment);

        return new AppointmentStatusResponse(appointment.getStatus());
    }
}

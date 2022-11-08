package com.morak.back.notification.application;

import com.morak.back.appointment.domain.AppointmentEvent;
import com.morak.back.auth.domain.Member;
import com.morak.back.auth.domain.MemberRepository;
import com.morak.back.core.domain.MenuEvent;
import com.morak.back.core.exception.CustomErrorCode;
import com.morak.back.notification.application.dto.NotificationMessageRequest;
import com.morak.back.notification.domain.slack.SlackClient;
import com.morak.back.notification.domain.slack.SlackWebhook;
import com.morak.back.notification.domain.slack.SlackWebhookRepository;
import com.morak.back.poll.domain.PollEvent;
import com.morak.back.role.domain.RoleHistoryEvent;
import com.morak.back.team.domain.Team;
import com.morak.back.team.domain.TeamRepository;
import com.morak.back.team.exception.TeamNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
@Async
@RequiredArgsConstructor
public class NotificationService {

    private final SlackWebhookRepository slackWebhookRepository;
    private final TeamRepository teamRepository;
    private final MemberRepository memberRepository;
    private final SlackClient slackClient;

    @TransactionalEventListener(condition = "#event.isClosed() == false")
    public void notifyTeamPollOpen(PollEvent event) {
        notifyTeamMenuEvent(event, NotificationMessageRequest::fromPollOpen);
    }

    @TransactionalEventListener(condition = "#event.isClosed() == true")
    public void notifyTeamPollClosed(PollEvent event) {
        notifyTeamMenuEvent(event, NotificationMessageRequest::fromPollClosed);
    }

    @TransactionalEventListener(condition = "#event.isClosed() == false")
    public void notifyTeamAppointmentOpen(AppointmentEvent event) {
        notifyTeamMenuEvent(event, NotificationMessageRequest::fromAppointmentOpen);
    }

    @TransactionalEventListener(condition = "#event.isClosed() == true")
    public void notifyTeamAppointmentClosed(AppointmentEvent event) {
        notifyTeamMenuEvent(event, NotificationMessageRequest::fromAppointmentClosed);
    }

    private void notifyTeamMenuEvent(MenuEvent event,
                                     BiFunction<MenuEvent, Team, NotificationMessageRequest> requestBiFunction) {
        Optional<SlackWebhook> webhook = slackWebhookRepository.findByTeamCode(event.getTeamCode());
        if (webhook.isEmpty()) {
            return;
        }
        Team team = findTeamByCode(event.getTeamCode());
        slackClient.notifyMessage(webhook.get(), requestBiFunction.apply(event, team));
    }

    private Team findTeamByCode(String teamCode) {
        return teamRepository.findByCode(teamCode).orElseThrow(
                () -> TeamNotFoundException.ofTeam(CustomErrorCode.TEAM_NOT_FOUND_ERROR, teamCode)
        );
    }

    @TransactionalEventListener
    public void notifyTeamRoleHistory(RoleHistoryEvent event) {
        Optional<SlackWebhook> webhook = slackWebhookRepository.findByTeamCode(event.getTeamCode());
        if (webhook.isEmpty()) {
            return;
        }
        Team team = findTeamByCode(event.getTeamCode());
        Map<Member, String> roleNameByMembers = mapRoleNameByMember(event);

        NotificationMessageRequest request = NotificationMessageRequest.fromRoleHistory(
                event.getDateTime(), team,
                roleNameByMembers
        );
        slackClient.notifyMessage(webhook.get(), request);
    }

    private Map<Member, String> mapRoleNameByMember(RoleHistoryEvent event) {
        List<Member> members = memberRepository.findAllByIdIn(event.getRoleNameByMemberIds().keySet());
        return members.stream()
                .collect(Collectors.toMap(
                        Function.identity(),
                        member -> event.getRoleName(member.getId())
                ));
    }
}

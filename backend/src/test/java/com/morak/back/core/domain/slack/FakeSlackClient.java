package com.morak.back.core.domain.slack;

import com.morak.back.core.exception.CustomErrorCode;
import com.morak.back.core.exception.ExternalException;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class FakeSlackClient implements SlackClient {

    private FakeApiReceiver receiver;

    public FakeSlackClient(FakeApiReceiver receiver) {
        this.receiver = receiver;
    }

    @Override
    public void notifyMessage(SlackWebhook webhook, String message) {
        if (message.contains("invalid")) {
            throw new ExternalException(
                    CustomErrorCode.NOTIFICATION_REQUEST_FAILURE_ERROR,
                    "요청 실패 ㅠ"
            );
        }

        receiver.setMessage("슬랙 API를 요청합니다\n" +
                "url = " + webhook.getUrl() + "\n" +
                "message = " + message);
    }
}

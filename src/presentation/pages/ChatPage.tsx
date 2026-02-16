import { observer } from "mobx-react-lite";
import { useChat } from "../../hooks/agents";
import { MessageComposer } from "../components/molecules";
import { ChatHeader, MessageFeed } from "../components/organisms/chat";

export const ChatPage = observer(function ChatPage() {
    const {
        messages,
        sendMessage,
        cancelGeneration,
        isStreaming,
        isAwaitingFirstChunk,
    } = useChat();

    return (
        <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-3xl bg-main-900/70 backdrop-blur-md">
            <ChatHeader />
            <MessageFeed
                messages={messages}
                sendMessage={sendMessage}
                showLoader={isAwaitingFirstChunk}
            />
            <MessageComposer
                onMessageSend={sendMessage}
                onCancelGeneration={cancelGeneration}
                isStreaming={isStreaming}
            />
        </section>
    );
});

import { observer } from "mobx-react-lite";
import { useChat } from "../../hooks/agents";
import { MessageComposer } from "../components/molecules";
import {
    ChatHeader,
    ChatSidebar,
    MessageFeed,
} from "../components/organisms/chat";

export const ChatPage = observer(function ChatPage() {
    const {
        messages,
        sendMessage,
        cancelGeneration,
        isStreaming,
        isAwaitingFirstChunk,
    } = useChat();

    return (
        <main className="h-screen w-screen overflow-hidden bg-main-900 p-3 text-main-100">
            <div className="flex h-full w-full gap-3">
                <ChatSidebar />

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
            </div>
        </main>
    );
});

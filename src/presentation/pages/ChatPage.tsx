import { useOllamaChat } from "../../hooks";
import { MessageComposer } from "../components/molecules";
import { ChatHeader, ChatSidebar, MessageFeed } from "../components/organisms";

export function ChatPage() {
    const { messages, sendMessage, isStreaming, isAwaitingFirstChunk } =
        useOllamaChat();

    return (
        <main className="h-screen w-screen overflow-hidden bg-neutral-900 p-3 text-neutral-100">
            <div className="flex h-full w-full gap-3">
                <ChatSidebar />

                <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-3xl bg-neutral-900/70 backdrop-blur-md">
                    <ChatHeader />
                    <MessageFeed
                        messages={messages}
                        showLoader={isAwaitingFirstChunk}
                    />
                    <MessageComposer
                        onMessageSend={sendMessage}
                        disabled={isStreaming}
                    />
                </section>
            </div>
        </main>
    );
}

type DecisionResolver = {
    resolve: (accepted: boolean) => void;
};

class CommandExecApprovalService {
    private readonly pendingByMessageId = new Map<string, DecisionResolver>();

    waitForDecision(messageId: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.pendingByMessageId.set(messageId, { resolve });
        });
    }

    resolve(messageId: string, accepted: boolean): void {
        const pending = this.pendingByMessageId.get(messageId);

        if (!pending) {
            return;
        }

        this.pendingByMessageId.delete(messageId);
        pending.resolve(accepted);
    }

    hasPending(messageId: string): boolean {
        return this.pendingByMessageId.has(messageId);
    }
}

export const commandExecApprovalService = new CommandExecApprovalService();

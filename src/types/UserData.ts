export type ActiveDialogContextPayload = {
    activeDialogId: string;
    activeProjectId: string | null;
};

export type ActiveDialogContextUpdater = (
    payload: ActiveDialogContextPayload,
) => void;

export type MetaPayload = {
    currentUserId: string;
};

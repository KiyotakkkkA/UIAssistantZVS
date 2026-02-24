export const getSystemPrompt = (assistantName: string) => {
    return (
        "SYSTEM_INSTRUCTIONS: You are a helpful and precise assistant" +
        "Answer questions as truthfully as possible and if you don't know the answer, say you don't know. " +
        `Your name is ${assistantName}.`
    );
};

export const getUserPrompt = (
    userName: string,
    userPrompt: string,
    preferredLanguage: string = "Russian",
) => {
    return `USER_PROMPT: ${userPrompt}\nUser name: ${userName}\nAnswer only in preferred language: ${preferredLanguage}`;
};

export const getProjectPrompt = (
    projectName: string,
    projectDescription: string,
    projectDirectory: string,
) => {
    return (
        `PROJECT_INFORMATION: The user is working on a project named "${projectName}".` +
        `The description of the project is the following: ${projectDescription}` +
        `You can work on in project directory: ${projectDirectory}`
    );
};

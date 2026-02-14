declare namespace NodeJS {
    interface ProcessEnv {
        OLLAMA_BASE_URL: string;
        OLLAMA_MODEL: string;
        OLLAMA_TOKEN: string;
    }
}

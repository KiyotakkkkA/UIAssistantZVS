class Config {
    private env = import.meta.env;

    private getBaseUrl() {
        const rawBaseUrl = this.env.VITE_OLLAMA_BASE_URL?.trim();
        const normalized = rawBaseUrl?.replace(/\/+$/, "");

        if (
            this.env.DEV &&
            (!normalized || normalized === "https://ollama.com")
        ) {
            return "/ollama";
        }

        return normalized || "/ollama";
    }

    OLLAMA_BASE_URL = this.getBaseUrl();
    OLLAMA_MODEL = this.env.VITE_OLLAMA_MODEL || "gpt-oss:20b";
    OLLAMA_TOKEN = this.env.VITE_OLLAMA_TOKEN || "";
}

export default new Config();

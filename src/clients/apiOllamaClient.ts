import axios from "axios";
import { Config } from "../config";

const ollamaClient = axios.create({
    baseURL: Config.OLLAMA_BASE_URL.trim(),
    headers: {
        "Content-Type": "application/json",
        ...(Config.OLLAMA_TOKEN && {
            Authorization: `Bearer ${Config.OLLAMA_TOKEN}`,
        }),
    },
});

export default ollamaClient;

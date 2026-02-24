import type { ScenarioSimpleBlockNode } from "../../types/Scenario";
import {
    calcBlockHeight,
    createDefaultConditionFields,
    createDefaultConditionRules,
    createDefaultVariableMeta,
    normalizeOutputSchemeString,
    parseToolInputFromSchema,
    parseToolOutputNamesFromSchema,
    type Point,
    type ScenarioCanvasInsertPayload,
} from "./scenarioCanvasSceneShared";
import { buildBlockPortAnchors } from "./scenarioCanvasScenePorts";

export const createStartEndBlocks = (): ScenarioSimpleBlockNode[] => [
    (() => {
        const block: ScenarioSimpleBlockNode = {
            id: crypto.randomUUID(),
            kind: "start",
            executionType: "system",
            title: "Стартовый",
            x: 420,
            y: 220,
            width: 240,
            height: 96,
        };

        return {
            ...block,
            portAnchors: buildBlockPortAnchors(block),
        };
    })(),
    (() => {
        const block: ScenarioSimpleBlockNode = {
            id: crypto.randomUUID(),
            kind: "end",
            executionType: "system",
            title: "Конечный",
            x: 900,
            y: 220,
            width: 240,
            height: 96,
        };

        return {
            ...block,
            portAnchors: buildBlockPortAnchors(block),
        };
    })(),
];

export const createInsertedBlock = (
    payload: ScenarioCanvasInsertPayload,
    center: Point,
): ScenarioSimpleBlockNode => {
    if (payload.kind === "prompt") {
        const block: ScenarioSimpleBlockNode = {
            id: crypto.randomUUID(),
            kind: "prompt",
            executionType: "manual",
            title: "Инструкция",
            x: center.x,
            y: center.y,
            width: 320,
            height: calcBlockHeight(1, 1, 96),
            meta: {
                prompt: {
                    instruction: "",
                },
            },
        };

        return {
            ...block,
            portAnchors: buildBlockPortAnchors(block),
        };
    }

    if (payload.kind === "condition") {
        const defaultFields = createDefaultConditionFields();

        const block: ScenarioSimpleBlockNode = {
            id: crypto.randomUUID(),
            kind: "condition",
            executionType: "manual",
            title: "Условие",
            x: center.x,
            y: center.y,
            width: 320,
            height: calcBlockHeight(defaultFields.length + 1, 3, 120),
            meta: {
                condition: {
                    fields: defaultFields,
                    rules: createDefaultConditionRules(),
                },
            },
        };

        return {
            ...block,
            portAnchors: buildBlockPortAnchors(block),
        };
    }

    if (payload.kind === "variable") {
        const defaultMeta = createDefaultVariableMeta();

        const block: ScenarioSimpleBlockNode = {
            id: crypto.randomUUID(),
            kind: "variable",
            executionType: "manual",
            title: "Переменная",
            x: center.x,
            y: center.y,
            width: 320,
            height: calcBlockHeight(
                1,
                defaultMeta.selectedVariables.length + 1,
                96,
            ),
            meta: {
                variable: defaultMeta,
            },
        };

        return {
            ...block,
            portAnchors: buildBlockPortAnchors(block),
        };
    }

    const parsedInputs = parseToolInputFromSchema(payload.toolSchema || "{}");
    const parsedOutputs = parseToolOutputNamesFromSchema(payload.outputScheme);
    const normalizedOutputScheme = normalizeOutputSchemeString(
        payload.outputScheme,
    );

    const block: ScenarioSimpleBlockNode = {
        id: crypto.randomUUID(),
        kind: "tool",
        executionType: "tools",
        title: payload.toolName || "Tool",
        x: center.x,
        y: center.y,
        width: 300,
        height: calcBlockHeight(
            parsedInputs.length + 1,
            parsedOutputs.length + 1,
            120,
        ),
        meta: {
            tool: {
                toolName: payload.toolName || "tool",
                toolSchema: payload.toolSchema || "{}",
                input: parsedInputs,
                ...(normalizedOutputScheme
                    ? {
                          outputScheme: normalizedOutputScheme,
                      }
                    : {}),
            },
        },
    };

    return {
        ...block,
        portAnchors: buildBlockPortAnchors(block),
    };
};

import type {
    ScenarioBlockKind,
    ScenarioBlockPortAnchors,
    ScenarioSimpleBlockNode,
} from "../../types/Scenario";
import {
    START_BLOCK_INPUT_PORT,
    VARIABLE_CONTINUE_OUTPUT_PORT,
} from "./scenarioVariables";
import {
    buildEvenlyDistributedAnchors,
    parseToolOutputNamesFromSchema,
    toPortKey,
} from "./scenarioCanvasSceneShared";

const SINGLE_CONTINUE_OUTPUT_KINDS = new Set(["start", "prompt"]);
const SINGLE_CONTROL_INPUT_KINDS = new Set(["prompt", "variable"]);

export const hasInputPort = (kind: ScenarioBlockKind) => kind !== "start";
export const hasOutputPort = (kind: ScenarioBlockKind) => kind !== "end";

const getBlockInputPortNames = (block: ScenarioSimpleBlockNode): string[] => {
    if (block.kind === "end") {
        return [toPortKey()];
    }

    if (block.kind === "start") {
        return [];
    }

    if (SINGLE_CONTROL_INPUT_KINDS.has(block.kind)) {
        return [START_BLOCK_INPUT_PORT];
    }

    if (block.kind === "condition") {
        const fields = block.meta?.condition?.fields ?? [];
        return [
            START_BLOCK_INPUT_PORT,
            ...fields
                .map((field) => field.name)
                .filter((name) => Boolean(name)),
        ];
    }

    const toolInputs = (block.meta?.tool?.input ?? [])
        .map((item) => item.param)
        .filter((name) => Boolean(name));

    return [START_BLOCK_INPUT_PORT, ...toolInputs];
};

const getBlockOutputPortNames = (block: ScenarioSimpleBlockNode): string[] => {
    if (block.kind === "end") {
        return [];
    }

    if (block.kind === "condition") {
        return ["yes", "no", "always"];
    }

    if (block.kind === "tool") {
        return [
            ...parseToolOutputNamesFromSchema(block.meta?.tool?.outputScheme),
            VARIABLE_CONTINUE_OUTPUT_PORT,
        ];
    }

    if (block.kind === "variable") {
        return [
            ...(block.meta?.variable?.selectedVariables ?? []),
            VARIABLE_CONTINUE_OUTPUT_PORT,
        ];
    }

    if (SINGLE_CONTINUE_OUTPUT_KINDS.has(block.kind)) {
        return [VARIABLE_CONTINUE_OUTPUT_PORT];
    }

    return [];
};

export const buildBlockPortAnchors = (
    block: Pick<ScenarioSimpleBlockNode, "kind" | "width" | "height" | "meta">,
): ScenarioBlockPortAnchors => {
    const inputAnchors: Record<string, { x: number; y: number }> = {};
    const outputAnchors: Record<string, { x: number; y: number }> = {};

    if (block.kind === "start") {
        outputAnchors[VARIABLE_CONTINUE_OUTPUT_PORT] = {
            x: block.width + 10,
            y: block.height / 2,
        };

        return {
            inputs: inputAnchors,
            outputs: outputAnchors,
        };
    }

    if (block.kind === "end") {
        inputAnchors[toPortKey()] = {
            x: -10,
            y: block.height / 2,
        };

        return {
            inputs: inputAnchors,
            outputs: outputAnchors,
        };
    }

    if (SINGLE_CONTROL_INPUT_KINDS.has(block.kind)) {
        inputAnchors[START_BLOCK_INPUT_PORT] = {
            x: -10,
            y: block.height / 2,
        };
    } else if (block.kind === "condition") {
        inputAnchors[START_BLOCK_INPUT_PORT] = {
            x: -10,
            y: block.height * 0.14,
        };

        const fields = block.meta?.condition?.fields ?? [];
        fields.forEach((field, index) => {
            inputAnchors[toPortKey(field.name)] = {
                x: -10,
                y:
                    block.height *
                    (0.24 + ((index + 1) / (fields.length + 1)) * 0.68),
            };
        });
    } else {
        const inputPorts = getBlockInputPortNames(
            block as ScenarioSimpleBlockNode,
        );
        Object.assign(
            inputAnchors,
            buildEvenlyDistributedAnchors(inputPorts, -10, block.height),
        );
    }

    if (block.kind === "condition") {
        outputAnchors.yes = { x: block.width + 10, y: block.height * 0.28 };
        outputAnchors.no = { x: block.width + 10, y: block.height * 0.5 };
        outputAnchors.always = { x: block.width + 10, y: block.height * 0.72 };
    } else {
        const outputPorts = getBlockOutputPortNames(
            block as ScenarioSimpleBlockNode,
        );
        Object.assign(
            outputAnchors,
            buildEvenlyDistributedAnchors(
                outputPorts,
                block.width + 10,
                block.height,
            ),
        );
    }

    return {
        inputs: inputAnchors,
        outputs: outputAnchors,
    };
};

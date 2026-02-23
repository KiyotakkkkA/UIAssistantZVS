import type {
    ScenarioConditionMeta,
    ScenarioSimpleBlockNode,
    ScenarioVariableMeta,
} from "../types/Scenario";
import {
    START_BLOCK_INPUT_PORT,
    VARIABLE_CONTINUE_OUTPUT_PORT,
} from "./scenarioVariables";
import {
    getToolParamInputPorts,
    getToolParamOutputPorts,
    getVariableParamOutputPorts,
} from "./scenarioPorts";

export type Point = {
    x: number;
    y: number;
};

const DEFAULT_PORT_KEY = "__default__";

export const createDefaultConditionMeta = (): ScenarioConditionMeta => ({
    fields: [{ id: crypto.randomUUID(), name: "value" }],
    rules: [
        {
            id: crypto.randomUUID(),
            title: "Условие 1",
            operands: [
                {
                    id: crypto.randomUUID(),
                    leftSource: "field",
                    leftValue: "value",
                    operator: "=",
                    rightSource: "value",
                    rightValue: "",
                },
            ],
        },
    ],
});

export const createDefaultVariableMeta = (): ScenarioVariableMeta => ({
    selectedVariables: ["current_date"],
});

export const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

const getVariableOutputPorts = (block: ScenarioSimpleBlockNode): string[] => {
    if (block.kind !== "variable") {
        return [VARIABLE_CONTINUE_OUTPUT_PORT];
    }

    const selected = getVariableParamOutputPorts(block);

    return [...selected, VARIABLE_CONTINUE_OUTPUT_PORT];
};

const getAnchoredPoint = (
    block: ScenarioSimpleBlockNode,
    direction: "inputs" | "outputs",
    portName?: string,
): Point | null => {
    const key =
        portName && portName.trim().length > 0 ? portName : DEFAULT_PORT_KEY;
    const anchor = block.portAnchors?.[direction]?.[key];

    if (!anchor) {
        return null;
    }

    return {
        x: block.x + anchor.x,
        y: block.y + anchor.y,
    };
};

export const getOutPoint = (
    block: ScenarioSimpleBlockNode,
    outputName?: string,
): Point => {
    const anchored = getAnchoredPoint(block, "outputs", outputName);
    if (anchored) {
        return anchored;
    }

    if (block.kind === "tool") {
        const outputs = [
            ...getToolParamOutputPorts(block),
            VARIABLE_CONTINUE_OUTPUT_PORT,
        ];
        const count = Math.max(outputs.length, 1);
        const index = outputName
            ? Math.max(
                  0,
                  outputs.findIndex((item) => item === outputName),
              )
            : count - 1;

        return {
            x: block.x + block.width + 10,
            y: block.y + ((index + 1) * block.height) / (count + 1),
        };
    }

    if (block.kind === "prompt") {
        return {
            x: block.x + block.width + 10,
            y: block.y + block.height / 2,
        };
    }

    if (block.kind === "condition" && outputName) {
        const outputOffsets: Record<string, number> = {
            yes: 0.28,
            no: 0.5,
            always: 0.72,
        };

        return {
            x: block.x + block.width + 10,
            y: block.y + block.height * (outputOffsets[outputName] ?? 0.5),
        };
    }

    if (block.kind === "variable") {
        const outputs = getVariableOutputPorts(block);
        const count = Math.max(outputs.length, 1);
        const index = outputName
            ? Math.max(
                  0,
                  outputs.findIndex((item) => item === outputName),
              )
            : count - 1;

        return {
            x: block.x + block.width + 10,
            y: block.y + ((index + 1) * block.height) / (count + 1),
        };
    }

    return {
        x: block.x + block.width + 10,
        y: block.y + block.height / 2,
    };
};

export const getInPoint = (block: ScenarioSimpleBlockNode): Point => {
    const anchored = getAnchoredPoint(block, "inputs");
    if (anchored) {
        return anchored;
    }

    return {
        x: block.x - 10,
        y: block.y + block.height / 2,
    };
};

export const getInputPoint = (
    block: ScenarioSimpleBlockNode,
    inputName: string,
): Point => {
    const anchored = getAnchoredPoint(block, "inputs", inputName);
    if (anchored) {
        return anchored;
    }

    if (inputName === START_BLOCK_INPUT_PORT) {
        if (block.kind === "prompt") {
            return {
                x: block.x - 10,
                y: block.y + block.height * 0.32,
            };
        }

        if (block.kind === "variable") {
            return {
                x: block.x - 10,
                y: block.y + block.height * 0.32,
            };
        }

        if (block.kind === "condition") {
            return {
                x: block.x - 10,
                y: block.y + block.height * 0.14,
            };
        }

        return {
            x: block.x - 10,
            y: block.y + block.height * 0.14,
        };
    }

    if (block.kind === "condition") {
        const fields = block.meta?.condition?.fields ?? [];
        const count = Math.max(fields.length, 1);
        const index = Math.max(
            0,
            fields.findIndex((item) => item.name === inputName),
        );

        return {
            x: block.x - 10,
            y:
                block.y +
                block.height * (0.24 + ((index + 1) / (count + 1)) * 0.68),
        };
    }

    if (block.kind === "variable") {
        return {
            x: block.x - 10,
            y: block.y + block.height / 2,
        };
    }

    if (block.kind === "prompt") {
        return {
            x: block.x - 10,
            y: block.y + block.height / 2,
        };
    }

    const inputs = getToolParamInputPorts(block);
    const countWithStart = Math.max(inputs.length + 1, 2);
    const index = Math.max(
        0,
        inputs.findIndex((item) => item === inputName),
    );

    return {
        x: block.x - 10,
        y: block.y + ((index + 2) * block.height) / (countWithStart + 1),
    };
};

export const buildConnectionPath = (from: Point, to: Point) => {
    const distance = Math.abs(to.x - from.x);
    const bend = Math.max(70, Math.min(220, distance * 0.5));

    return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`;
};

export const toScenePoint = (
    clientX: number,
    clientY: number,
    viewportRect: DOMRect,
    offset: Point,
    scale: number,
): Point => {
    return {
        x: (clientX - viewportRect.left - offset.x) / scale,
        y: (clientY - viewportRect.top - offset.y) / scale,
    };
};

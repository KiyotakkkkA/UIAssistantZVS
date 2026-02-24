import type {
    ScenarioConnection,
    ScenarioSimpleBlockNode,
} from "../../types/Scenario";
import {
    START_BLOCK_INPUT_PORT,
    VARIABLE_CONTINUE_OUTPUT_PORT,
} from "./scenarioVariables";

const CONDITION_CONTINUE_OUTPUTS = ["yes", "no", "always"] as const;
const CONTINUE_ENABLED_KINDS = new Set(["start", "tool", "prompt", "variable"]);

const tryParseOutputSchemaNames = (raw?: string): string[] => {
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw) as {
            properties?: Record<string, unknown>;
        };
        return Object.keys(parsed.properties ?? {});
    } catch {
        return [];
    }
};

export const getToolParamInputPorts = (
    block: ScenarioSimpleBlockNode,
): string[] =>
    block.kind === "tool"
        ? (block.meta?.tool?.input ?? []).map((item) => item.param)
        : [];

export const getToolParamOutputPorts = (
    block: ScenarioSimpleBlockNode,
): string[] =>
    block.kind === "tool"
        ? tryParseOutputSchemaNames(block.meta?.tool?.outputScheme)
        : [];

export const getConditionParamInputPorts = (
    block: ScenarioSimpleBlockNode,
): string[] =>
    block.kind === "condition"
        ? (block.meta?.condition?.fields ?? []).map((item) => item.name)
        : [];

export const getConditionContinueOutputPorts = (): string[] => [
    ...CONDITION_CONTINUE_OUTPUTS,
];

export const getVariableParamOutputPorts = (
    block: ScenarioSimpleBlockNode,
): string[] =>
    block.kind === "variable"
        ? (block.meta?.variable?.selectedVariables ?? [])
        : [];

export const getParameterInputPorts = (
    block: ScenarioSimpleBlockNode,
): string[] => {
    const resolverByKind: Partial<
        Record<ScenarioSimpleBlockNode["kind"], () => string[]>
    > = {
        tool: () => getToolParamInputPorts(block),
        condition: () => getConditionParamInputPorts(block),
    };

    const resolver = resolverByKind[block.kind];
    return resolver ? resolver() : [];
};

export const getParameterOutputPorts = (
    block: ScenarioSimpleBlockNode,
): string[] => {
    const resolverByKind: Partial<
        Record<ScenarioSimpleBlockNode["kind"], () => string[]>
    > = {
        tool: () => getToolParamOutputPorts(block),
        variable: () => getVariableParamOutputPorts(block),
    };

    const resolver = resolverByKind[block.kind];
    return resolver ? resolver() : [];
};

export const getContinueOutputPorts = (
    block: ScenarioSimpleBlockNode,
): string[] => {
    if (block.kind === "condition") {
        return getConditionContinueOutputPorts();
    }

    if (CONTINUE_ENABLED_KINDS.has(block.kind)) {
        return [VARIABLE_CONTINUE_OUTPUT_PORT];
    }

    return [];
};

export const isContinueOutputPort = (
    block: ScenarioSimpleBlockNode,
    portName?: string,
): boolean => {
    const continuePorts = getContinueOutputPorts(block);

    if (continuePorts.length === 0) {
        return false;
    }

    if (!portName) {
        return block.kind === "start";
    }

    return continuePorts.includes(portName);
};

export const isParameterOutputPort = (
    block: ScenarioSimpleBlockNode,
    portName?: string,
): boolean => {
    if (!portName) {
        return false;
    }

    return getParameterOutputPorts(block).includes(portName);
};

export const isContinueInputPort = (
    block: ScenarioSimpleBlockNode,
    portName?: string,
): boolean => {
    if (block.kind === "end") {
        return !portName;
    }

    return portName === START_BLOCK_INPUT_PORT;
};

export const isParameterInputPort = (
    block: ScenarioSimpleBlockNode,
    portName?: string,
): boolean => {
    if (!portName) {
        return false;
    }

    return getParameterInputPorts(block).includes(portName);
};

export const getConnectionSemantic = (
    sourceBlock: ScenarioSimpleBlockNode,
    targetBlock: ScenarioSimpleBlockNode,
    connection: Pick<ScenarioConnection, "fromPortName" | "toPortName">,
): "control" | "data" | "invalid" => {
    const isControlOutput = isContinueOutputPort(
        sourceBlock,
        connection.fromPortName,
    );
    const isDataOutput = isParameterOutputPort(
        sourceBlock,
        connection.fromPortName,
    );
    const isControlInput = isContinueInputPort(
        targetBlock,
        connection.toPortName,
    );
    const isDataInput = isParameterInputPort(
        targetBlock,
        connection.toPortName,
    );

    if (isControlOutput && isControlInput) {
        return "control";
    }

    if (isDataOutput && isDataInput) {
        return "data";
    }

    return "invalid";
};

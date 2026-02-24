import type { MouseEvent } from "react";
import type {
    ScenarioConnection,
    ScenarioSimpleBlockNode,
} from "../../../../../types/Scenario";
import { getConnectionSemantic } from "../../../../../utils/scenario/scenarioPorts";

type Point = {
    x: number;
    y: number;
};

type ScenarioConnectionsLayerProps = {
    canvasWidth: number;
    canvasHeight: number;
    connections: ScenarioConnection[];
    blocksById: Map<string, ScenarioSimpleBlockNode>;
    temporaryConnectionPath: string | null;
    buildConnectionPath: (from: Point, to: Point) => string;
    getOutPoint: (block: ScenarioSimpleBlockNode, outputName?: string) => Point;
    getInPoint: (block: ScenarioSimpleBlockNode) => Point;
    getInputPoint: (block: ScenarioSimpleBlockNode, inputName: string) => Point;
    onConnectionMouseDown: (
        event: MouseEvent<SVGPathElement>,
        connection: ScenarioConnection,
    ) => void;
};

export function ScenarioConnectionsLayer({
    canvasWidth,
    canvasHeight,
    connections,
    blocksById,
    temporaryConnectionPath,
    buildConnectionPath,
    getOutPoint,
    getInPoint,
    getInputPoint,
    onConnectionMouseDown,
}: ScenarioConnectionsLayerProps) {
    return (
        <svg
            className="absolute left-0 top-0 h-full w-full overflow-visible"
            width={canvasWidth}
            height={canvasHeight}
        >
            <defs>
                <marker
                    id="scenario-arrow"
                    markerWidth="10"
                    markerHeight="8"
                    refX="9"
                    refY="4"
                    orient="auto"
                >
                    <path
                        d="M0,0 L10,4 L0,8 Z"
                        fill="rgba(160, 171, 206, 0.95)"
                    />
                </marker>
                <marker
                    id="scenario-arrow-control"
                    markerWidth="10"
                    markerHeight="8"
                    refX="9"
                    refY="4"
                    orient="auto"
                >
                    <path d="M0,0 L10,4 L0,8 Z" fill="rgb(134 239 172)" />
                </marker>
            </defs>

            {connections.map((connection) => {
                const sourceBlock = blocksById.get(connection.fromBlockId);
                const targetBlock = blocksById.get(connection.toBlockId);

                if (!sourceBlock || !targetBlock) {
                    return null;
                }

                const pathD = buildConnectionPath(
                    getOutPoint(sourceBlock, connection.fromPortName),
                    connection.toPortName
                        ? getInputPoint(targetBlock, connection.toPortName)
                        : getInPoint(targetBlock),
                );

                const semantic = getConnectionSemantic(
                    sourceBlock,
                    targetBlock,
                    connection,
                );
                const isDataLink = semantic === "data";
                const isControlLink = semantic === "control";

                return (
                    <g key={connection.id}>
                        <path
                            d={pathD}
                            fill="none"
                            stroke={
                                isControlLink
                                    ? "rgb(134 239 172)"
                                    : "rgba(160, 171, 206, 0.95)"
                            }
                            strokeWidth={2}
                            strokeDasharray={isDataLink ? "6 4" : undefined}
                            markerEnd={
                                isControlLink
                                    ? "url(#scenario-arrow-control)"
                                    : "url(#scenario-arrow)"
                            }
                        />
                        <path
                            d={pathD}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={14}
                            onMouseDown={(event) =>
                                onConnectionMouseDown(event, connection)
                            }
                        />
                    </g>
                );
            })}

            {temporaryConnectionPath ? (
                <path
                    d={temporaryConnectionPath}
                    fill="none"
                    stroke="rgba(160, 171, 206, 0.75)"
                    strokeDasharray="6 4"
                    strokeWidth={2}
                />
            ) : null}
        </svg>
    );
}

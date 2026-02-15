import fs from "node:fs";
import path from "node:path";

interface DirectoryNode {
    [name: string]: DirectoryNode | string;
}

const DEFAULT_RESOURCES_TREE: DirectoryNode = {
    themes: {},
};

export class InitService {
    private readonly basePath: string;
    private readonly resourcesTree: DirectoryNode;

    constructor(basePath: string) {
        this.basePath = basePath;
        this.resourcesTree = DEFAULT_RESOURCES_TREE;
    }

    initialize(): void {
        this.buildTree();
    }

    buildTree(): void {
        this.createDirectoryStructure(
            {
                resources: this.resourcesTree,
            },
            this.basePath,
        );
    }

    private createDirectoryStructure(
        tree: DirectoryNode,
        targetBasePath: string,
    ): void {
        for (const [name, node] of Object.entries(tree)) {
            const currentPath = path.join(targetBasePath, name);

            if (typeof node === "string") {
                if (!fs.existsSync(currentPath)) {
                    fs.writeFileSync(currentPath, node);
                }
                continue;
            }

            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath, { recursive: true });
            }

            this.createDirectoryStructure(node, currentPath);
        }
    }
}

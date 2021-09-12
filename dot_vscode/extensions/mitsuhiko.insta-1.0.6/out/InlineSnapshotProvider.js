"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineSnapshotProvider = void 0;
const vscode_1 = require("vscode");
class InlineSnapshotProvider {
    constructor(pendingSnapshotsProvider) {
        this.pendingSnapshotsProvider = pendingSnapshotsProvider;
    }
    provideTextDocumentContent(uri, token) {
        const snapshot = this.pendingSnapshotsProvider.getInlineSnapshot(uri);
        if (!snapshot) {
            throw new Error("Snapshot not found");
        }
        const inlineInfo = snapshot.inlineInfo;
        const contents = inlineInfo[uri.path == "inline.snap" ? "oldSnapshot" : "newSnapshot"];
        return `---\nsource: ${vscode_1.workspace.asRelativePath(snapshot.resourceUri)}:${inlineInfo.line}\nexpression: ${JSON.stringify(inlineInfo.expression)}\nname: ${inlineInfo.name || "unknown"}\n---\n${contents}`;
    }
}
exports.InlineSnapshotProvider = InlineSnapshotProvider;
//# sourceMappingURL=InlineSnapshotProvider.js.map
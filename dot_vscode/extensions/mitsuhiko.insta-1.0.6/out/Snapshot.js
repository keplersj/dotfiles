"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Snapshot = void 0;
const vscode_1 = require("vscode");
class Snapshot extends vscode_1.TreeItem {
    constructor(rootUri, snapshotInfo) {
        super(vscode_1.Uri.file(snapshotInfo.path));
        this.rootUri = rootUri;
        this.contextValue = "pendingInstaSnapshot";
        const relPath = vscode_1.workspace.asRelativePath(snapshotInfo.path);
        const line = snapshotInfo.line;
        this.label = line !== undefined ? `${relPath}:${line}` : relPath;
        this.key =
            line !== undefined ? `${snapshotInfo.path}:${line}` : snapshotInfo.path;
        if (snapshotInfo.type === "inline_snapshot") {
            this.description = snapshotInfo.name || "(inline)";
            this.inlineInfo = {
                oldSnapshot: snapshotInfo.old_snapshot === null
                    ? undefined
                    : snapshotInfo.old_snapshot,
                newSnapshot: snapshotInfo.new_snapshot,
                line: snapshotInfo.line,
                expression: snapshotInfo.expression === null
                    ? undefined
                    : snapshotInfo.expression,
                name: snapshotInfo.name === null ? undefined : snapshotInfo.name,
            };
        }
        this.command = {
            command: "mitsuhiko.insta.open-snapshot-diff",
            title: "",
            arguments: [this],
        };
    }
}
exports.Snapshot = Snapshot;
//# sourceMappingURL=Snapshot.js.map
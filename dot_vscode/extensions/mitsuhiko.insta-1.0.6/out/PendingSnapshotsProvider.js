"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingSnapshotsProvider = void 0;
const vscode_1 = require("vscode");
const insta_1 = require("./insta");
class PendingSnapshotsProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.cachedInlineSnapshots = {};
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    refreshDebounced() {
        if (this.pendingRefresh !== undefined) {
            clearTimeout(this.pendingRefresh);
        }
        this.pendingRefresh = setTimeout(() => {
            this.pendingRefresh = undefined;
            this.refresh();
        }, 200);
    }
    getInlineSnapshot(uri) {
        return ((uri.scheme === "instaInlineSnapshot" &&
            this.cachedInlineSnapshots[uri.fragment]) ||
            undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        const { workspaceRoot } = this;
        if (element || !workspaceRoot) {
            return Promise.resolve([]);
        }
        return insta_1.getPendingSnapshots(workspaceRoot.uri).then((snapshots) => {
            return snapshots.map((snapshot) => {
                if (snapshot.inlineInfo) {
                    this.cachedInlineSnapshots[snapshot.key] = snapshot;
                }
                return snapshot;
            });
        });
    }
}
exports.PendingSnapshotsProvider = PendingSnapshotsProvider;
//# sourceMappingURL=PendingSnapshotsProvider.js.map
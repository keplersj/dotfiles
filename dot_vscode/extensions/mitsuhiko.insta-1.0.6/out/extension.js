"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const os_1 = require("os");
const vscode_1 = require("vscode");
const cargo_1 = require("./cargo");
const InlineSnapshotProvider_1 = require("./InlineSnapshotProvider");
const insta_1 = require("./insta");
const PendingSnapshotsProvider_1 = require("./PendingSnapshotsProvider");
const Snapshot_1 = require("./Snapshot");
const SnapshotPathProvider_1 = require("./SnapshotPathProvider");
const INSTA_CONTEXT_NAME = "inInstaSnapshotsProject";
function getSnapshotPairs(uri) {
    if (uri.path.match(/\.snap$/)) {
        return [uri, vscode_1.Uri.parse(`${uri}.new`)];
    }
    else if (uri.path.match(/\.snap\.new$/)) {
        return [uri.with({ path: uri.path.substr(0, uri.path.length - 4) }), uri];
    }
}
function openNamedSnapshotDiff(selectedSnapshot) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!selectedSnapshot) {
            selectedSnapshot = (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri;
        }
        if (!selectedSnapshot) {
            vscode_1.window.showErrorMessage("No snapshot selected");
            return;
        }
        const pair = getSnapshotPairs(selectedSnapshot);
        if (!pair) {
            vscode_1.window.showErrorMessage("Not an insta snapshot file");
            return;
        }
        let [oldSnapshot, newSnapshot] = pair;
        try {
            yield vscode_1.workspace.fs.stat(oldSnapshot);
        }
        catch (e) {
            // todo: windows
            oldSnapshot = vscode_1.Uri.file(os_1.platform() == "win32" ? "NUL" : "/dev/null");
        }
        yield vscode_1.commands.executeCommand("vscode.diff", oldSnapshot, newSnapshot, "Snapshot Diff", {
            preview: true,
        });
    });
}
function openInlineSnapshotDiff(snapshot) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = encodeURIComponent(snapshot.key);
        yield vscode_1.commands.executeCommand("vscode.diff", vscode_1.Uri.parse(`instaInlineSnapshot:inline.snap#${key}`), vscode_1.Uri.parse(`instaInlineSnapshot:inline.snap.new#${key}`), "Inline Snapshot Diff", {
            preview: true,
        });
    });
}
function performSnapshotAction(action, pendingSnapshotsProvider, selectedSnapshot) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // in most cases when we're invoked we don't have a selected snapshot yet.
        // in that cas we always go by the active text editor's document.  However in
        // case that document is not a snapshot file (because for instance it's the
        // empty file we open for completely new snapshots), then we look at all other
        // visible text editors for the first snapshot.
        if (!selectedSnapshot) {
            selectedSnapshot = (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri;
            if (selectedSnapshot && !selectedSnapshot.path.match(/\.snap(\.new)?$/)) {
                vscode_1.window.visibleTextEditors.forEach((editor) => {
                    if (editor.document.uri.path.match(/\.snap(\.new)?$/)) {
                        selectedSnapshot = editor.document.uri;
                    }
                });
            }
        }
        if (!selectedSnapshot) {
            vscode_1.window.showErrorMessage(`Cannot ${action} snapshot: no snapshot selected`);
            return;
        }
        // inline snapshots need to be handled through cargo-insta due to the
        // patching.  special case it here.
        if (selectedSnapshot.scheme === "instaInlineSnapshot") {
            const snapshot = pendingSnapshotsProvider.getInlineSnapshot(selectedSnapshot);
            if (!snapshot || !(yield insta_1.processInlineSnapshot(snapshot, action))) {
                vscode_1.window.showErrorMessage(`Cannot ${action} snapshot: cargo-insta failed`);
            }
            else {
                const currentActiveUri = (_b = vscode_1.window.activeTextEditor) === null || _b === void 0 ? void 0 : _b.document.uri;
                if (currentActiveUri && selectedSnapshot.path.match(/\.snap(\.new)?$/)) {
                    vscode_1.commands.executeCommand("workbench.action.closeActiveEditor");
                }
            }
            return;
        }
        const pair = getSnapshotPairs(selectedSnapshot);
        if (!pair) {
            vscode_1.window.showErrorMessage(`Cannot ${action} snapshot: not an insta snapshot`);
            return;
        }
        if (action === "accept") {
            try {
                yield vscode_1.workspace.fs.stat(pair[1]);
            }
            catch (error) {
                vscode_1.window.showErrorMessage("Could not accept snapshot: no new snapshot");
                return;
            }
            yield vscode_1.workspace.fs.rename(pair[1], pair[0], { overwrite: true });
            vscode_1.window.showInformationMessage("New snapshot accepted");
        }
        else if (action === "reject") {
            try {
                yield vscode_1.workspace.fs.delete(pair[1]);
            }
            catch (error) {
                if (error instanceof vscode_1.FileSystemError && error.code === "FileNotFound") {
                    vscode_1.window.showInformationMessage("No new snapshot to reject");
                }
                else {
                    throw error;
                }
                return;
            }
            vscode_1.window.showInformationMessage("New snapshot rejected");
        }
    });
}
function switchSnapshotView(selectedSnapshot) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!selectedSnapshot) {
            selectedSnapshot = (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri;
        }
        if (!selectedSnapshot) {
            return;
        }
        const pair = getSnapshotPairs(selectedSnapshot);
        if (!pair) {
            vscode_1.window.showErrorMessage("Not an insta snapshot file");
            return;
        }
        const otherFile = pair[0].path == selectedSnapshot.path ? pair[1] : pair[0];
        try {
            yield vscode_1.workspace.fs.stat(otherFile);
        }
        catch (e) {
            vscode_1.window.showInformationMessage("Alternative snapshot does not exist.");
            return;
        }
        yield vscode_1.commands.executeCommand("vscode.open", otherFile);
    });
}
function setInstaContext(value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode_1.commands.executeCommand("setContext", INSTA_CONTEXT_NAME, value);
    });
}
function checkInstaContext() {
    var _a;
    const rootUri = (_a = vscode_1.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri;
    if (rootUri) {
        cargo_1.projectUsesInsta(rootUri).then((usesInsta) => setInstaContext(usesInsta));
    }
    else {
        setInstaContext(false);
    }
}
function performOnAllSnapshots(op) {
    var _a;
    const root = (_a = vscode_1.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
    if (!root) {
        return;
    }
    insta_1.processAllSnapshots(root.uri, op).then((okay) => {
        if (okay) {
            vscode_1.window.showInformationMessage(`Successfully ${op}ed all snapshots.`);
        }
        else {
            vscode_1.window.showErrorMessage(`Could not ${op} snapshots.`);
        }
    });
}
function activate(context) {
    var _a;
    const root = (_a = vscode_1.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
    const pendingSnapshots = new PendingSnapshotsProvider_1.PendingSnapshotsProvider(root);
    const snapWatcher = vscode_1.workspace.createFileSystemWatcher("**/*.{snap,snap.new,pending-snap}");
    snapWatcher.onDidChange(() => pendingSnapshots.refreshDebounced());
    snapWatcher.onDidCreate(() => pendingSnapshots.refreshDebounced());
    snapWatcher.onDidDelete(() => pendingSnapshots.refreshDebounced());
    const cargoTomlWatcher = vscode_1.workspace.createFileSystemWatcher("**/Cargo.toml");
    cargoTomlWatcher.onDidChange(() => checkInstaContext());
    cargoTomlWatcher.onDidCreate(() => checkInstaContext());
    cargoTomlWatcher.onDidDelete(() => checkInstaContext());
    if (root) {
        cargo_1.projectUsesInsta(root.uri).then((usesInsta) => setInstaContext(usesInsta));
    }
    context.subscriptions.push(snapWatcher, cargoTomlWatcher, vscode_1.window.registerTreeDataProvider("pendingInstaSnapshots", pendingSnapshots), vscode_1.workspace.registerTextDocumentContentProvider("instaInlineSnapshot", new InlineSnapshotProvider_1.InlineSnapshotProvider(pendingSnapshots)), vscode_1.languages.registerDefinitionProvider([
        {
            scheme: "file",
            language: "rust",
        },
    ], new SnapshotPathProvider_1.SnapshotPathProvider()), vscode_1.commands.registerCommand("mitsuhiko.insta.open-snapshot-diff", (selectedFile) => __awaiter(this, void 0, void 0, function* () {
        // when we're invoked from the pending snapshots view the first
        // argument is the node (Snapshot) instead of the URI.
        if (selectedFile instanceof Snapshot_1.Snapshot) {
            if (selectedFile.inlineInfo) {
                yield openInlineSnapshotDiff(selectedFile);
                return;
            }
            else {
                selectedFile = selectedFile.resourceUri;
            }
        }
        yield openNamedSnapshotDiff(selectedFile);
    })), vscode_1.commands.registerCommand("mitsuhiko.insta.accept-snapshot", (selectedFile) => performSnapshotAction("accept", pendingSnapshots, selectedFile)), vscode_1.commands.registerCommand("mitsuhiko.insta.reject-snapshot", (selectedFile) => performSnapshotAction("reject", pendingSnapshots, selectedFile)), vscode_1.commands.registerCommand("mitsuhiko.insta.switch-snapshot-view", (selectedFile) => switchSnapshotView(selectedFile)), vscode_1.commands.registerCommand("mitsuhiko.insta.refresh-pending-snapshots", () => pendingSnapshots.refresh()), vscode_1.commands.registerCommand("mitsuhiko.insta.accept-all-snapshots", () => performOnAllSnapshots("accept")), vscode_1.commands.registerCommand("mitsuhiko.insta.reject-all-snapshots", () => performOnAllSnapshots("reject")));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map
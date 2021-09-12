"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAllSnapshots = exports.processInlineSnapshot = exports.getPendingSnapshots = void 0;
const cp = require("child_process");
const Snapshot_1 = require("./Snapshot");
function getPendingSnapshots(root) {
    return new Promise((resolve, reject) => {
        var _a;
        let buffer = "";
        const child = cp.spawn("cargo", ["insta", "pending-snapshots", "--as-json"], {
            cwd: root.fsPath,
        });
        if (!child) {
            reject(new Error("could not spawn cargo-insta"));
            return;
        }
        (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.setEncoding("utf8");
        child.stdout.on("data", (data) => (buffer += data));
        child.on("close", (_exitCode) => {
            const snapshots = buffer
                .split(/\n/g)
                .map((line) => {
                try {
                    return new Snapshot_1.Snapshot(root, JSON.parse(line));
                }
                catch (e) {
                    return null;
                }
            })
                .filter((x) => x !== null);
            resolve(snapshots);
        });
    });
}
exports.getPendingSnapshots = getPendingSnapshots;
function processInlineSnapshot(snapshot, op) {
    if (!snapshot.inlineInfo) {
        return Promise.resolve(false);
    }
    return new Promise((resolve, reject) => {
        const child = cp.spawn("cargo", ["insta", op, "--snapshot", snapshot.key], {
            cwd: snapshot.rootUri.fsPath,
        });
        if (!child) {
            reject(new Error("could not spawn cargo-insta"));
            return;
        }
        child.on("close", (exitCode) => {
            resolve(exitCode === 0);
        });
    });
}
exports.processInlineSnapshot = processInlineSnapshot;
function processAllSnapshots(rootUri, op) {
    return new Promise((resolve, reject) => {
        const child = cp.spawn("cargo", ["insta", op], {
            cwd: rootUri.fsPath,
        });
        if (!child) {
            reject(new Error("could not spawn cargo-insta"));
            return;
        }
        child.on("close", (exitCode) => {
            resolve(exitCode === 0);
        });
    });
}
exports.processAllSnapshots = processAllSnapshots;
//# sourceMappingURL=insta.js.map
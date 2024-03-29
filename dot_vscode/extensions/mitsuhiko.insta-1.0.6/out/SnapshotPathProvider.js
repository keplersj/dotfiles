"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotPathProvider = void 0;
const vscode_1 = require("vscode");
const NAMED_SNAPSHOT_ASSERTION = /(?:\binsta::)?(?:assert(?:_\w+)?_snapshot!)\(\s*['"]([^'"]+)['"]\s*,/;
const UNNAMED_SNAPSHOT_ASSERTION = /(?:\binsta::)?(?:assert(?:_\w+)?_snapshot!)\(/;
const FUNCTION = /\bfn\s+([\w]+)\s*\(/;
const TEST_DECL = /#\[test\]/;
const FILENAME_PARTITION = /^(.*)[/\\](.*?)\.rs$/;
const SNAPSHOT_FUNCTION_STRIP = /^test_(.*?)$/;
class SnapshotPathProvider {
    /**
     * This looks up an explicitly named snapshot (simple case)
     */
    resolveNamedSnapshot(document, position) {
        const line = (position.line >= 1 ? document.lineAt(position.line - 1).text : "") +
            document.lineAt(position.line).text;
        const snapshotMatch = line.match(NAMED_SNAPSHOT_ASSERTION);
        if (!snapshotMatch) {
            return null;
        }
        const snapshotName = snapshotMatch[1];
        const fileNameMatch = document.fileName.match(FILENAME_PARTITION);
        if (!fileNameMatch) {
            return null;
        }
        const path = fileNameMatch[1];
        const localModuleName = fileNameMatch[2];
        return { snapshotName, path, localModuleName };
    }
    /**
     * This locates an implicitly (unnamed) snapshot.
     */
    resolveUnnamedSnapshot(document, position) {
        function unnamedSnapshotAt(lineno) {
            const line = document.lineAt(lineno).text;
            return !!(line.match(UNNAMED_SNAPSHOT_ASSERTION) &&
                !line.match(NAMED_SNAPSHOT_ASSERTION));
        }
        // if we can't find an unnnamed snapshot at the given position we bail.
        if (!unnamedSnapshotAt(position.line)) {
            return null;
        }
        // otherwise scan backwards for unnamed snapshot matches until we find
        // a test function declaration.
        let snapshotNumber = 1;
        let scanLine = position.line - 1;
        let functionName = null;
        while (scanLine >= 0) {
            // stop if we find a test function declaration
            let functionMatch;
            if (scanLine > 1 &&
                (functionMatch = document.lineAt(scanLine).text.match(FUNCTION)) &&
                document.lineAt(scanLine - 1).text.match(TEST_DECL)) {
                functionName = functionMatch[1];
                break;
            }
            if (unnamedSnapshotAt(scanLine)) {
                snapshotNumber++;
            }
            scanLine--;
        }
        // if we couldn't find a function we have to bail.
        if (!functionName) {
            return null;
        }
        const snapshotName = `${functionName.match(SNAPSHOT_FUNCTION_STRIP)[1]}${snapshotNumber > 1 ? `-${snapshotNumber}` : ""}`;
        const fileNameMatch = document.fileName.match(FILENAME_PARTITION);
        if (!fileNameMatch) {
            return null;
        }
        const path = fileNameMatch[1];
        const localModuleName = fileNameMatch[2];
        return { snapshotName, path, localModuleName };
    }
    provideDefinition(document, position, token) {
        const snapshotMatch = this.resolveNamedSnapshot(document, position) ||
            this.resolveUnnamedSnapshot(document, position);
        if (!snapshotMatch) {
            return null;
        }
        const getSearchPath = function (mode) {
            return vscode_1.workspace.asRelativePath(`${snapshotMatch.path}/snapshots/${mode !== "exact" ? "*__" : ""}${snapshotMatch.localModuleName}${mode === "wildcard-all" ? "__*" : ""}__${snapshotMatch.snapshotName}.snap`);
        };
        function findFiles(path) {
            return vscode_1.workspace
                .findFiles(path, "", 1, token)
                .then((results) => results[0] || null);
        }
        // we try to find the file in three passes:
        // - exact matchin the snapshot folder.
        // - with a wildcard module prefix (crate__foo__NAME__SNAP)
        // - with a wildcard module prefix and suffix (crate__foo__NAME__tests__SNAP)
        // This is needed since snapshots can be contained in submodules. Since
        // getting the actual module name is tedious we just hope the match is
        // unique.
        return findFiles(getSearchPath("exact"))
            .then((rv) => rv || findFiles(getSearchPath("wildcard-prefix")))
            .then((rv) => rv || findFiles(getSearchPath("wildcard-all")))
            .then((snapshot) => snapshot ? new vscode_1.Location(snapshot, new vscode_1.Position(0, 0)) : null);
    }
}
exports.SnapshotPathProvider = SnapshotPathProvider;
//# sourceMappingURL=SnapshotPathProvider.js.map
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
exports.projectUsesInsta = void 0;
const cp = require("child_process");
const vscode_1 = require("vscode");
function metadataReferencesInsta(metadata) {
    for (const pkg of metadata.packages) {
        if (pkg.name === "insta") {
            return true;
        }
        for (const dependency of pkg.dependencies) {
            if (dependency.name === "insta") {
                return true;
            }
        }
    }
    return false;
}
function projectUsesInsta(root) {
    return __awaiter(this, void 0, void 0, function* () {
        const rootCargoToml = vscode_1.Uri.joinPath(root, "Cargo.toml");
        try {
            yield vscode_1.workspace.fs.stat(rootCargoToml);
        }
        catch (e) {
            return false;
        }
        return new Promise((resolve, reject) => {
            var _a;
            let buffer = "";
            const child = cp.spawn("cargo", [
                "metadata",
                "--no-deps",
                "--format-version=1",
            ]);
            (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.setEncoding("utf8");
            child.stdout.on("data", (data) => (buffer += data));
            child.on("close", (exitCode) => {
                if (exitCode != 0) {
                    return resolve(false);
                }
                try {
                    resolve(metadataReferencesInsta(JSON.parse(buffer)));
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    });
}
exports.projectUsesInsta = projectUsesInsta;
//# sourceMappingURL=cargo.js.map
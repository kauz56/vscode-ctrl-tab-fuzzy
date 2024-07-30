const vscode = require('vscode');
const path = require('path');

// extensions/git/src/util.ts
const isMacintosh = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

function normalizePath(path) {
    // Windows & Mac are currently being handled
    // as case insensitive file systems in VS Code.
    if (isWindows || isMacintosh) {
        return path.toLowerCase();
    }

    return path;
}

function pathEquals(a, b) {
    return normalizePath(a) === normalizePath(b);
}

// const out = vscode.window.createOutputChannel("fuzzyTab");
// function print(data) {
//     out.append(JSON.stringify(data, null, 4));
// }

let ready = false;
async function init() {
    // restored tabs don't automatically restore text documents
    for (const tabGroup of vscode.window.tabGroups.all) {
        for (const tab of tabGroup.tabs) {
            if (tab.input instanceof vscode.TabInputText) {
                await vscode.workspace.openTextDocument(tab.input.uri).catch(() => {});
            }
        }
    }
    ready = true;
}

function activate(context) {
    const lastUsedTimes = new Map();

    let disposable = vscode.commands.registerCommand('extension.fuzzyTab', async () => {
        if (!ready) await init();

        const openDocuments = vscode.workspace.textDocuments;
        const activeEditor = vscode.window.activeTextEditor;
        const activeFilePath = activeEditor ? activeEditor.document.uri?.fsPath : null;

        const items = openDocuments
            .filter(d => d.uri.scheme === 'file' || d.uri.scheme === 'vscode-userdata')
            // extensions/git/src/fileSystemProvider.ts 117
            .filter(d => !pathEquals(d.uri?.fsPath || '', activeFilePath || ''))
            .map(d => ({
                label: path.basename(d.fileName || ''),
                description: path.dirname(d.uri?.fsPath || ''),
                document: d,
                lastUsed: lastUsedTimes.get(d.uri?.fsPath) || 0
            }))
            .sort((a, b) => {
                return b.lastUsed - a.lastUsed;
            });

        const selected = await vscode.window.showQuickPick(items, { matchOnDescription: true });

        if (selected) {
            const doc = await vscode.workspace.openTextDocument(selected.document.uri);
            vscode.window.showTextDocument(doc);
        }
    });

    context.subscriptions.push(disposable);

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document) {
            const p = editor.document.uri.fsPath;
            if (p) {
                lastUsedTimes.set(p, Date.now());
            }
        }
    });
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;

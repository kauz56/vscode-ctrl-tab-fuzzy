const vscode = require('vscode');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const lastUsedTimes = new Map();

    let disposable = vscode.commands.registerCommand('extension.fuzzyTab', async () => {
        const openEditors = vscode.workspace.textDocuments;
        const activeEditor = vscode.window.activeTextEditor;
        const activeFilePath = activeEditor ? activeEditor.document.uri.fsPath : null;

        const items = openEditors
            // Filter out non file buffers
            .filter(editor => editor.uri.fsPath.includes('.'))
            .filter(editor => !editor.uri.fsPath.endsWith('.git'))
            .map(editor => ({
                label: path.basename(editor.fileName),
                description: path.dirname(editor.uri.fsPath),
                editor,
                lastUsed: lastUsedTimes.get(editor.uri.fsPath) || 0
            })).sort((a, b) => {
                // Sort the current active document to the bottom
                if (a.editor.uri.fsPath === activeFilePath) return 1;
                if (b.editor.uri.fsPath === activeFilePath) return -1;
                // For others, sort based on last used time
                return b.lastUsed - a.lastUsed;
            });

        const selected = await vscode.window.showQuickPick(items, { matchOnDescription: true });

        if (selected) {
            const doc = await vscode.workspace.openTextDocument(selected.editor.uri);
            vscode.window.showTextDocument(doc);
        }
    });

    context.subscriptions.push(disposable);

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document) {
            lastUsedTimes.set(editor.document.uri.fsPath, Date.now());
        }
    });
}
exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;
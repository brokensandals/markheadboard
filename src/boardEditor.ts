import * as crypto from 'crypto';
import * as path from 'path';
import * as vscode from 'vscode';
import * as mdutil from './mdutil';

// This doesn't really do what I want - it only looks at _visible_ editors, I'd like to find any
// _open_ editor - but there doesn't seem to be a good way to do that: https://github.com/microsoft/vscode/issues/15178
function findOrOpenEditor(uri: vscode.Uri, callback: (editor: vscode.TextEditor) => void) {
  for (const editor of vscode.window.visibleTextEditors) {
    if (editor.document.uri.toString() === uri.toString()) {
      // Calling showTextDocument ensures that focus shifts to the editor;
      // including editor.viewColumn is necessary to keep it from opening a new editor
      // in the current column if the existing editor is in a different column.
      vscode.window.showTextDocument(editor.document, editor.viewColumn).then(callback);
      return;
    }
  }
  vscode.window.showTextDocument(uri).then(callback);
}

export class BoardEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerCustomEditorProvider('markheadboard.boardEditor', new BoardEditorProvider(context));
  }

  constructor(
    private readonly context: vscode.ExtensionContext
  ) { }

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    function updateView() {
      webviewPanel.webview.postMessage({ type: 'refresh', root: mdutil.parseHeadings(document.getText()) });
    }

    const disposables: vscode.Disposable[] = [];

    disposables.push(vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document.uri.toString() === document.uri.toString()) {
        updateView();
      }
    }));

    webviewPanel.onDidDispose(() => {
      disposables.forEach(d => d.dispose());
    });

    webviewPanel.webview.onDidReceiveMessage(message => {
      switch (message.type) {
        case 'open':
          if (typeof message.start === 'undefined' || typeof !message.heading === 'undefined') {
            // Should only get here in the case of a bug.
            return;
          }
          const pos = document.positionAt(message.start);
          const line = document.lineAt(pos);
          const textOffset = line.text.indexOf(message.heading);
          findOrOpenEditor(document.uri, editor => {
            editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.AtTop);
            if (!message.heading) {
              editor.selection = new vscode.Selection(line.range.end, line.range.end);
            } else if (textOffset > -1) {
              editor.selection = new vscode.Selection(
                pos.translate(0, textOffset),
                pos.translate(0, textOffset + message.heading.length)
              );
            }
          });
          break;
        case 'openLink':
          if (typeof message.link === 'undefined') {
            // Should only get here in the case of a bug.
            return;
          }
          vscode.env.openExternal(vscode.Uri.parse(message.link));
          break;
        case 'move':
          if (typeof message.sourceStart === 'undefined' || typeof message.sourceEnd === 'undefined' || typeof message.dest === 'undefined') {
            // Should only get here in the case of a bug.
            return;
          }
          const edit = new vscode.WorkspaceEdit();
          const sourceStart = document.positionAt(message.sourceStart);
          const sourceEnd = document.positionAt(message.sourceEnd);
          const sourceRange = new vscode.Range(sourceStart, sourceEnd);
          const sourceText = document.getText(sourceRange);
          const dest = document.positionAt(message.dest);
          edit.insert(document.uri, dest, sourceText);
          edit.delete(document.uri, sourceRange);
          vscode.workspace.applyEdit(edit);
          break;
      }
    });

    const nonce = crypto.randomBytes(64).toString('hex');
    webviewPanel.webview.html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewPanel.webview.cspSource}; script-src 'nonce-${nonce}';">
  <link href="${webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'boardEditor.css')))}" rel="stylesheet" />
  <title>Mark Headboard</title>
</head>
<body>
<div id="columns"></div>
<script nonce="${nonce}" src="${webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'Sortable.min.js')))}"></script>
<script nonce="${nonce}" src="${webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'boardEditor.js')))}"></script>
</body>
</html>`;

    updateView();
  }
}

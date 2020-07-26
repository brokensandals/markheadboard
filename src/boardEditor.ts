import * as crypto from 'crypto';
import * as path from 'path';
import * as vscode from 'vscode';
import * as mdutil from './mdutil';

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

    const nonce = crypto.randomBytes(64).toString('hex');
    webviewPanel.webview.html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewPanel.webview.cspSource}; script-src 'nonce-${nonce}';">
  <link href="${webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'boardEditor.css')))}" rel="stylesheet" />
  <script nonce="${nonce}" src="${webviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'boardEditor.js')))}"></script>
  <title>Mark Headboard</title>
</head>
<body>
<div id="columns" />
</body>
</html>`;

    updateView();
  }
}

import * as vscode from 'vscode';
import { BoardEditorProvider } from './boardEditor';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(BoardEditorProvider.register(context));
	context.subscriptions.push(vscode.commands.registerCommand('markheadboard.boardEditor.reopen', () => {
		vscode.commands.executeCommand('vscode.openWith', vscode.window.activeTextEditor?.document.uri, 'markheadboard.boardEditor');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('markheadboard.boardEditor.openToSide', () => {
		vscode.window.showTextDocument(vscode.window.activeTextEditor!.document.uri, { viewColumn: vscode.ViewColumn.Beside }).then(editor => {
			vscode.commands.executeCommand('vscode.openWith', vscode.window.activeTextEditor?.document.uri, 'markheadboard.boardEditor');
		});
	}));
}

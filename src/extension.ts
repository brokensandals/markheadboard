import * as vscode from 'vscode';
import { BoardEditorProvider } from './boardEditor';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(BoardEditorProvider.register(context));
}

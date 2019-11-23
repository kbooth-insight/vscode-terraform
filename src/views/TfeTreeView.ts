import * as vscode from 'vscode';
import * as restm from "typed-rest-client/RestClient"
import * as hm from "typed-rest-client/Handlers"
import logger = require('fancy-log');

export interface HttpBinData {
	url: string;
	data: any;
	json: any;
	args?: any
}

export class TfeTreeView {

	private testView: vscode.TreeView<{ key: string }>;

	constructor(context: vscode.ExtensionContext) {
		
		this.testView = vscode.window.createTreeView('test-view', { treeDataProvider: aNodeWithIdTreeDataProvider(), showCollapseAll: true });
		vscode.commands.registerCommand('test-view.reveal', async () => {
			const key = await vscode.window.showInputBox({ placeHolder: 'Type the label of the item to reveal' });
			if (key) {
				await this.testView.reveal({ key }, { focus: true, select: false, expand: true });
			}
		});

		vscode.commands.registerCommand('test-view.changeTitle', async () => {
			const title = await vscode.window.showInputBox({ prompt: 'Type the new title for the Test View', placeHolder: this.testView.message });
			if (title) {
				//view.title = title;
			}
		});

		vscode.commands.registerCommand('extension.refreshObjectExplorerNode', async () => {
			vscode.window.showInformationMessage('refresh called');
		})

		this.testView.onDidChangeVisibility(async (e) => {
			console.log('test');
			

		});
	}
}

const tree = {
	'workspaces': {
		'workspaces-test': {
			'aaa': {
				'aaaa': {
					'aaaaa': {
						'aaaaaa': {

						}
					}
				}
			}
		},
		'ab': {}
	},
	'b': {
		'ba': {},
		'bb': {}
	}
};
let nodes = {};

function aNodeWithIdTreeDataProvider(): vscode.TreeDataProvider<{ key: string }> {

	return {
		getChildren: (element: { key: string }): { key: string }[] => {
			return getChildren(element ? element.key : undefined).map(key => getNode(key));
		},
		getTreeItem: (element: { key: string }): vscode.TreeItem => {

			let userToken = vscode.workspace.getConfiguration().terraform.enterprise.enterpriseUserToken;
			var authHandler = new hm.BearerCredentialHandler(userToken);

			let client = new restm.RestClient('test-client', 'https://app.terraform.io/api/v2', [authHandler]);
			let response = client.get<HttpBinData>('organizations/kbooth/workspaces');
			let r = Promise.resolve(response);
			response.then((r) => {
				logger.info(r.result.data);
				console.info(r.result.data);

			});

			//this.logger.info(r.result.data);
			const treeItem = getTreeItem(element.key);
			treeItem.id = element.key;
			return treeItem;
		},
		getParent: ({ key }: { key: string }): { key: string } => {
			const parentKey = key.substring(0, key.length - 1);
			return parentKey ? new Key(parentKey) : void 0;
		}
	};
}

function getChildren(key: string): string[] {
	if (!key) {
		return Object.keys(tree);
	}
	let treeElement = getTreeElement(key);
	if (treeElement) {
		return Object.keys(treeElement);
	}
	return [];
}

function getTreeItem(key: string): vscode.TreeItem {
	const treeElement = getTreeElement(key);
	return new EnterpriseItem(
		key,
		`Tooltip for ${key}`,
		treeElement && Object.keys(treeElement).length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
	);
}

function getTreeElement(element): any {
	let parent = tree;
	for (let i = 0; i < element.length; i++) {
		parent = parent[element.substring(0, i + 1)];
		if (!parent) {
			return null;
		}
	}
	return parent;
}

function getNode(key: string): { key: string } {
	if (!nodes[key]) {
		nodes[key] = new Key(key);
	}
	return nodes[key];
}

class Key {
	constructor(readonly key: string) { }
}


export class EnterpriseItem extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly testProperty: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return `${this.label}-${this.id}`;
	}

	contextValue = 'dependency';

}
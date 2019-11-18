import * as vscode from 'vscode';
import * as restm from "typed-rest-client/RestClient"
import * as hm from "typed-rest-client/Handlers"

export interface HttpBinData {
	url: string;
	data: any;
	json: any;
	args?: any
  }

export class TestView {

	constructor(context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView('test-view', { treeDataProvider: aNodeWithIdTreeDataProvider(), showCollapseAll: true });
		vscode.commands.registerCommand('test-view.reveal', async () => {
			const key = await vscode.window.showInputBox({ placeHolder: 'Type the label of the item to reveal' });
			if (key) {
				await view.reveal({ key }, { focus: true, select: false, expand: true });
			}
		});

		vscode.commands.registerCommand('test-view.changeTitle', async () => {
			const title = await vscode.window.showInputBox({ prompt: 'Type the new title for the Test View', placeHolder: view.message });
			if (title) {
				//view.title = title;
			}
		});

		vscode.commands.registerCommand('extension.refreshObjectExplorerNode', async () => {
			vscode.window.showInformationMessage('refresh called');
		})
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

	let userToken = vscode.workspace.getConfiguration().terraform.enterprise.enterpriseUserToken;
	var authHandler = new hm.BearerCredentialHandler(userToken);

	let client = new restm.RestClient('test-client', 'https://app.terraform.io/api/v2', [authHandler]);
	//let response: restm.IRestResponse<HttpBinData> = client.get<HttpBinData>('organizations/kbooth/workspaces').;
	//this.logger.info(response.result.data);

	return {
		getChildren: (element: { key: string }): { key: string }[] => {
			return getChildren(element ? element.key : undefined).map(key => getNode(key));
		},
		getTreeItem: (element: { key: string }): vscode.TreeItem => {
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

	// get id(): string {
	// 	return this.id;
	// }

	// set id(id: string) {
	// 	this.id = id;
	// }

	// iconPath = {
	// 	light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
	// 	dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	// };

	contextValue = 'dependency';

}
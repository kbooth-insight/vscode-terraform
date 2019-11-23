import * as vscode from 'vscode';
import * as restm from "typed-rest-client/RestClient"
import * as hm from "typed-rest-client/Handlers"
import logger = require('fancy-log');
import { IRestResponse } from 'typed-rest-client/RestClient';
import { TextDocument } from 'vscode-languageclient';


export class TfeDocumentProvider implements vscode.TextDocumentContentProvider {
    onDidChange?: vscode.Event<vscode.Uri>;    
    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        return uri.path;
    }


}


export interface HttpBinData {
	url: string;
	data: any;
	json: any;
	args?: any
}

export class TfeItem extends vscode.TreeItem {
    private data: string;

	constructor(label: string, state: vscode.TreeItemCollapsibleState, id: string, data: string) {
        super(label, state);
        this.id = id;
        this.data = data;
    }

    public get_data() :string { 
        return this.data;
    }

}

export class TfeView implements vscode.TreeDataProvider<TfeItem> {
    private documentScheme: string = "tfe";

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(this.documentScheme, new TfeDocumentProvider()));

        
        context.subscriptions.push(vscode.commands.registerCommand('tfe-view.viewData', async(item) => {
            //let doc : TextDocument = new TextDocument()
            //let uri = vscode.Uri.parse(this.documentScheme + ":" + item.get_data());
            let doc = await vscode.workspace.openTextDocument({content: item.get_data(), language: "json"} );
            await vscode.window.showTextDocument(doc, {preview: false});
            await vscode.commands.executeCommand('editor.action.formatDocument');
        }));
    }

    onDidChangeTreeData?: vscode.Event<TfeItem>;    
    getTreeItem(element: TfeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {


        return element;
    }
    async getChildren(element?: TfeItem): Promise<TfeItem[]> {

        let userToken = vscode.workspace.getConfiguration().terraform.enterprise.enterpriseUserToken;
        var authHandler = new hm.BearerCredentialHandler(userToken);
        let client = new restm.RestClient('test-client', 'https://app.terraform.io/api/v2', [authHandler]);
        let response : IRestResponse<HttpBinData> = null;

        let items: TfeItem[] = [];

        if (element != null) {
            let url: string = `workspaces/${element.id}/runs`;
            response = await client.get<HttpBinData>(url);
            response.result.data.forEach(item => {
                let label: string = `${item.id} - ${item.attributes.status}`
                let data: string = JSON.stringify(item);
                let tfeItem : TfeItem = new TfeItem(label, vscode.TreeItemCollapsibleState.Collapsed, item.id, data);
                items.push(tfeItem);
            });

            if(items.length == 0) {
                items.push(new TfeItem('no runs yet', vscode.TreeItemCollapsibleState.None, 'none', null));
            }

        }
        else {
            response = await client.get<HttpBinData>('organizations/kbooth/workspaces');

            response.result.data.forEach(item => {
                let data : string = JSON.stringify(item);
                let tfeItem : TfeItem = new TfeItem(item.attributes.name, vscode.TreeItemCollapsibleState.Collapsed, item.id, data);
                items.push(tfeItem);
            });
        }

        return items;

    }
    getParent?(element: TfeItem): vscode.ProviderResult<TfeItem> {
        throw new Error("Method not implemented.");
    }


}
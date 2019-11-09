import * as vscode from "vscode";
import { IndexAdapter } from "../index/index-adapter";
import { Command, CommandType } from "./command";
import { Runner } from "../runner";


export class RefreshObjectExplorerNode extends Command {
  public static readonly CommandName = "refreshObjectExplorerNode";

  constructor(private runner: Runner, private index: IndexAdapter, ctx: vscode.ExtensionContext) {
    super(RefreshObjectExplorerNode.CommandName, ctx, CommandType.PALETTE);
  }

  protected async perform(...args: any[]): Promise<any> { 
    this.logger.debug("In " + this.constructor.name)


    
    return;
  }
}
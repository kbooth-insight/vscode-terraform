import * as vscode from "vscode";
import { IndexAdapter } from "../index/index-adapter";
import { Command, CommandType } from "./command";
import { Runner } from "../runner";
import { Logger } from "../logger"

export class TestCommand extends Command {
  public static readonly CommandName = "test-command";

  constructor(private runner: Runner, private index: IndexAdapter, ctx: vscode.ExtensionContext) {
    super(TestCommand.CommandName, ctx, CommandType.PALETTE);
  }

  protected async perform(...args: any[]): Promise<any> { 
    this.logger.debug("In " + this.constructor.name)
    return;
  }
}
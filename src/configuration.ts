import * as vscode from 'vscode';

export interface TerraformIndexConfiguration {
  enabled: boolean;
  liveIndexing: boolean;
  liveIndexingDelay: number;
  exclude: string[];
}

export interface TerraformLanguageServerConfiguration {
  enabled: boolean;
  args: boolean;
  pathToBinary: string;
  installCommonProviders: boolean;
}

export interface TerraformCodeLensConfiguration {
  enabled: boolean;
}

export interface TerraformTelemetryConfiguration {
  enabled: boolean;
}

export interface TerraformExecutableConfiguration {
  path: string;
  version?: string;
}

export interface TerraformEnterpriseUserTokenConfiguration {
  userToken: string;
}

export interface TerraformEnterpriseHostConfiguration {
   enterpriseHost: string;
}

// export interface TerraformTestConfiguration {
//   filedOne: string;
//   fieldTwo: string;
// }

export interface TerraformConfiguration {
  path: string;
  paths: (string | TerraformExecutableConfiguration)[];
  templateDirectory: string;
  lintPath: string;
  lintConfig?: string;
  indexing: TerraformIndexConfiguration;
  languageServer: TerraformLanguageServerConfiguration;
  codelens: TerraformCodeLensConfiguration;
  telemetry: TerraformTelemetryConfiguration;
  format: TerraformFormatConfiguration;
  enterpriseUserToken: TerraformEnterpriseUserTokenConfiguration;
  enterpriseHost: TerraformEnterpriseHostConfiguration;
  //test: TerraformTestConfiguration;
}

export interface TerraformFormatConfiguration {
  ignoreExtensionsOnSave: string[];
}

export function getConfiguration(): TerraformConfiguration {
  let raw = vscode.workspace.getConfiguration("terraform");

  let userToken = raw.enterprise.userToken;

  // needed for conversion
  let convertible = {
    path: raw.path,
    paths: raw.paths,
    templateDirectory: raw.templateDirectory,
    lintPath: raw.lintPath,
    lintConfig: raw.lintConfig,
    indexing: raw.indexing,
    languageServer: raw.languageServer,
    codelens: raw.codelens,
    telemetry: raw.telemetry,
    format: raw.format,
    enterpriseUserToken: raw.enterprise.userToken,
    //enterpriseHost: raw.enterprise.host
  };

  return <TerraformConfiguration>convertible;
}
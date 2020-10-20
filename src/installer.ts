import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as path from 'path';
import * as sdk from './sdkman';

const userHome = process.env.HOME as string;

export async function getJava(
  version: string,
  arch: string
): Promise<void> {
  // the version is not semver and includes a vendor,
  // so we do not use the version parameter and consider
  // the version part of the name of the tool
  let toolPath = tc.find('java-' + version, '1', arch);

  if (toolPath) {
    core.debug(`Java version found in cache ${toolPath}`);
  } else {
    await sdk.execSdkMan('install java ' + version);
    const jdkDir = userHome + '/.sdkman/candidates/java/' + version;
    core.debug(`jdk extracted to ${jdkDir}`);
    toolPath = await tc.cacheDir(
      jdkDir,
      'java-' + version,
      '1.0.0',
      arch
    );
  }

  let extendedJavaHome = 'JAVA_HOME_' + version + '_' + arch;
  core.exportVariable(extendedJavaHome, toolPath); //TODO: remove for v2
  // For portability reasons environment variables should only consist of
  // uppercase letters, digits, and the underscore. Therefore we convert
  // the extendedJavaHome variable to upper case and replace '.' symbols and
  // any other non-alphanumeric characters with an underscore.
  extendedJavaHome = extendedJavaHome.toUpperCase().replace(/[^0-9A-Z_]/g, '_');
  core.exportVariable('JAVA_HOME', toolPath);
  core.exportVariable(extendedJavaHome, toolPath);
  core.addPath(path.join(toolPath, 'bin'));
  core.setOutput('path', toolPath);
  core.setOutput('version', version);
}

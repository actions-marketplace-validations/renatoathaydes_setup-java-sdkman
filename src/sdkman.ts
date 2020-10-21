import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';

const sdkmanUrl = 'https://get.sdkman.io';
const userHome = process.env.HOME as string;
const shell = process.env.SHELL as string;

export async function getSdkMan(): Promise<void> {
  let toolPath = tc.find('sdkman', '1');

  if (toolPath) {
    core.debug(`SDKMAN! found in cache ${toolPath}`);
  } else {
    core.debug('Installing SDKMAN!');
    const sdkmanInstaller = await tc.downloadTool(sdkmanUrl);
    await exec.exec('bash', [sdkmanInstaller]);
    await tc.cacheDir(`${userHome}/.sdkman`, 'sdkman', '1.0.0');
    core.info('Installed SDKMAN!');
  }
}

export async function execSdkMan(args: string): Promise<void> {
  await getSdkMan();
  await exec.exec(shell, [
    '-c',
    `source ${userHome}/.sdkman/bin/sdkman-init.sh && ${args}`
  ]);
}

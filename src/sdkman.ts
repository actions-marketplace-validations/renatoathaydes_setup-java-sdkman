import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
import fs from 'fs';
import path from 'path';

const sdkmanUrl = 'https://get.sdkman.io';
const userHome = process.env.HOME as string;
const shell = (process.env.SHELL || 'bash') as string;

export async function getSdkMan(): Promise<void> {
  let sdkHome = path.join(userHome, '.sdkman');
  let toolPath = tc.find('sdkman', '1');

  if (toolPath) {
    core.debug(`SDKMAN! found in cache ${toolPath}`);
  } else {
    core.debug('Installing SDKMAN!');
    const sdkmanInstaller = await tc.downloadTool(sdkmanUrl);
    await exec.exec(shell, [sdkmanInstaller]);
    await tc.cacheDir(sdkHome, 'sdkman', '1.0.0');
    core.info('Installed SDKMAN!');
  }
  core.setOutput('sdkCommand', sdkManCmdPrefix());
  await saveSdkManConfig(sdkHome);
}

async function saveSdkManConfig(sdkHome: string): Promise<void> {
  core.debug('Creating SDKMAN! config file');
  let configDir = path.join(sdkHome, 'etc');
  await io.mkdirP(configDir);
  let configFile = path.join(configDir, 'config');
  fs.writeFileSync(configFile, 'sdkman_auto_answer=true', {
    encoding: 'utf-8',
    flag: 'w'
  });
  core.debug(`Saved SDKMAN! config file: ${configFile}`);
}

export async function execSdkMan(args: string): Promise<void> {
  await getSdkMan();
  let code = await exec.exec(shell, ['-c', `${sdkManCmdPrefix()} ${args}`]);
  if (code !== 0) {
    throw `sdk ERROR: command 'sdk ${args}' exited with code ${code}`;
  }
}

function sdkManCmdPrefix() {
  return `source ${path.join(
    userHome,
    '.sdkman',
    'bin',
    'sdkman-init.sh'
  )} && sdk `;
}

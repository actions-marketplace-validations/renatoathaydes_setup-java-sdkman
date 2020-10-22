import io = require('@actions/io');
import fs = require('fs');
import path = require('path');
import child_process = require('child_process');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');
const javaDir = path.join(__dirname, 'runner', 'java');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as installer from '../src/installer';

let javaFilePath = '';
let javaUrl = '';
if (process.platform === 'win32') {
  javaFilePath = path.join(javaDir, 'java_win.zip');
  javaUrl =
    'https://download.java.net/java/GA/jdk12/33/GPL/openjdk-12_windows-x64_bin.zip';
} else if (process.platform === 'darwin') {
  javaFilePath = path.join(javaDir, 'java_mac.tar.gz');
  javaUrl =
    'https://download.java.net/java/GA/jdk12/33/GPL/openjdk-12_osx-x64_bin.tar.gz';
} else {
  javaFilePath = path.join(javaDir, 'java_linux.tar.gz');
  javaUrl =
    'https://download.java.net/java/GA/jdk12/33/GPL/openjdk-12_linux-x64_bin.tar.gz';
}

describe('installer tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
    if (!fs.existsSync(`${javaFilePath}.complete`)) {
      // Download java
      await io.mkdirP(javaDir);

      console.log('Downloading java');
      child_process.execSync(`curl "${javaUrl}" > "${javaFilePath}"`);
      // Write complete file so we know it was successful
      fs.writeFileSync(`${javaFilePath}.complete`, 'content');
    }
  }, 300000);

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  it('Downloads java with given version', async () => {
    await installer.getJava('11.0.2-open', 'x64');
    const JavaDir = path.join(toolDir, 'java-11.0.2-open', '1.0.0', 'x64');

    expect(fs.existsSync(`${JavaDir}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(JavaDir, 'bin'))).toBe(true);
  }, 100000);

  it('Throws if invalid java package is specified', async () => {
    let thrown = false;
    try {
      await installer.getJava('bad_jdk', 'x64');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Uses version of Java installed in cache', async () => {
    const JavaDir: string = path.join(toolDir, 'java-250', '1.0.0', 'x64');
    await io.mkdirP(JavaDir);
    fs.writeFileSync(`${JavaDir}.complete`, 'hello');
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await installer.getJava('250', 'x64');
    return;
  });
});

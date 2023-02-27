// Copyright 2022 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import url from 'url';
import os from 'os';
import minimist from 'minimist';
import path from 'path';
import fs from 'fs/promises';
import rmfr from 'rmfr';

import {spawnStream} from '../build/spawn_stream.mjs';
import {getRootDir} from '../build/get_root_dir.mjs';
import {getSupportedOSTarget} from '../build/get_supported_os_target.mjs';

const APPLE_ROOT = path.join(getRootDir(), 'src', 'cordova', 'apple');
const APPLE_LIBRARY_NAME = 'OutlineAppleLib';

const serializeXcodeDestination = parameters =>
  Object.entries(parameters)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join();

/**
 * @description Tests the parameterized cordova binary (ios, macos).
 *
 * @param {string[]} parameters
 */
export async function main(...parameters) {
  let {
    _: [cordovaPlatform],
    osVersion,
    deviceModel,
    cpuArchitecture,
  } = minimist(parameters);

  const outlinePlatform = cordovaPlatform === 'osx' ? 'macos' : cordovaPlatform;

  if (outlinePlatform !== 'macos' && outlinePlatform !== 'ios') {
    throw new Error('Testing is only currently supported for Apple platforms.');
  }

  if (os.platform() !== 'darwin') {
    throw new Error('Building an Apple binary requires xcodebuild and can only be done on MacOS');
  }

  const xcodeDestination =
    outlinePlatform === 'macos'
      ? {
          platform: 'macOS',
          arch: cpuArchitecture ?? os.machine(),
          OS: osVersion,
        }
      : {
          platform: 'iOS Simulator',
          name: deviceModel ?? `iPhone ${await getSupportedOSTarget('ios')}`,
          OS: osVersion,
        };

  const xcodeBuildTestFlags = {
    scheme: APPLE_LIBRARY_NAME,
    destination: serializeXcodeDestination(xcodeDestination),
    workspace: path.join(APPLE_ROOT, APPLE_LIBRARY_NAME),
    enableCodeCoverage: 'YES',
    derivedDataPath: path.join(APPLE_ROOT, 'coverage'),
  };

  await rmfr(xcodeBuildTestFlags.derivedDataPath);

  await spawnStream(
    'xcodebuild',
    'test',
    ...Object.entries(xcodeBuildTestFlags).flatMap(([key, value]) => [`-${key}`, value])
  );

  const testCoverageDirectoryPath = path.join(xcodeBuildTestFlags.derivedDataPath, 'Logs', 'Test');
  const testCoverageResultFilename = (await fs.readdir(testCoverageDirectoryPath)).find(filename =>
    filename.endsWith('xcresult')
  );

  await fs.rename(
    path.join(testCoverageDirectoryPath, testCoverageResultFilename),
    path.join(xcodeBuildTestFlags.derivedDataPath, 'TestResult.xcresult')
  );
}

if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  await main(...process.argv.slice(2));
}

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
import {Server} from 'karma';
import {executablePath} from 'puppeteer';

import webpackTestConfig from './webpack_test.mjs';

/**
 * @description TODO
 *
 * @param {string[]} parameters
 */
export async function main() {
  const karmaPromise = config =>
    new Promise((resolve, reject) => {
      new Server(config, exitCode => {
        if (exitCode !== 0) {
          reject(exitCode);
        }

        resolve(exitCode);
      });
    });

  process.env.CHROMIUM_BIN = executablePath();

  await karmaPromise({
    browsers: ['ChromiumHeadless'],
    colors: true,
    files: ['**/*.spec.ts'],
    frameworks: ['webpack', 'jasmine'],
    preprocessors: {
      '**/*.spec.ts': ['webpack'],
    },
    reporters: ['progress'],
    singleRun: true,
    webpack: webpackTestConfig,
  });
}

if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  await main(...process.argv.slice(2));
}

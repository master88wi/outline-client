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

import cordovaLib from "cordova-lib";
const {cordova} = cordovaLib;

import {getBuildParameters} from "../../scripts/get_build_parameters.mjs";

export const dependencies = ["src/www"];
export const requirements = ["cordova/setup"];

/**
 * @description Builds the parameterized cordova binary (ios, osx, android).
 *
 * @param {string[]} parameters
 */
export async function main(...parameters) {
  const {platform, buildMode} = getBuildParameters(parameters);

  if (
    platform === "android" &&
    buildMode === "release" &&
    !(process.env.ANDROID_KEY_STORE_PASSWORD && process.env.ANDROID_KEY_STORE_CONTENTS)
  ) {
    throw new ReferenceError(
      "Both 'ANDROID_KEY_STORE_PASSWORD' and 'ANDROID_KEY_STORE_CONTENTS' must be defined in the environment to build an Android Release!"
    );
  }

  await cordova.compile({
    platforms: [platform],
    options: {
      device: platform === "ios",
      release: buildMode === "release",
      argv:
        platform === "android"
          ? [
              ...(buildMode === "release"
                ? [
                    "--keystore=keystore.p12",
                    "--alias=privatekey",
                    "--storePassword=$ANDROID_KEY_STORE_PASSWORD",
                    "--password=$ANDROID_KEY_STORE_PASSWORD",
                    "--",
                  ]
                : []),
              "--gradleArg=-PcdvBuildMultipleApks=true",
            ]
          : [],
    },
  });
}

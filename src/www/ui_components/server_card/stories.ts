/* tslint:disable */
/*
  Copyright 2022 The Outline Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {ServerConnectionState} from "./server_connection_viz";
import {html} from "lit-html";
import {localizerFactory} from "../../.storybook/localizer_factory";
import * as locales from "../../messages";

import "./index";
import {ServerCard} from "./index";

export default {
  title: "Server Card",
  component: "server-card",
  args: {
    serverName: "My Server",
    serverAddress: "1.0.0.127",
    state: ServerConnectionState.INITIAL,
    expanded: false,
    locale: "English",
  },
  argTypes: {
    state: {
      control: "select",
      options: Object.keys(ServerConnectionState),
    },
    expanded: {
      control: "boolean",
    },
    locale: {
      control: "select",
      options: Object.keys(locales),
    },
  },
};

export const Example = ({locale, serverName, serverAddress, state, expanded}: ServerCard & {locale: string}) => {
  return html`
    <server-card
      .localize=${localizerFactory(locale)}
      server-name="${serverName}"
      server-address="${serverAddress}"
      .state="${state ?? ServerConnectionState.INITIAL}"
      .expanded="${expanded}"
    ></server-card>
  `;
};

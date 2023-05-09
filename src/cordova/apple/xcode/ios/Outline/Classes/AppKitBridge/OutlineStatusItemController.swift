// Copyright 2023 The Outline Authors
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

import AppKit

var OutlineStatusItem = NSStatusItem()

class OutlineStatusItemController: NSObject {

    let connectionStatusMenuItem = NSMenuItem(title: MenuTitle.statusDisconnected,
                                              action:nil,
                                              keyEquivalent:"")

    private enum AppIconImage {
        static let statusConnected = NSImage(named: NSImage.Name("StatusBarButtonImageConnected"))!
        static let statusDisconnected = NSImage(named: NSImage.Name("StatusBarButtonImage"))!
    }

    private enum MenuTitle {
        static let open = "Open"
        static let quit = "Quit"
        static let statusConnected = "Connected"
        static let statusDisconnected = "Disconnected"
    }

    override init() {
        super.init()

        OutlineStatusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        self.setStatus(isConnected: false)

        let menu = NSMenu()
        let openMenuItem = NSMenuItem(title: MenuTitle.open, action: #selector(openApplication) , keyEquivalent: "o")
        openMenuItem.target = self
        menu.addItem(openMenuItem)
        menu.addItem(self.connectionStatusMenuItem)
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: MenuTitle.quit, action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        OutlineStatusItem.menu = menu
    }

    func setStatus(isConnected: Bool) {
        let appIconImage = isConnected ? AppIconImage.statusConnected : AppIconImage.statusDisconnected
        appIconImage.isTemplate = true
        OutlineStatusItem.button?.image = appIconImage

        let connectionStatusTitle = isConnected ? MenuTitle.statusConnected : MenuTitle.statusDisconnected
        self.connectionStatusMenuItem.title = connectionStatusTitle
    }

    @objc func openApplication(_ sender: AnyObject?) {
        NSApp.activate(ignoringOtherApps: true)
        guard let uiWindow = self.getUiWindow() else {
            return
        }
        uiWindow.makeKeyAndOrderFront(self)
    }

    private func getUiWindow() -> NSWindow? {
        for window in NSApp.windows {
            if String(describing: window).contains("UINSWindow") {
                return window
            }
        }
        return nil
    }
}

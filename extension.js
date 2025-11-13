//    Power Profile Indicator
//    GNOME Shell extension
//    @fthx 2025
//    bind_property trick taken from @fmuellner GNOME Shell code


import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { SystemIndicator } from 'resource:///org/gnome/shell/ui/quickSettings.js';


const PowerProfileIndicator = GObject.registerClass(
    class PowerProfileIndicator extends SystemIndicator {
        _init() {
            super._init();

            this._indicator = this._addIndicator();

            this._timeout = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                this._toggle = Main.panel.statusArea.quickSettings?._powerProfiles?.quickSettingsItems[0];
                this._toggle?.bind_property('icon-name', this._indicator, 'icon-name', GObject.BindingFlags.SYNC_CREATE);

                this._timeout = null;
                return GLib.SOURCE_REMOVE;
            });
        }

        destroy() {
            if (this._timeout) {
                GLib.Source.remove(this._timeout);
                this._timeout = null;
            }

            this._indicator?.destroy();
            this._indicator = null;

            super.destroy();
        }
    });

export default class PowerProfileIndicatorExtension {
    enable() {
        this._profileIndicator = new PowerProfileIndicator();
        Main.panel.statusArea.quickSettings?.addExternalIndicator(this._profileIndicator);
    }

    disable() {
        this._profileIndicator?.destroy();
        this._profileIndicator = null;
    }
}

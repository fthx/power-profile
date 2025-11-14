//    Power Profile Indicator
//    GNOME Shell extension
//    @fthx 2025 with help of @fmuellner


import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { SystemIndicator } from 'resource:///org/gnome/shell/ui/quickSettings.js';


const PowerProfileIndicator = GObject.registerClass(
    class PowerProfileIndicator extends SystemIndicator {
        _init() {
            super._init();

            this._indicator = this._addIndicator();

            this._setIcon();
            this.get_parent()?.connectObject('notify::allocation', () => this._setIcon(), this);
        }

        _setIcon() {
            if (this._toggle)
                return;

            Main.panel.statusArea.quickSettings?.addExternalIndicator(this);
            this.get_parent()?.set_child_above_sibling(this, null);

            this._toggle = Main.panel.statusArea.quickSettings?._powerProfiles?.quickSettingsItems[0];
            this._toggle?.bind_property('icon-name', this._indicator, 'icon-name', GObject.BindingFlags.SYNC_CREATE);
        }

        destroy() {
            this.get_parent()?.disconnectObject(this);

            this._indicator?.destroy();
            this._indicator = null;

            super.destroy();
        }
    });

export default class PowerProfileIndicatorExtension {
    enable() {
        this._powerProfileIndicator = new PowerProfileIndicator();
    }

    disable() {
        this._powerProfileIndicator?.destroy();
        this._powerProfileIndicator = null;
    }
}

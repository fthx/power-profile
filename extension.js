//    Power Profile Indicator
//    GNOME Shell extension
//    @fthx 2025 with help of @fmuellner


import Clutter from 'gi://Clutter';
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

            this.connectObject('scroll-event', (actor, event) => this._onScroll(event), this);
        }

        _setIcon() {
            if (this._toggle)
                return;

            Main.panel.statusArea.quickSettings?.addExternalIndicator(this);
            this.get_parent()?.set_child_above_sibling(this, null);

            this._toggle = Main.panel.statusArea.quickSettings?._powerProfiles?.quickSettingsItems[0];
            this._toggle?.bind_property('icon-name', this._indicator, 'icon-name', GObject.BindingFlags.SYNC_CREATE);
        }

        _setProfile(profile) {
            if (this._toggle?._proxy)
                this._toggle._proxy.ActiveProfile = profile;
        }

        _onScroll(event) {
            const activeProfile = this._toggle?._proxy?.ActiveProfile;
            const availableProfiles = this._toggle?._proxy?.Profiles?.map(p => p.Profile.unpack()).reverse();
            const activeProfileIndex = availableProfiles?.indexOf(activeProfile);

            let newProfile = activeProfile;

            switch (event?.get_scroll_direction()) {
                case Clutter.ScrollDirection.UP:
                    newProfile = availableProfiles[Math.max(activeProfileIndex - 1, 0)];
                    this._setProfile(newProfile);
                    break;
                case Clutter.ScrollDirection.DOWN:
                    newProfile = availableProfiles[Math.min(activeProfileIndex + 1, availableProfiles.length - 1)];
                    this._setProfile(newProfile);
                    break;
            }

            return Clutter.EVENT_STOP;
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

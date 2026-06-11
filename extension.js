//    Power Profile Indicator
//    GNOME Shell extension
//    @fthx 2026 with help of @fmuellner


import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';


export default class PowerProfileIndicatorExtension {
    _setProfile(profile) {
        if (this._toggle?._proxy)
            this._toggle._proxy.ActiveProfile = profile;
    }

    _onScroll(event) {
        const activeProfile = this._toggle?._proxy?.ActiveProfile;
        const availableProfiles = this._toggle?._proxy?.Profiles?.map(p => p.Profile.unpack());
        if (!availableProfiles)
            return Clutter.EVENT_PROPAGATE;
        const activeProfileIndex = availableProfiles.indexOf(activeProfile);

        let newProfile = activeProfile;

        switch (event?.get_scroll_direction()) {
            case Clutter.ScrollDirection.UP:
                newProfile = availableProfiles[Math.max(activeProfileIndex - 1, 0)];
                this._setProfile(newProfile);
                return Clutter.EVENT_STOP;
            case Clutter.ScrollDirection.DOWN:
                newProfile = availableProfiles[Math.min(activeProfileIndex + 1, availableProfiles.length - 1)];
                this._setProfile(newProfile);
                return Clutter.EVENT_STOP;
        }

        return Clutter.EVENT_PROPAGATE;
    }

    enable() {
        this._initTimeout = GLib.idle_add_once(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._initTimeout = null;

            const powerProfiles = Main.panel.statusArea.quickSettings._powerProfiles;
            this._toggle = powerProfiles?._powerProfilesToggle;
            this._indicator = powerProfiles?._indicator;

            if (this._toggle && this._indicator) {
                this._indicator.reactive = true;
                this._indicator.visible = true;

                this._toggle.connectObject('notify::checked', () => { this._indicator.visible = true; }, this);
                this._indicator.connectObject('scroll-event', (actor, event) => this._onScroll(event), this);
            }
        });
    }

    disable() {
        if (this._initTimeout)
            GLib.source_remove(this._initTimeout);
        this._initTimeout = null;

        if (this._toggle && this._indicator) {
            this._toggle.disconnectObject(this);
            this._indicator.disconnectObject(this);

            this._indicator.reactive = false;
            this._indicator.visible = this._toggle.checked;

            this._toggle = null;
            this._indicator = null;
        }
    }
}
import React from 'react';


class SettingsApi {
    static getWidgetLink() {
        return fetch('/api/settings/widgetUrl', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res)=>res.json());
    }
    
    static getWidgetConfig() {
        return fetch('/api/settings/widget', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res)=>res.json());
    }

    static saveWidgetConfig(config) {
        return fetch('/api/settings/widget', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(config)
        }).then((res)=>res.json());
    }

    static restoreWidgetDefaults() {
        return fetch('/api/settings/widget/reset', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res) => res.json());
    }


    static getProfileSettings() {
        return fetch('/api/settings/profile', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res) => res.json());
    }
    
    static saveProfileSettings(spec) {
        return fetch('/api/settings/profile', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(spec)
        }).then((res) => res.json());
    }

    static getEmailSettings() {
        return fetch('/api/settings/email', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res) => res.json());
    }
 
    static saveEmailSettings(spec) {
        return fetch('/api/settings/email', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(spec)
        }).then((res) => res.json());
    }


}

export default SettingsApi;

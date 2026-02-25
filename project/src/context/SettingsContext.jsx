import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await client.get('/settings');
                if (response.data && response.data.data) {
                    setSettings(response.data.data);

                    // Apply immediate side effects
                    if (response.data.data['site.name']) {
                        document.title = response.data.data['site.name'];
                    }
                }
            } catch (error) {
                console.error("Failed to load settings:", error);
            } finally {
                setLoadingSettings(false);
            }
        };

        fetchSettings();
    }, []);

    const value = {
        settings,
        loadingSettings,
        getSetting: (key, defaultValue = null) => {
            return settings[key] !== undefined ? settings[key] : defaultValue;
        }
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

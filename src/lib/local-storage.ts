export type StoredKeysType = {
    accessToken: string;
    refreshToken: string;
    user: string;
};

export const STORED_KEYS: StoredKeysType = {
    accessToken: "TOK",
    refreshToken: "RTOK",
    user: "user",
};

export type StoredKeys = keyof StoredKeysType;

const getItem = (key: StoredKeys) => localStorage.getItem(STORED_KEYS[key]);

const setItem = (key: StoredKeys, value: string) => localStorage.setItem(STORED_KEYS[key], value);

const removeItem = (key: StoredKeys) => localStorage.removeItem(STORED_KEYS[key]);

export const localStorageApi = {
    getItem,
    setItem,
    removeItem,
};

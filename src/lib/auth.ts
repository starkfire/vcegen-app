import { createAxiosInstance } from "./http";
import { StoredKeysType, localStorageApi } from "./local-storage";

const { getItem, setItem, removeItem } = localStorageApi;

const API_URL = import.meta.env.VITE_API_URL;

interface ITokensObject {
    access_token: string;
    refresh_token: string;
}

type TokenTypes = keyof Pick<StoredKeysType, "accessToken" | "refreshToken">;

export const getToken = (tokenType: TokenTypes) => getItem(tokenType);

export const setToken = (tokenType: TokenTypes, token: string) => setItem(tokenType, token);

export const unsetToken = (tokenType: TokenTypes) => removeItem(tokenType);

export const reassignTokens = (accessToken: string, refreshToken: string) => {
    setToken("accessToken", accessToken);
    setToken("refreshToken", refreshToken);
};

export const regenerateTokens = async (): Promise<boolean> => {
    const http = createAxiosInstance({ useRefreshToken: true });

    const onSuccess = (data: ITokensObject) => {
        const { access_token, refresh_token } = data;

        reassignTokens(access_token, refresh_token);
    };

    return http
        .get(`${API_URL}/auth/refresh`)
        .then((res) => {
            onSuccess(res.data);

            return Promise.resolve(true);
        })
        .catch((err) => {
            console.error(err);

            return Promise.reject(false);
        });
};

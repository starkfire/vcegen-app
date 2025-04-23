import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { getToken, regenerateTokens } from "./auth";

const RETRY_REFRESH_TOKEN_REQUEST_SECOND = 15;
const DEFAULT_CONNECTION_TIMEOUT_DURATION_MS = 5000;
const DEFAULT_REQUEST_TIMEOUT_DURATION_MS = 5000;

interface Header {
    [k: string]: any;
    "Content-Type": string;
    Authorization?: string | null;
}

interface DataObject {
    [k: string]: any;
}

interface ICreateAxiosInstanceOptions {
    data?: DataObject | null;
    headers?: Header | null;
    useRefreshToken?: boolean;
}

interface ICreateHeaderOptions {
    useRefreshToken?: boolean;
    ignoreTokens?: boolean;
}

const defaultAxiosInstanceOptions: ICreateAxiosInstanceOptions = {
    data: null,
    headers: null,
    useRefreshToken: false,
};

const defaultHeaderOptions: ICreateHeaderOptions = {
    useRefreshToken: false,
    ignoreTokens: false,
};

const defaultHeader: Header = {
    "Content-Type": "application/json",
    Authorization: null,
};

function defineHeader(header: Header | null = null, options: ICreateHeaderOptions = defaultHeaderOptions): Header {
    const customHeader: Header = header ? header : defaultHeader;

    // should tokens be ignored, return the header as is
    if (options.ignoreTokens) {
        return customHeader;
    }

    const token = options.useRefreshToken ? getToken("refreshToken") : getToken("accessToken");

    // attach authorization header only if the token exists
    customHeader["Authorization"] = token ? `Bearer ${token}` : null;

    return customHeader;
}

/**
 *  Creates an Axios instance using axios.create()
 */
export function createAxiosInstance(options: ICreateAxiosInstanceOptions = defaultAxiosInstanceOptions): AxiosInstance {
    const definedHeader = defineHeader(options.headers, options);

    return axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: definedHeader,
        data: options.data,
        withCredentials: definedHeader?.Authorization ? true : false,
        // handle request timeout
        timeout: DEFAULT_REQUEST_TIMEOUT_DURATION_MS,
        // handle connection timeout
        signal: AbortSignal.timeout(DEFAULT_CONNECTION_TIMEOUT_DURATION_MS),
    });
}

export function http(options: ICreateAxiosInstanceOptions = defaultAxiosInstanceOptions): AxiosInstance {
    const axiosInstance = createAxiosInstance(options);

    // intercept every outbound request
    axiosInstance.interceptors.request.use((config) => {
        // attach access token whenever a request is sent
        config.headers["Authorization"] = `Bearer ${getToken("accessToken")}`;
        config.headers["X-Vessel-Tag"] = import.meta.env.VITE_VESSEL_TAG;

        return config;
    });

    // keep track of times whenever a refresh token is requested
    const getCurrentUnixTime = () => Math.floor(Date.now() / 1000);
    let lastRefresh: number | null = null;

    // intercept requests with error responses
    axiosInstance.interceptors.response.use(
        async (res) => {
            // TODO: delay function for testing (?)
            return res;
        },
        async (err) => {
            const isLoggedIn = getToken("accessToken") ? true : false;

            // if the request fails with HTTP 401, then request for a new token
            if (
                err.response &&
                err.response.status === 401 &&
                (!lastRefresh || getCurrentUnixTime() - lastRefresh > RETRY_REFRESH_TOKEN_REQUEST_SECOND) &&
                isLoggedIn
            ) {
                // TODO: make sure this does not lead to any DoS-like behavior IN ANY CIRCUMSTANCE
                try {
                    const hasRegenerated = await regenerateTokens();

                    if (!hasRegenerated) {
                        throw "Failed to Regenerate Token";
                    }

                    // retry previous request after token regeneration
                    return axiosInstance(err.config);
                } catch (refreshError) {
                    console.error(refreshError);

                    throw refreshError;
                } finally {
                    lastRefresh = getCurrentUnixTime();
                }
            }

            // handle ERR_CANCELED errors (happens during polling)
            if (err.code === "ERR_CANCELED") {
                return Promise.resolve({ status: 499 });
            }

            return Promise.reject(err);
        },
    );

    return axiosInstance;
}

export { AxiosError };

export type { AxiosInstance, AxiosResponse, Header, DataObject, ICreateAxiosInstanceOptions, ICreateHeaderOptions };

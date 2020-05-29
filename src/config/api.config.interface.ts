import * as ConfigData from './current.config.json';

export interface ApiConfigInterface {
    srvIPAddress: string;
    expressListeningIPAddress: string;
    srvURLs: string;
    mongodbPort: number;
    mainDb: string;
    mainDbUsername: string;
    mainDbPassword: string;
    rsaVaultDb: string;
    rsaVaultDbUsername: string;
    rsaVaultDbPassword: string;
    mongoAuthDb: string;
}

export function apiConfig(): ApiConfigInterface {
    return ConfigData as unknown as ApiConfigInterface;
}
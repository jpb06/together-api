export interface DalConfig {
    srvIPAddress: string;
    mongodbPort: number;
    mainDb: string;
    mainDbUsername: string;
    mainDbPassword: string;
}

export abstract class DalConfiguration {
    public static url: string;
    public static database: string;
    public static username: string;
    public static password: string;

    public static Setup(
        config: DalConfig
    ): void {
        this.url = `mongodb://${config.srvIPAddress}:${config.mongodbPort}`;
        this.database = config.mainDb;
        this.username = config.mainDbUsername;
        this.password = config.mainDbPassword;
    }

    public static VerifyDatabaseConfig(): void {
        if (!this.url
          || this.url.length === 0
          || this.url === ('mongodb://:')
          || this.url.startsWith('mongodb://:')
          || this.url.endsWith(':')) {
            throw new Error('Invalid url specified to access mongodb instance');
        }

        if (!this.database || this.database.length === 0) {
            throw new Error('No database specified');
        }
    }

    public static SwitchDatabase(
        database: string,
        username: string,
        password: string
    ): void {
        this.database = database;
        this.username = username;
        this.password = password;
    }
}
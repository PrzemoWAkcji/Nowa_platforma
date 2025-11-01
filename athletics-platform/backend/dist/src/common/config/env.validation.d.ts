declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CORS_ORIGIN: string;
    THROTTLE_TTL: number;
    THROTTLE_LIMIT: number;
    CACHE_TTL: number;
    CACHE_MAX: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};

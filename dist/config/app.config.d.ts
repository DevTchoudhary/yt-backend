import * as Joi from 'joi';
export declare const validationSchema: Joi.ObjectSchema<any>;
export declare const appConfig: () => {
    nodeEnv: string | undefined;
    port: number;
    database: {
        uri: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        refreshSecret: string | undefined;
        expiresIn: string | undefined;
        refreshExpiresIn: string | undefined;
    };
    email: {
        host: string | undefined;
        port: number;
        secure: boolean;
        user: string | undefined;
        pass: string | undefined;
        from: string | undefined;
    };
    app: {
        url: string | undefined;
        dashboardBaseUrl: string | undefined;
    };
    security: {
        bcryptRounds: number;
        otpExpiresInMinutes: number;
        maxOtpAttempts: number;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
};

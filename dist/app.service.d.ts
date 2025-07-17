export declare class AppService {
    getHello(): string;
    getHealth(): {
        status: string;
        timestamp: string;
        service: string;
        version: string;
        environment: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
    };
}

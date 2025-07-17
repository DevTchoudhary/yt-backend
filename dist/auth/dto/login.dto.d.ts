export declare class LoginDto {
    email: string;
}
export declare class VerifyOtpDto {
    email: string;
    otp: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ResendOtpDto {
    email: string;
}
export declare class ChangeEmailDto {
    newEmail: string;
    otp: string;
}

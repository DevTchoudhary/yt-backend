"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.Permission = exports.CompanyStatus = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CLIENT"] = "client";
    UserRole["USER"] = "user";
    UserRole["SRE"] = "sre";
    UserRole["COMPANY_ADMIN"] = "company_admin";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["PENDING"] = "pending";
    UserStatus["SUSPENDED"] = "suspended";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var CompanyStatus;
(function (CompanyStatus) {
    CompanyStatus["PENDING"] = "pending";
    CompanyStatus["APPROVED"] = "approved";
    CompanyStatus["REJECTED"] = "rejected";
    CompanyStatus["ACTIVE"] = "active";
    CompanyStatus["INACTIVE"] = "inactive";
})(CompanyStatus || (exports.CompanyStatus = CompanyStatus = {}));
var Permission;
(function (Permission) {
    Permission["USER_READ"] = "user:read";
    Permission["USER_WRITE"] = "user:write";
    Permission["USER_DELETE"] = "user:delete";
    Permission["COMPANY_READ"] = "company:read";
    Permission["COMPANY_WRITE"] = "company:write";
    Permission["COMPANY_DELETE"] = "company:delete";
    Permission["COMPANY_APPROVE"] = "company:approve";
    Permission["PROJECT_READ"] = "project:read";
    Permission["PROJECT_WRITE"] = "project:write";
    Permission["PROJECT_DELETE"] = "project:delete";
    Permission["PROJECT_ASSIGN"] = "project:assign";
    Permission["ADMIN_DASHBOARD"] = "admin:dashboard";
    Permission["ADMIN_USERS"] = "admin:users";
    Permission["ADMIN_COMPANIES"] = "admin:companies";
    Permission["ADMIN_SETTINGS"] = "admin:settings";
})(Permission || (exports.Permission = Permission = {}));
exports.ROLE_PERMISSIONS = {
    [UserRole.CLIENT]: [
        Permission.USER_READ,
        Permission.COMPANY_READ,
        Permission.PROJECT_READ,
    ],
    [UserRole.USER]: [
        Permission.USER_READ,
        Permission.COMPANY_READ,
        Permission.PROJECT_READ,
    ],
    [UserRole.SRE]: [
        Permission.USER_READ,
        Permission.COMPANY_READ,
        Permission.PROJECT_READ,
        Permission.PROJECT_WRITE,
    ],
    [UserRole.COMPANY_ADMIN]: [
        Permission.USER_READ,
        Permission.USER_WRITE,
        Permission.USER_DELETE,
        Permission.COMPANY_READ,
        Permission.COMPANY_WRITE,
        Permission.PROJECT_READ,
        Permission.PROJECT_WRITE,
        Permission.PROJECT_DELETE,
    ],
    [UserRole.ADMIN]: Object.values(Permission),
};
//# sourceMappingURL=auth.interface.js.map
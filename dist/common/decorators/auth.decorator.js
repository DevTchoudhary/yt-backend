"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyId = exports.CurrentUser = exports.Permissions = exports.PERMISSIONS_KEY = exports.Roles = exports.ROLES_KEY = exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
exports.PERMISSIONS_KEY = 'permissions';
const Permissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.Permissions = Permissions;
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
exports.CompanyId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.companyId;
});
//# sourceMappingURL=auth.decorator.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSIONS_KEY = exports.ROLES_KEY = exports.CurrentUser = exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
exports.ROLES_KEY = 'roles';
exports.PERMISSIONS_KEY = 'permissions';
//# sourceMappingURL=auth.decorator.js.map
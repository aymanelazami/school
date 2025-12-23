import 'express';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      firstName?: string | undefined;
      lastName?: string | undefined;
      roleId?: number | undefined;
      role?: string | undefined;
      permissions?: string[] | undefined;
      twoFactorEnabled?: boolean | undefined;
      purpose?: string | undefined;
    }
  }
}

export { };

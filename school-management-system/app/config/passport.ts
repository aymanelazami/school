import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { eq } from 'drizzle-orm';
import { users } from '../database/user.ts';
import bcrypt from 'bcryptjs';
import { db } from './database.ts';
import { roles } from '../database/role.ts';
import { permissionsTable } from '../database/permissions.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'af3ee0f71443408897c5db5e0b7cbf17';

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use(new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
  try {
    const user = {
      id: jwt_payload.id,
      email: jwt_payload.email,
      roleId: jwt_payload.roleId,
      role: jwt_payload.role,
      permissions: jwt_payload.permissions || []
    };

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return done(null, false, { message: 'Utilisateur non trouvé' });
    }

    const foundUser = user[0];
    if (!foundUser) {
      return done(null, false, { message: 'Utilisateur non trouvé' });
    }

    const isValid = await bcrypt.compare(password, foundUser.password);
    if (!isValid) {
      return done(null, false, { message: 'Mot de passe incorrect' });
    }

    // Return a properly typed user object
    const userObj = {
      id: foundUser.id,
      email: foundUser.email,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      roleId: foundUser.roleId ?? undefined,
    };

    return done(null, userObj);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const userWithDetails = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        twoFactorEnabled: users.twoFactorEnabled,
        roleId: users.roleId,
        roleName: roles.name,
        permissions: permissionsTable.permissionsAllowed
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(permissionsTable, eq(permissionsTable.roleId, roles.id))
      .where(eq(users.id, id));

    if (userWithDetails.length === 0) {
      return done(new Error('User not found.'));
    }

    const userData = userWithDetails[0];
    if (!userData) {
      return done(new Error('User data is undefined.'));
    }

    const allPermissions: string[] = [];
    userWithDetails.forEach(data => {
      if (data?.permissions) {
        allPermissions.push(...data.permissions);
      }
    });

    const uniquePermissions = [...new Set(allPermissions)];

    const user = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      twoFactorEnabled: userData.twoFactorEnabled ?? undefined,
      roleId: userData.roleId ?? undefined,
      role: userData.roleName ?? undefined,
      permissions: uniquePermissions
    };

    done(null, user);
  } catch (error) {
    done(error);
  }
});


export default passport;
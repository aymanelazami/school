import { register } from "../controllers/registerController.ts";
import { login } from '../controllers/loginController.ts';
import { forgotPassword} from '../controllers/forgotPassword.ts';
import { resetPassword } from '../controllers/resetPassword.ts';
import { getProfile } from "../utilities/userProfile.ts";
import { authenticate } from "../middlewares/authentication.ts";
import { verifyEmail } from "../controllers/verificationController.ts";
import { logout } from '../controllers/logoutController.ts';
import { 
  generate2FASecret, 
  verify2FASetup, 
  disable2FA, 
  verify2FALogin,
  check2FAStatus
} from '../controllers/twoFactorAuthentication.ts';
import { Router } from "express";

const authRouter = Router();

// Existing routes
authRouter.post('/register', register);
authRouter.post('/login', login); 
authRouter.get('/verify/:token', verifyEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password/:token', resetPassword);

// 2FA routes
authRouter.post('/2fa/generate', authenticate, generate2FASecret);
authRouter.post('/2fa/verify-setup', authenticate, verify2FASetup);
authRouter.post('/2fa/disable', authenticate, disable2FA);
authRouter.post('/2fa/verify-login', verify2FALogin);
authRouter.get('/2fa/status', authenticate, check2FAStatus);

// Protected routes
authRouter.get('/get-profile', authenticate, getProfile);
authRouter.post('/logout', authenticate, logout); 

export { authRouter };
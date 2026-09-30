import { query, pool } from '../config/db.js';
import { authController } from '../controllers/authController.js';

async function test() {
  const phone = '919920858396';
  const otpRes = await query('SELECT * FROM auth_otps WHERE phone = $1 AND is_used = false ORDER BY created_at DESC LIMIT 1', [phone]);
  const code = otpRes.rows[0]?.otp_code;
  console.log('Active OTP Code in DB:', code);

  let resJson = null;
  const mockReq = { body: { phone: '+919920858396', otp: code } };
  const mockRes = {
    status: (c) => ({
      json: (d) => { resJson = d; }
    }),
    json: (d) => { resJson = d; }
  };

  await authController.verifyWhatsAppOtp(mockReq, mockRes, (e) => console.error(e));
  console.log('Verification Result:', resJson);
  await pool.end();
}

test().catch(console.error);

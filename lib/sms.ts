/**
 * Simulated SMS Dispatcher for OTPs.
 * Prints the verification code to the console for testing/development.
 */
export async function sendOtpSms(phoneNumber: string, otpCode: string): Promise<void> {
  console.log("\n==================================================");
  console.log("             [SIMULATED SMS OTP LOG]              ");
  console.log("==================================================");
  console.log(`To:      ${phoneNumber}`);
  console.log(`Message: Hnaruak Mizoram account register verifying OTP code is: ${otpCode}. Valid for 10 minutes.`);
  console.log("==================================================\n");
}

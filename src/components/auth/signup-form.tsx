'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, Loader2, CheckCircle2, Phone, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { signupSchema } from '@/lib/validations';
import { APP_NAME } from '@/lib/constants';

const passwordRequirements = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[A-Z]/, label: 'One uppercase letter' },
  { regex: /[a-z]/, label: 'One lowercase letter' },
  { regex: /[0-9]/, label: 'One number' },
];

// Mock OTP validation - valid OTPs are "123456" and "000000"
const VALID_OTPS = ['123456', '000000'];
const OTP_EXPIRY_SECONDS = 120; // 2 minutes

export function SignupForm() {
  const { signup, isSubmitting, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  
  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);
  
  // Reset OTP state when phone number changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Only reset if OTP was already sent or verified
    setOtpSent(false);
    setPhoneVerified(false);
    setOtpValue('');
    setOtpError('');
  }, [formData.phone]);
  
  const isValidPhoneNumber = (phone: string) => {
    // Basic phone validation - at least 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };
  
  const handleSendOtp = async () => {
    if (!isValidPhoneNumber(formData.phone)) {
      setValidationErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      return;
    }
    
    setSendingOtp(true);
    setOtpError('');
    
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSendingOtp(false);
    setOtpSent(true);
    setOtpCountdown(OTP_EXPIRY_SECONDS);
  };
  
  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }
    
    setVerifyingOtp(true);
    setOtpError('');
    
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (VALID_OTPS.includes(otpValue)) {
      setPhoneVerified(true);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP. Please try again. (Hint: Use 123456 or 000000)');
    }
    
    setVerifyingOtp(false);
  };
  
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    await handleSendOtp();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    const { confirmPassword, ...signupData } = formData;
    await signup(signupData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.3, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl">{APP_NAME}</span>
            </Link>
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription>
              Get started with your insurance journey today
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={validationErrors.firstName ? 'border-destructive' : ''}
                  />
                  {validationErrors.firstName && (
                    <p className="text-xs text-destructive">{validationErrors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={validationErrors.lastName ? 'border-destructive' : ''}
                  />
                  {validationErrors.lastName && (
                    <p className="text-xs text-destructive">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={validationErrors.email ? 'border-destructive' : ''}
                />
                {validationErrors.email && (
                  <p className="text-xs text-destructive">{validationErrors.email}</p>
                )}
              </div>

              {/* Phone Number with OTP Verification */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+1-555-0100"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={phoneVerified}
                      className={`pl-9 ${validationErrors.phone ? 'border-destructive' : ''} ${phoneVerified ? 'border-accent bg-accent/5' : ''}`}
                    />
                    {phoneVerified && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                    )}
                  </div>
                  {!phoneVerified && (
                    <Button
                      type="button"
                      variant={otpSent ? 'outline' : 'default'}
                      size="sm"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || !formData.phone || (otpSent && otpCountdown > 0)}
                      className="whitespace-nowrap"
                    >
                      {sendingOtp ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : otpSent ? (
                        otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Resend OTP'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {validationErrors.phone && (
                  <p className="text-xs text-destructive">{validationErrors.phone}</p>
                )}
                
                {/* OTP Input - shown after sending OTP */}
                {otpSent && !phoneVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <p className="text-sm text-muted-foreground mb-2">
                      Enter the 6-digit code sent to your phone
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="000000"
                        value={otpValue}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtpValue(value);
                          setOtpError('');
                        }}
                        maxLength={6}
                        className={`text-center text-lg tracking-widest font-mono ${otpError ? 'border-destructive' : ''}`}
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otpValue.length !== 6}
                      >
                        {verifyingOtp ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    </div>
                    {otpError && (
                      <p className="text-xs text-destructive mt-2">{otpError}</p>
                    )}
                  </motion.div>
                )}
                
                {/* Phone Verified Badge */}
                {phoneVerified && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-sm text-accent"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Phone number verified
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={validationErrors.dateOfBirth ? 'border-destructive' : ''}
                />
                {validationErrors.dateOfBirth && (
                  <p className="text-xs text-destructive">{validationErrors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className={validationErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-destructive">{validationErrors.password}</p>
                )}

                {/* Password requirements */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-1 text-xs ${
                        req.regex.test(formData.password)
                          ? 'text-accent'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {req.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={validationErrors.confirmPassword ? 'border-destructive' : ''}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-destructive">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !phoneVerified}
                title={!phoneVerified ? 'Please verify your phone number first' : undefined}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : !phoneVerified ? (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Verify Phone to Continue
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

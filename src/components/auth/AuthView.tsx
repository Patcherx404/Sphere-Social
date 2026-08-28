import React, { useState } from 'react';
import { 
  Check, AlertCircle, ShieldCheck, ArrowRight, Mail, Sparkles
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const AuthView: React.FC = () => {
  const { 
    loginWithGoogle, 
    loginWithGoogleFirebase
  } = useSocial();

  const [showManualGmail, setShowManualGmail] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [isFirebaseGoogleLoading, setIsFirebaseGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFirebaseGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsFirebaseGoogleLoading(true);

    try {
      const result = await loginWithGoogleFirebase();
      if (!result.success) {
        if (
          result.error?.includes('auth/unauthorized-domain') || 
          result.error?.includes('unauthorized domain') ||
          result.error?.includes('popup-blocked')
        ) {
          // Open direct Gmail input fallback smoothly
          setShowManualGmail(true);
          setErrorMsg(result.error || 'Please enter your Gmail address to continue.');
        } else {
          setErrorMsg(result.error || 'Google Sign-In failed.');
        }
      } else {
        setSuccessMsg('Successfully connected via Google!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Firebase Google Sign-In failed.');
    } finally {
      setIsFirebaseGoogleLoading(false);
    }
  };

  const handleManualGmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const email = googleEmailInput.trim();
    if (!email) {
      setErrorMsg('Please enter your Gmail address.');
      return;
    }

    if (!email.toLowerCase().endsWith('@gmail.com') && !email.includes('@')) {
      setErrorMsg('Please enter a valid Gmail address (e.g. yourname@gmail.com).');
      return;
    }

    const result = loginWithGoogle(email, googleNameInput.trim() || undefined);
    if (!result.success) {
      setErrorMsg(result.error || 'Google login failed.');
    } else {
      setSuccessMsg('Signed in successfully with Gmail!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] via-[#FFF0F4]/40 to-[#EAF2FF] flex items-center justify-center p-4 selection:bg-[#FF3D71]/20 selection:text-[#FF3D71]">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="p-6 sm:p-8 text-center pb-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#FF3D71] to-[#FF7E44] flex items-center justify-center shadow-lg shadow-[#FF3D71]/30 mb-3 hover:scale-105 transition-transform">
            <span className="text-white font-black text-2xl tracking-wider">S</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sphere Social</h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect with friends, share updates, and message in real-time.
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-semibold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Gmail Authentication Enabled</span>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mx-6 sm:mx-8 mb-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 sm:mx-8 mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-600 animate-in fade-in">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Authentication Options */}
        <div className="px-6 sm:px-8 pb-8 space-y-4">
          
          {/* Main Google One-Click Button */}
          <button
            type="button"
            id="google-signin-button"
            disabled={isFirebaseGoogleLoading}
            onClick={handleFirebaseGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-[#4285F4] rounded-2xl text-xs font-bold text-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group disabled:opacity-60"
          >
            {isFirebaseGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              /* Google Authentic SVG Logo */
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span className="text-sm font-semibold">
              {isFirebaseGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google'}
            </span>
          </button>

          {/* Direct Gmail Input Alternative */}
          <div className="pt-2">
            {!showManualGmail ? (
              <button
                type="button"
                id="toggle-manual-gmail"
                onClick={() => setShowManualGmail(true)}
                className="w-full text-center text-xs font-semibold text-[#3366FF] hover:text-[#254edb] hover:underline cursor-pointer transition-colors"
              >
                Or enter Gmail address manually
              </button>
            ) : (
              <form onSubmit={handleManualGmailSignIn} className="bg-[#F7F9FC] border border-slate-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#4285F4]" />
                    Sign in with Gmail
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowManualGmail(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    Hide
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@gmail.com"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4285F4] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Your Display Name"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4285F4] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-manual-gmail"
                  className="w-full py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Continue with Gmail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

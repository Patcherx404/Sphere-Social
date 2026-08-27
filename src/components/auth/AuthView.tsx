import React, { useState } from 'react';
import { 
  UserPlus, LogIn, Lock, User as UserIcon, Sparkles, Check, 
  AlertCircle, Eye, EyeOff, Image, ShieldCheck, ArrowRight, Mail,
  Globe
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';
import { AVATAR_PRESETS } from '../../data/mockData';

export const AuthView: React.FC = () => {
  const { 
    registerUser, 
    loginUser, 
    loginWithGoogle, 
    loginWithGoogleFirebase,
    users, 
    loginWithUserId 
  } = useSocial();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('projectile.afk@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [isFirebaseGoogleLoading, setIsFirebaseGoogleLoading] = useState(false);
  
  // Registration form state
  const [regName, setRegName] = useState('');
  const [regHandle, setRegHandle] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regBio, setRegBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFirebaseGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsFirebaseGoogleLoading(true);

    try {
      const result = await loginWithGoogleFirebase();
      if (!result.success) {
        // If popup was blocked or closed, give helpful error and fallback
        setErrorMsg(result.error || 'Google Sign-In could not complete. You can also use Quick Connect below.');
      } else {
        setSuccessMsg('Successfully connected via Firebase!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Firebase Google Sign-In failed.');
    } finally {
      setIsFirebaseGoogleLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regHandle.trim()) {
      setErrorMsg('Please enter a username.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const finalAvatar = showCustomAvatarInput && customAvatarUrl.trim() 
      ? customAvatarUrl.trim() 
      : selectedAvatar;

    const result = registerUser({
      name: regName.trim(),
      handle: regHandle.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: regEmail.trim() || undefined,
      password: regPassword,
      avatar: finalAvatar,
      bio: regBio.trim() || 'Excited to be on Sphere! ✨'
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Registration failed.');
    } else {
      setSuccessMsg('Account created successfully! Logging you in...');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your username or email.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const result = loginUser(loginIdentifier.trim(), loginPassword);
    if (!result.success) {
      setErrorMsg(result.error || 'Invalid username, email or password.');
    }
  };

  const handleGoogleSignIn = (emailToUse: string, nameToUse?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = loginWithGoogle(emailToUse, nameToUse);
    if (!result.success) {
      setErrorMsg(result.error || 'Google login failed.');
    } else {
      setShowGoogleModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] via-[#FFF0F4]/40 to-[#EAF2FF] flex items-center justify-center p-4 selection:bg-[#FF3D71]/20 selection:text-[#FF3D71]">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="p-6 sm:p-8 text-center pb-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#FF3D71] to-[#FF7E44] flex items-center justify-center shadow-lg shadow-[#FF3D71]/30 mb-3 hover:scale-105 transition-transform">
            <span className="text-white font-black text-2xl tracking-wider">S</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sphere Social</h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect with friends, share updates, and message in real-time.
          </p>

          {/* Firebase Active Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2.5 rounded-full bg-orange-50 border border-orange-200/80 text-[10px] font-bold text-orange-700">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span>Firebase Authentication & Database Ready</span>
          </div>

          {/* Prominent Firebase Google Sign-In Button */}
          <div className="mt-4 space-y-2">
            <button
              type="button"
              disabled={isFirebaseGoogleLoading}
              onClick={handleFirebaseGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-800 shadow-xs hover:shadow-sm transition-all cursor-pointer group disabled:opacity-60"
            >
              {isFirebaseGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                /* Google Authentic SVG Logo */
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>{isFirebaseGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google (Firebase)'}</span>
            </button>

            {/* Quick 1-Click for projectile.afk@gmail.com */}
            <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
              <button
                type="button"
                onClick={() => handleGoogleSignIn('projectile.afk@gmail.com', 'Projectile AFK')}
                className="text-[#3366FF] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Quick Connect: projectile.afk@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="text-slate-500 hover:text-slate-800 hover:underline"
              >
                Other Gmail
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">or continue with username</span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F7F9FC] border border-slate-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#FF3D71] shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#FF3D71] shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
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

        {/* Forms Container */}
        <div className="px-6 sm:px-8 pb-8">
          {mode === 'register' ? (
            /* --- REGISTRATION FORM --- */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">@</span>
                    <input
                      type="text"
                      required
                      placeholder="username"
                      value={regHandle}
                      onChange={(e) => setRegHandle(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="name@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Avatar Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Choose Avatar</label>
                  <button
                    type="button"
                    onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                    className="text-[11px] text-[#3366FF] hover:underline font-semibold"
                  >
                    {showCustomAvatarInput ? 'Use presets' : 'Paste custom image URL'}
                  </button>
                </div>

                {showCustomAvatarInput ? (
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71]"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {AVATAR_PRESETS.map((url, idx) => {
                      const isSelected = selectedAvatar === url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAvatar(url)}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                            isSelected ? 'border-[#FF3D71] ring-2 ring-[#FF3D71]/30 scale-105' : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt="preset" className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#FF3D71]/30 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bio / Status (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design Enthusiast & Traveler 🌍"
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-gradient-to-r from-[#FF3D71] to-[#FF7E44] hover:from-[#e03161] hover:to-[#e66c35] text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#FF3D71]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register & Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* --- SIGN IN FORM --- */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter username or email"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-gradient-to-r from-[#FF3D71] to-[#FF7E44] hover:from-[#e03161] hover:to-[#e66c35] text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#FF3D71]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to Sphere</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Registered Accounts on this Device */}
          {users.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Registered Accounts ({users.length})
                </span>
                <span className="text-[10px] text-slate-400">Click to switch</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => loginWithUserId(u.id)}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-[#F7F9FC] hover:bg-[#FFF0F4] hover:border-[#FF3D71]/40 border border-slate-200/80 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-[#FF3D71] truncate">
                            {u.name}
                          </span>
                          {u.verified && <ShieldCheck className="w-3 h-3 text-[#3366FF] flex-shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">
                          @{u.handle} {u.email ? `• ${u.email}` : ''}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-[#FF3D71] px-2 py-0.5 rounded-lg bg-white border border-[#FFD0DE] group-hover:bg-[#FF3D71] group-hover:text-white transition-colors">
                      Sign In
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Custom Gmail Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="font-bold text-sm text-slate-900">Sign in with Google</h3>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGoogleSignIn(googleEmailInput, googleNameInput);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FF3D71]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FF3D71]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

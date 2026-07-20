import { useState } from 'react';
import { useApp } from '../context';
import { Input, Field, Btn } from '../components/Modal';
import { Icons } from '../icons';
import type { UserStructure } from '../types';

type Tab = 'login' | 'register';
type RegStep = 1 | 2;

export default function LoginPage() {
  const { login, register } = useApp();
  const [tab, setTab] = useState<Tab>('login');
  const [step, setStep] = useState<RegStep>(1);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginInfo, setLoginInfo] = useState('');

  // Register state
  const [reg, setReg] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    class: '',
    phoneNumber: '',
    telegramUsername: '',
    structure: 'Government' as UserStructure,
  });
  const [regErrors, setRegErrors] = useState<Partial<typeof reg & { confirm: string }>>({});
  const [regSuccess, setRegSuccess] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginInfo('');
    const result = login(loginEmail, loginPwd);
    if (result === 'invalid') setLoginError('Invalid email or password.');
    else if (result === 'pending') setLoginInfo('Your application is pending approval from the President.');
    else if (result === 'inactive') setLoginError('Your account has been deactivated. Contact the President.');
  }

  function validateStep1() {
    const errs: typeof regErrors = {};
    if (!reg.fullName.trim()) errs.fullName = 'Required';
    if (!reg.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reg.email)) errs.email = 'Invalid email';
    if (!reg.password) errs.password = 'Required';
    else if (reg.password.length < 6) errs.password = 'Minimum 6 characters';
    if (reg.password !== reg.confirmPassword) errs.confirm = 'Passwords do not match';
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleRegStep1(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }

  function handleRegSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof regErrors = {};
    if (!reg.class.trim()) errs.class = 'Required';
    if (!reg.phoneNumber.trim()) errs.phoneNumber = 'Required';
    setRegErrors(errs);
    if (Object.keys(errs).length > 0) return;
    register({
      fullName: reg.fullName.trim(),
      email: reg.email.trim(),
      password: btoa(reg.password),
      class: reg.class.trim(),
      phoneNumber: reg.phoneNumber.trim(),
      telegramUsername: reg.telegramUsername.trim(),
      structure: reg.structure,
    });
    setRegSuccess(true);
  }

  function upd(k: keyof typeof reg) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setReg(r => ({ ...r, [k]: e.target.value }));
      setRegErrors(err => ({ ...err, [k]: undefined }));
    };
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1D4ED8 0%, #1E40AF 50%, #1e3a8a 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              {Icons.logo}
            </div>
            <div>
              <div className="font-display font-bold text-xl leading-none">StudentGov</div>
              <div className="text-white/60 text-xs mt-0.5">Student Council Platform</div>
            </div>
          </div>

          <h1 className="font-display font-bold text-3xl leading-tight mb-4">
            One place for your student council.
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed">
            Manage members, track activity reports, share announcements, and keep the council running — all in one platform.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            {[
              { icon: Icons.members, label: 'Member management', desc: 'Profiles, roles, and structure' },
              { icon: Icons.reports, label: 'Activity reports', desc: 'Submit, review, and award points' },
              { icon: Icons.megaphone, label: 'Announcements', desc: 'Keep everyone informed' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-white/50 text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-white/40 text-xs">
          Demo credentials — President: <span className="text-white/60">president@school.edu / president</span>
          <br />
          VP: <span className="text-white/60">vp@school.edu / vp123</span>
          <br />
          Member: <span className="text-white/60">sofia@school.edu / member123</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-bg">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              {Icons.logo}
            </div>
            <span className="font-display font-bold text-lg text-slate-900">StudentGov</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setStep(1); setRegSuccess(false); setLoginError(''); setLoginInfo(''); }}
                className={`flex-1 py-2 rounded-lg text-[13.5px] font-semibold transition-all capitalize ${
                  tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <h2 className="font-display font-bold text-2xl text-slate-900">Welcome back</h2>
                <p className="text-slate-500 text-sm mt-1">Sign in to your council account</p>
              </div>

              <Field label="Email">
                <Input
                  type="email"
                  placeholder="your@email.edu"
                  value={loginEmail}
                  onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
                  autoComplete="email"
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <Input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPwd}
                    onChange={e => { setLoginPwd(e.target.value); setLoginError(''); }}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? Icons.eyeOff : Icons.eye}
                  </button>
                </div>
              </Field>

              {loginError && (
                <div className="px-3 py-2.5 rounded-lg bg-danger-bg text-danger text-[13px]">{loginError}</div>
              )}
              {loginInfo && (
                <div className="px-3 py-2.5 rounded-lg bg-warning-bg text-warning text-[13px]">{loginInfo}</div>
              )}

              <Btn type="submit" className="w-full mt-1">Sign In</Btn>
            </form>
          )}

          {/* Registration form */}
          {tab === 'register' && !regSuccess && (
            <div>
              <div className="mb-5">
                <h2 className="font-display font-bold text-2xl text-slate-900">Join the council</h2>
                <p className="text-slate-500 text-sm mt-1">
                  {step === 1 ? 'Step 1 of 2 — Account details' : 'Step 2 of 2 — Personal information'}
                </p>
                <div className="flex gap-1.5 mt-3">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-slate-200'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
                </div>
              </div>

              {step === 1 && (
                <form onSubmit={handleRegStep1} className="flex flex-col gap-4">
                  <Field label="Full Name" required>
                    <Input placeholder="e.g. Sofia Patel" value={reg.fullName} onChange={upd('fullName')} error={regErrors.fullName} />
                    {regErrors.fullName && <p className="text-[12px] text-danger">{regErrors.fullName}</p>}
                  </Field>
                  <Field label="Email" required>
                    <Input type="email" placeholder="your@email.edu" value={reg.email} onChange={upd('email')} error={regErrors.email} />
                    {regErrors.email && <p className="text-[12px] text-danger">{regErrors.email}</p>}
                  </Field>
                  <Field label="Password" required>
                    <div className="relative">
                      <Input
                        type={showPwd ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={reg.password}
                        onChange={upd('password')}
                        error={regErrors.password}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPwd ? Icons.eyeOff : Icons.eye}
                      </button>
                    </div>
                    {regErrors.password && <p className="text-[12px] text-danger">{regErrors.password}</p>}
                  </Field>
                  <Field label="Confirm Password" required>
                    <Input
                      type="password"
                      placeholder="Repeat password"
                      value={reg.confirmPassword}
                      onChange={upd('confirmPassword')}
                      error={regErrors.confirm}
                    />
                    {regErrors.confirm && <p className="text-[12px] text-danger">{regErrors.confirm}</p>}
                  </Field>
                  <Btn type="submit" className="w-full mt-1">Continue</Btn>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleRegSubmit} className="flex flex-col gap-4">
                  <Field label="Class" required>
                    <Input placeholder="e.g. 10A" value={reg.class} onChange={upd('class')} error={regErrors.class} />
                    {regErrors.class && <p className="text-[12px] text-danger">{regErrors.class}</p>}
                  </Field>
                  <Field label="Phone Number" required>
                    <Input placeholder="+1 (555) 000-0000" value={reg.phoneNumber} onChange={upd('phoneNumber')} error={regErrors.phoneNumber} />
                    {regErrors.phoneNumber && <p className="text-[12px] text-danger">{regErrors.phoneNumber}</p>}
                  </Field>
                  <Field label="Telegram Username">
                    <Input placeholder="@username" value={reg.telegramUsername} onChange={upd('telegramUsername')} />
                  </Field>
                  <Field label="Structure" required>
                    <select
                      value={reg.structure}
                      onChange={upd('structure')}
                      className="w-full px-3 py-2 text-[14px] border border-border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                    >
                      <option value="Government">Government</option>
                      <option value="Council of Class Presidents">Council of Class Presidents</option>
                    </select>
                  </Field>
                  <div className="flex gap-2 mt-1">
                    <Btn type="button" variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Btn>
                    <Btn type="submit" className="flex-1">Submit Application</Btn>
                  </div>
                </form>
              )}
            </div>
          )}

          {tab === 'register' && regSuccess && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4 text-success">
                {Icons.check}
              </div>
              <h2 className="font-display font-bold text-xl text-slate-900 mb-2">Application submitted</h2>
              <p className="text-slate-500 text-[14px] leading-relaxed">
                Your application is under review. The President will approve or reject it shortly. You'll be able to sign in once approved.
              </p>
              <Btn variant="secondary" className="mt-6 w-full" onClick={() => { setTab('login'); setRegSuccess(false); }}>
                Back to Sign In
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

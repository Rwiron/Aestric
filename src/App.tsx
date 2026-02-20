/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hospital as HospitalIcon, 
  User as UserIcon, 
  Activity, 
  Calendar, 
  Users, 
  LogOut, 
  ChevronRight, 
  Search, 
  Bell, 
  Settings,
  ShieldCheck,
  ArrowRight,
  Plus,
  Filter
} from 'lucide-react';
import { User, Hospital, Patient, HospitalStats } from './types';

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }: any) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100"
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5">
    {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
    <input 
      {...props} 
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
    />
  </div>
);

// --- Pages ---

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'phone'>('credentials');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('1234567890');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) onLogin(data.user);
      else setError(data.error || 'Invalid credentials');
    } catch (err) {
      console.error('Credentials login error:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (res.ok) setStep('otp');
      else setError('User not found. Try 1234567890');
    } catch (err) {
      console.error('OTP request error:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (res.ok) onLogin(data.user);
      else setError('Invalid OTP. Use 123456');
    } catch (err) {
      console.error('OTP verify error:', err);
      setError('Verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-sky-200">
            <HospitalIcon className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Aetheris Health</h1>
          <p className="text-slate-500 text-sm mt-1">Professional Facility Management</p>
        </div>

        {step === 'input' && (
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button 
              onClick={() => setLoginMethod('credentials')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === 'credentials' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Credentials
            </button>
            <button 
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Phone Number
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.div 
              key={loginMethod}
              initial={{ opacity: 0, x: loginMethod === 'credentials' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: loginMethod === 'credentials' ? 10 : -10 }}
            >
              {loginMethod === 'credentials' ? (
                <form onSubmit={handleCredentialsLogin} className="space-y-6">
                  <Input 
                    label="Username" 
                    type="text" 
                    placeholder="Enter username" 
                    value={username}
                    onChange={(e: any) => setUsername(e.target.value)}
                    required
                  />
                  <Input 
                    label="Password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    required
                  />
                  {error && <p className="text-rose-500 text-xs font-medium">{error}</p>}
                  <Button type="submit" className="w-full py-3" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRequestOtp} className="space-y-6">
                  <Input 
                    label="Phone Number" 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    value={phone}
                    onChange={(e: any) => setPhone(e.target.value)}
                    required
                  />
                  {error && <p className="text-rose-500 text-xs font-medium">{error}</p>}
                  <Button type="submit" className="w-full py-3" disabled={loading}>
                    {loading ? 'Requesting...' : 'Send Verification Code'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.form 
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOtp} 
              className="space-y-6"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-slate-600">We've sent a 6-digit code to</p>
                <p className="text-sm font-semibold text-slate-900">{phone}</p>
              </div>
              <Input 
                label="Verification Code" 
                type="text" 
                placeholder="000000" 
                maxLength={6}
                value={otp}
                onChange={(e: any) => setOtp(e.target.value)}
                required
              />
              {error && <p className="text-rose-500 text-xs font-medium">{error}</p>}
              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Access'}
                <ShieldCheck className="w-4 h-4" />
              </Button>
              <button 
                type="button" 
                onClick={() => setStep('input')}
                className="w-full text-xs text-slate-400 hover:text-sky-600 transition-colors"
              >
                Use a different login method
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-semibold">
            Secure Multi-Tenant Infrastructure
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const HospitalSelectPage = ({ user, onSelect, onLogout }: { user: User, onSelect: (h: Hospital) => void, onLogout: () => void }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/user/${user.id}/hospitals`)
      .then(res => res.json())
      .then(data => {
        setHospitals(data);
        setLoading(false);
      });
  }, [user.id]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-5xl">
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">Authenticated Session</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Welcome, {user.fullName.split(' ')[0]}
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
            Please select a medical facility to begin your management session.
          </p>
        </motion.header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-slate-200 shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hospitals.map((h, idx) => (
              <motion.button
                key={h.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4, shadow: '0 12px 20px -5px rgb(0 0 0 / 0.05)' }}
                onClick={() => onSelect(h)}
                className="group relative text-left bg-white p-8 rounded-2xl border border-slate-200 hover:border-sky-400 transition-all duration-300"
              >
                {idx === 0 && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded uppercase tracking-wider border border-emerald-100">
                    Primary
                  </div>
                )}
                
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-50 transition-colors">
                  <HospitalIcon className="w-7 h-7 text-slate-400 group-hover:text-sky-600 transition-colors" />
                </div>

                <div className="space-y-1 mb-8">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{h.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-sm">{h.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Level</p>
                    <p className="text-sm font-semibold text-slate-700">{h.role}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            ))}
            
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: hospitals.length * 0.1 }}
              className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-sky-600" />
              </div>
              <p className="text-sm font-bold text-slate-500 group-hover:text-sky-600">Register Facility</p>
              <p className="text-[10px] text-slate-400 mt-1">Add new tenant to network</p>
            </motion.button>
          </div>
        )}

        <footer className="mt-16 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Logged in as <span className="text-slate-600">{user.email}</span> • 
            <button onClick={onLogout} className="ml-2 text-sky-600 hover:underline">Switch Account</button>
          </p>
        </footer>
      </div>
    </div>
  );
};

const Dashboard = ({ user, hospital, onLogout }: { user: User, hospital: Hospital, onLogout: () => void }) => {
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      fetch(`/api/hospital/${hospital.id}/stats`).then(res => res.json()),
      fetch(`/api/hospital/${hospital.id}/patients`).then(res => res.json())
    ]).then(([statsData, patientsData]) => {
      setStats(statsData);
      setPatients(patientsData);
    });
  }, [hospital.id]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <HospitalIcon className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">Aetheris</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview', icon: Activity, label: 'Overview' },
            { id: 'patients', icon: Users, label: 'Patients' },
            { id: 'appointments', icon: Calendar, label: 'Appointments' },
            { id: 'staff', icon: ShieldCheck, label: 'Staff Registry' },
            { id: 'settings', icon: Settings, label: 'Facility Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-sky-50 text-sky-700' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200">
                <UserIcon className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                <p className="text-[10px] text-slate-500 truncate">{hospital.role}</p>
              </div>
            </div>
            <Button variant="danger" className="w-full text-xs py-1.5" onClick={onLogout}>
              <LogOut className="w-3 h-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">{hospital.name}</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">
              {hospital.code}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-sky-500 rounded-lg text-sm outline-none transition-all w-64"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Patients', value: stats?.patients || 0, icon: Users, color: 'sky' },
                    { label: 'Critical Care', value: stats?.critical || 0, icon: Activity, color: 'rose' },
                    { label: 'Appointments Today', value: stats?.appointments || 0, icon: Calendar, color: 'indigo' },
                    { label: 'Active Staff', value: stats?.staff || 0, icon: ShieldCheck, color: 'emerald' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+12%</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Patients Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Patient Registry</h3>
                      <p className="text-xs text-slate-500 mt-1">Real-time status of current admissions</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="text-xs">
                        <Filter className="w-3 h-3" />
                        Filter
                      </Button>
                      <Button className="text-xs">
                        <Plus className="w-3 h-3" />
                        Add Patient
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Name</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age/Gender</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Condition</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {patients.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                  {p.full_name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-sm font-semibold text-slate-900">{p.full_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{p.age}y / {p.gender}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{p.condition}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                p.status === 'Critical' ? 'bg-rose-50 text-rose-600' : 
                                p.status === 'Stable' ? 'bg-emerald-50 text-emerald-600' : 
                                'bg-sky-50 text-sky-600'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-slate-400 hover:text-sky-600 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab !== 'overview' && (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-slate-400"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Module Under Maintenance</h3>
                <p className="text-sm">This section is currently being updated for the {hospital.name} instance.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const handleLogout = () => {
    setUser(null);
    setSelectedHospital(null);
  };

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  if (!selectedHospital) {
    return <HospitalSelectPage user={user} onSelect={setSelectedHospital} onLogout={handleLogout} />;
  }

  return <Dashboard user={user} hospital={selectedHospital} onLogout={handleLogout} />;
}

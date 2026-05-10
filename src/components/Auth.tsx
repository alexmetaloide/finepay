import React, { useState } from 'react';
import { api } from '../lib/api';
import { Receipt, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: (data: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = isLogin 
        ? await api.auth.login({ email: formData.email, password: formData.password })
        : await api.auth.register(formData);
      
      localStorage.setItem('finepay_token', data.token);
      localStorage.setItem('finepay_user', JSON.stringify(data.user));
      onAuthSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-col justify-center p-20 bg-indigo-600 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="bg-white/20 p-4 rounded-3xl w-fit mb-10 backdrop-blur-md">
            <Receipt className="w-12 h-12" />
          </div>
          <h1 className="text-6xl font-bold tracking-tight leading-none mb-6">Controle suas contas, <br/><span className="text-indigo-200">mantenha sua paz.</span></h1>
          <p className="text-indigo-100 text-xl max-w-md leading-relaxed">O FinePay ajuda você a nunca mais esquecer um vencimento com um sistema inteligente de lembretes e dashboard financeiro.</p>
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <div className="bg-indigo-600 p-2.5 rounded-xl w-fit mx-auto lg:mx-0 mb-6 lg:hidden">
              <Receipt className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>
            <p className="text-slate-500 mt-2">
              {isLogin ? 'Insira suas credenciais para acessar sua carteira' : 'Comece a gerenciar suas contas hoje gratuitamente'}
            </p>
          </div>

          {error && (
             <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/50 animate-in shake duration-300">
                <AlertCircle className="shrink-0 w-5 h-5" />
                <p className="text-sm font-medium">{error}</p>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    type="text" 
                    placeholder="João Silva"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  type="email" 
                  placeholder="joao@exemplo.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? 'PROCESSANDO...' : (isLogin ? 'ENTRAR AGORA' : 'CRIAR MINHA CONTA')}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="pt-6 text-center border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline"
            >
              {isLogin ? 'Ainda não tem conta? Clique aqui' : 'Já possui conta? Faça o login'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

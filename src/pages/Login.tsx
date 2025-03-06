
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAdmin) {
      if (!email || !password) {
        toast.error('Preencha todos os campos para login como administrador');
        return;
      }
    } else {
      if (!email || !email.includes('@')) {
        toast.error('Por favor, informe um e-mail válido');
        return;
      }
    }
    
    const success = await login(email, isAdmin ? password : undefined);
    if (success) {
      navigate('/products');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Playbook de Produtos</h1>
          <p className="text-muted-foreground">Por favor, faça login para continuar</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 shadow-lg border border-border glass-card">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-2 rounded-md text-center transition-colors ${
                !isAdmin 
                  ? 'bg-primary text-white' 
                  : 'bg-muted/50 hover:bg-muted/80'
              }`}
            >
              Usuário
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-2 rounded-md text-center transition-colors ${
                isAdmin 
                  ? 'bg-primary text-white' 
                  : 'bg-muted/50 hover:bg-muted/80'
              }`}
            >
              Admin
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isAdmin ? 'Usuário' : 'E-mail'}
              </label>
              <Input
                type={isAdmin ? 'text' : 'email'}
                placeholder={isAdmin ? 'admin' : 'seu@email.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            {isAdmin && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          {!isAdmin && (
            <p className="text-xs text-center mt-4 text-muted-foreground">
              Para usuários comuns, apenas o e-mail é necessário.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

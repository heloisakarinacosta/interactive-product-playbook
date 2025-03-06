
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data - in a real app, this would come from an API
const initialLogs = [
  { id: 1, email: 'user1@example.com', ip: '192.168.1.1', accessTime: '2023-06-15T10:30:00Z', type: 'login' },
  { id: 2, email: 'user2@example.com', ip: '192.168.1.2', accessTime: '2023-06-15T11:45:00Z', type: 'login' },
  { id: 3, email: 'admin', ip: '192.168.1.3', accessTime: '2023-06-15T13:20:00Z', type: 'login' },
  { id: 4, email: 'user1@example.com', ip: '192.168.1.1', accessTime: '2023-06-16T09:15:00Z', type: 'content_edit' },
  { id: 5, email: 'admin', ip: '192.168.1.3', accessTime: '2023-06-16T14:50:00Z', type: 'content_edit' },
  { id: 6, email: 'user3@example.com', ip: '192.168.1.4', accessTime: '2023-06-17T08:30:00Z', type: 'login' },
  { id: 7, email: 'admin', ip: '192.168.1.3', accessTime: '2023-06-17T10:10:00Z', type: 'content_edit' },
  { id: 8, email: 'user2@example.com', ip: '192.168.1.2', accessTime: '2023-06-17T16:25:00Z', type: 'login' },
];

type LogType = 'login' | 'content_edit';

const AdminLogs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState(initialLogs);
  const [filteredLogs, setFilteredLogs] = useState(initialLogs);
  const [search, setSearch] = useState('');
  const [logType, setLogType] = useState<string>('all');

  // Redirect non-admin users
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Filter logs based on search and type
  useEffect(() => {
    let filtered = logs;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        log => 
          log.email.toLowerCase().includes(searchLower) || 
          log.ip.includes(search)
      );
    }
    
    if (logType !== 'all') {
      filtered = filtered.filter(log => log.type === logType);
    }
    
    setFilteredLogs(filtered);
  }, [search, logType, logs]);

  if (!user?.isAdmin) {
    return null; // Don't render anything while redirecting
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-16">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Logs do Sistema</h1>
        
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar por usuário ou IP"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          
          <Select value={logType} onValueChange={setLogType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo de Log" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="content_edit">Edição de Conteúdo</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setSearch('');
              setLogType('all');
            }}
          >
            Limpar Filtros
          </Button>
        </div>
        
        {/* Logs table */}
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Usuário</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">IP</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Data/Hora</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">{log.id}</td>
                    <td className="px-4 py-3 text-sm">{log.email}</td>
                    <td className="px-4 py-3 text-sm">{log.ip}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(log.accessTime)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span 
                        className={`inline-block px-2 py-1 rounded-full text-xs 
                          ${log.type === 'login' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}
                      >
                        {log.type === 'login' ? 'Login' : 'Edição de Conteúdo'}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum log encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;

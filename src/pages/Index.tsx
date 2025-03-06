
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to products page
    navigate('/products');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Playbook de Produtos</h1>
        <p className="text-xl text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
};

export default Index;

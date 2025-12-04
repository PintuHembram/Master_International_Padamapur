import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_ENDPOINTS } from "@/config/api";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminLogin(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try{
      const res = await fetch(API_ENDPOINTS.adminLogin, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if(!res.ok){
        const err = await res.json().catch(()=>({} as any));
        toast.error(err.error || 'Login failed');
        setLoading(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem('adminToken', data.token);
      toast.success('Logged in');
      navigate('/admin/applications');
    }catch(err){
      console.error(err);
      toast.error('Network error during login');
    }finally{ setLoading(false); }
  };

  return (
    <Layout>
      <Helmet><title>Admin Login</title></Helmet>
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <form onSubmit={handleSubmit} className="bg-card rounded p-6 border border-border/50 space-y-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input id="username" placeholder="admin" value={username} onChange={(e)=>setUsername((e.target as HTMLInputElement).value)} className="mt-2" />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" type="password" placeholder="••••••" value={password} onChange={(e)=>setPassword((e.target as HTMLInputElement).value)} className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
              <Button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
              <Button variant="outline" onClick={()=>{ setUsername(''); setPassword(''); }}>Clear</Button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}

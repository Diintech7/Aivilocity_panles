import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, Shield, Users, LayoutDashboard, CheckCircle, ChevronDown, UserCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userRole', data.data.role);
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center items-center p-8 relative order-2">
        {/* Language selector removed as requested */}

        <div className="w-full max-w-sm mt-10 lg:mt-0">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff5a1f] to-orange-400 tracking-tight">
                Ailocity
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Login to your account</h2>
            <p className="text-gray-500">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  placeholder="Enter your email" 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  id="password"
                  name="password"
                  placeholder="Enter your password" 
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <Eye size={20} />
                </button>
              </div>
            </div>



            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-[#ff5a1f] hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Logging in...' : (
                <>
                  Login <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Social login removed as requested */}
        </div>
      </div>

      {/* Right Side - Dark Panel with Rocket Image */}
      <div className="w-full lg:w-[55%] bg-[#111111] text-white flex-col justify-center items-center px-12 relative overflow-hidden hidden lg:flex order-1">
        {/* Decorative Lines */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #f97316 0%, transparent 60%)' }}></div>
        
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
          
          {/* Rocket Image */}
          <div className="relative w-80 h-80 mb-8 flex justify-center items-center">
            {/* Soft glow behind rocket */}
            <div className="absolute inset-0 bg-orange-500 opacity-20 blur-3xl rounded-full"></div>
            <img 
              src="/rocket.png" 
              alt="Rocket" 
              className="w-full h-full object-contain relative z-10 animate-bounce"
              style={{ animationDuration: '3s' }}
            />
          </div>

          <h2 className="text-4xl font-bold mb-4">Launch Your Business</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Manage your campaigns, employees, and clients from one powerful, unified dashboard.
          </p>

          <div className="flex items-center gap-2 text-gray-400 text-sm">
             <Shield size={16} className="text-orange-500" /> Secure. Reliable. Powerful. 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

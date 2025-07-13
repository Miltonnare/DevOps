import { useState } from 'react';

function Login({ socket, onLogin }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !password.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isRegistering ? '/api/users/register' : '/api/users/login';
      const response = await fetch(`${import.meta.env.VITE_SOCKET_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onLogin(userName);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  socket.on("disconnect", (reason) => {
    console.log("User disconnected", socket.id, "Reason:", reason);
  });

  return (
    <div className="w-full max-w-md">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm text-center">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={!userName.trim() || !password.trim() || loading}
        >
          {loading ? 'Loading...' : (isRegistering ? 'Register' : 'Login')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}

export default Login;

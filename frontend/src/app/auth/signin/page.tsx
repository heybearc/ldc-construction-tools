// Server-side only signin page - no hydration issues possible
export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to LDC Construction Tools
          </h2>
          <p className="text-gray-600">
            Region 01.12
          </p>
        </div>
        
        <form action="/api/auth" method="POST" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="admin@ldc-construction.local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              defaultValue="password123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </form>
        
        <script dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('form').addEventListener('submit', async function(e) {
              e.preventDefault();
              const button = this.querySelector('button');
              const originalText = button.textContent;
              button.textContent = 'Signing in...';
              button.disabled = true;
              
              try {
                const formData = new FormData(this);
                const response = await fetch('/api/auth', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password')
                  })
                });
                
                const data = await response.json();
                if (response.ok) {
                  const params = new URLSearchParams(window.location.search);
                  window.location.href = params.get('callbackUrl') || '/';
                } else {
                  alert(data.error || 'Login failed');
                }
              } catch (error) {
                alert('Network error. Please try again.');
              } finally {
                button.textContent = originalText;
                button.disabled = false;
              }
            });
          `
        }} />
      </div>
    </div>
  );
}

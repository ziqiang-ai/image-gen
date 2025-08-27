export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-300 mb-4">Sorry, we couldn't complete your authentication. Please try again.</p>
        <a href="/auth/login" className="text-purple-400 hover:text-purple-300 underline">
          Return to Login
        </a>
      </div>
    </div>
  )
}

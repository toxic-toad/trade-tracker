export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-gray-400 mb-6">
          The page you are looking for doesn't exist.
        </p>

        <a
          href="/"
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  );
}
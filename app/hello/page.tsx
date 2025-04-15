export default function HelloPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Hello World!</h1>
      <p className="mt-4">
        This is a simple test page to verify routing is working.
      </p>
      <div className="mt-8">
        <a href="/api-test" className="text-blue-500 underline">
          Go to API test page
        </a>
      </div>
    </div>
  )
} 
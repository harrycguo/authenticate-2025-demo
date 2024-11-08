"use client";

const GlobalError = ({ error, reset }: { error: Error; reset: () => void }) => (
  <div className="flex min-h-screen items-center justify-center flex-col gap-4">
    <h2 className="text-xl">Something went wrong!</h2>
    <p className="text-gray-600">{error.message}</p>
    <button
      onClick={reset}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Try again
    </button>
  </div>
);

export default GlobalError;

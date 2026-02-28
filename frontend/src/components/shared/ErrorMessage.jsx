const ErrorMessage = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
    <p className="text-sm text-red-500">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-sm text-primary-600 underline hover:text-primary-700"
      >
        Try again
      </button>
    )}
  </div>
);

export default ErrorMessage;

export function ErrorState({ message }: { message: string }) {
  return (
    <p className="py-16 text-center text-sm text-red-600 dark:text-red-400">
      Something went wrong: {message}
    </p>
  );
}

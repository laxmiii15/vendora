export function ErrorState({ message }: { message: string }) {
  return (
    <p className="py-16 text-center text-sm text-danger">
      Something went wrong: {message}
    </p>
  );
}

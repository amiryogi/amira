import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-7xl font-bold text-brand-200">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-warm-800">Page Not Found</h2>
        <p className="mt-2 text-warm-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}

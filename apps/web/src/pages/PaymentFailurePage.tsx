import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function PaymentFailurePage() {
  const [searchParams] = useSearchParams();
  // eSewa may include a message or transaction_uuid in the redirect
  const transactionUuid = searchParams.get('transaction_uuid');

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
          ✕
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-warm-800">
          Payment Failed
        </h1>
        <p className="mt-3 text-warm-500">
          Your eSewa payment could not be completed. Please try again or choose a different payment
          method.
        </p>
        {transactionUuid && (
          <p className="mt-2 text-sm text-warm-400">
            Transaction: <span className="font-mono">{transactionUuid}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/cart">
            <Button>Back to Cart</Button>
          </Link>
          <Link to="/orders">
            <Button variant="outline">View Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

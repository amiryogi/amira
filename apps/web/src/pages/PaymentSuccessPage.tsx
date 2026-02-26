import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/payment.service';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setStatus('error');
      setErrorMsg('No payment data received from eSewa.');
      return;
    }

    paymentService
      .verifyEsewa(data)
      .then((response) => {
        setOrderId(response.data.data?.orderId ?? null);
        setStatus('success');
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message || 'Payment verification failed. Please contact support.';
        setErrorMsg(message);
        setStatus('error');
      });
  }, [searchParams]);

  if (status === 'verifying') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <Skeleton className="mx-auto h-20 w-20 rounded-full" />
          <Skeleton className="mx-auto mt-6 h-8 w-64" />
          <Skeleton className="mx-auto mt-3 h-5 w-80" />
          <p className="mt-6 text-warm-500">Verifying your eSewa payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
            ✕
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold text-warm-800">
            Payment Verification Failed
          </h1>
          <p className="mt-3 text-warm-500">{errorMsg}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/orders">
              <Button variant="outline">View Orders</Button>
            </Link>
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✓
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-warm-800">
          Payment Successful!
        </h1>
        <p className="mt-3 text-warm-500">
          Your eSewa payment has been verified. Thank you for your purchase!
        </p>
        {orderId && (
          <p className="mt-2 text-sm text-warm-400">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {orderId && (
            <Link to={`/orders/${orderId}`}>
              <Button variant="outline">View Order</Button>
            </Link>
          )}
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

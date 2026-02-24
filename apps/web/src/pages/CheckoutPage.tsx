import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart.store';
import { useAddresses } from '../hooks/useAddresses';
import { useCreateOrder } from '../hooks/useOrders';
import { PaymentMethod } from '@amira/shared';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { data: addressesData, isLoading: addressesLoading } = useAddresses();
  const createOrderMutation = useCreateOrder();

  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);

  const addresses = addressesData?.data || [];

  // Auto-select default address
  if (!selectedAddress && addresses.length > 0) {
    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
    if (defaultAddr) setSelectedAddress(defaultAddr._id);
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress) return;

    createOrderMutation.mutate(
      {
        shippingAddress: selectedAddress,
        paymentMethod,
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: (data) => {
          clearCart();
          if (paymentMethod === PaymentMethod.ESEWA && data?.data?.esewaPaymentUrl) {
            window.location.href = data.data.esewaPaymentUrl;
          } else {
            navigate('/order-success', { state: { orderId: data?.data?._id } });
          }
        },
        onError: () => {
          navigate('/order-failed');
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-warm-800">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Shipping Address */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-warm-800">
              Shipping Address
            </h2>
            {addressesLoading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="mt-4">
                <p className="text-warm-500">No addresses found.</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => navigate('/profile/addresses')}
                >
                  Add Address
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      selectedAddress === addr._id
                        ? 'border-brand-700 bg-brand-50'
                        : 'border-warm-200 hover:border-warm-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr._id}
                      checked={selectedAddress === addr._id}
                      onChange={() => setSelectedAddress(addr._id)}
                      className="mt-1 shrink-0 accent-brand-700"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-warm-800">{addr.label}</p>
                      <p className="text-sm text-warm-500">
                        {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-sm text-warm-500">{addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-warm-800">Payment Method</h2>
            <div className="mt-4 space-y-3">
              <label
                className={`flex cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  paymentMethod === PaymentMethod.COD
                    ? 'border-brand-700 bg-brand-50'
                    : 'border-warm-200 hover:border-warm-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === PaymentMethod.COD}
                  onChange={() => setPaymentMethod(PaymentMethod.COD)}
                  className="mt-0.5 shrink-0 accent-brand-700"
                />
                <div className="ml-3">
                  <p className="font-medium text-warm-800">Cash on Delivery</p>
                  <p className="text-sm text-warm-500">Pay when your order arrives</p>
                </div>
              </label>
              <label
                className={`flex cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  paymentMethod === PaymentMethod.ESEWA
                    ? 'border-brand-700 bg-brand-50'
                    : 'border-warm-200 hover:border-warm-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === PaymentMethod.ESEWA}
                  onChange={() => setPaymentMethod(PaymentMethod.ESEWA)}
                  className="mt-0.5 shrink-0 accent-brand-700"
                />
                <div className="ml-3">
                  <p className="font-medium text-warm-800">eSewa</p>
                  <p className="text-sm text-warm-500">Pay securely via eSewa digital wallet</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-warm-800">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-warm-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-warm-800">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="border-t border-warm-100 pt-3">
              <div className="flex justify-between text-warm-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>
            <div className="border-t border-warm-100 pt-3">
              <div className="flex justify-between text-lg font-semibold text-warm-800">
                <span>Total</span>
                <span>Rs. {getTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={handlePlaceOrder}
            isLoading={createOrderMutation.isPending}
            disabled={!selectedAddress}
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}

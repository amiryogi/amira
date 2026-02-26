import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart.store';
import { useAddresses } from '../hooks/useAddresses';
import { useCreateOrder } from '../hooks/useOrders';
import { PaymentMethod } from '@amira/shared';
import type { IAddress } from '@amira/shared';
import { paymentService } from '../services/payment.service';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { data: addressesData, isLoading: addressesLoading } = useAddresses();
  const createOrderMutation = useCreateOrder();

  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);

  // useAddresses returns unwrapped IAddress[]
  const addresses = (addressesData || []) as IAddress[];

  // Auto-select default address via useEffect (not during render)
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr) setSelectedAddress(defaultAddr._id);
    }
  }, [addresses, selectedAddress]);

  // Redirect to cart if empty — must be in useEffect to avoid setState-during-render warning
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress) return;

    const selectedAddr = addresses.find((a) => a._id === selectedAddress);
    if (!selectedAddr) return;

    createOrderMutation.mutate(
      {
        products: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          label: selectedAddr.label,
          fullName: selectedAddr.fullName,
          phone: selectedAddr.phone,
          street: selectedAddr.street,
          city: selectedAddr.city,
          district: selectedAddr.district,
          province: selectedAddr.province,
          postalCode: selectedAddr.postalCode,
        },
        paymentMethod,
      },
      {
        onSuccess: (response) => {
          const orderId = response?.data?.data?._id;
          if (paymentMethod === PaymentMethod.ESEWA && orderId) {
            // Initiate eSewa payment via payment service
            paymentService.createEsewa(orderId).then(({ data: esewaResp }) => {
              const esewaData = esewaResp.data;
              if (esewaData) {
                // Build an eSewa form and submit it
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
                const fields = {
                  amount: String(esewaData.amount),
                  tax_amount: String(esewaData.taxAmount),
                  total_amount: String(esewaData.totalAmount),
                  transaction_uuid: esewaData.transactionUuid,
                  product_code: esewaData.productCode,
                  product_service_charge: String(esewaData.productServiceCharge),
                  product_delivery_charge: String(esewaData.productDeliveryCharge),
                  success_url: esewaData.successUrl,
                  failure_url: esewaData.failureUrl,
                  signed_field_names: esewaData.signedFieldNames,
                  signature: esewaData.signature,
                };
                Object.entries(fields).forEach(([key, value]) => {
                  const input = document.createElement('input');
                  input.type = 'hidden';
                  input.name = key;
                  input.value = value;
                  form.appendChild(input);
                });
                document.body.appendChild(form);
                form.submit();
              }
            }).catch(() => {
              toast.error('Failed to initiate eSewa payment');
            });
            clearCart();
          } else {
            clearCart();
            navigate('/order-success', { state: { orderId } });
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
                      <p className="text-sm text-warm-500">{addr.fullName}</p>
                      <p className="text-sm text-warm-500">
                        {addr.street}, {addr.city}, {addr.district}, {addr.province} {addr.postalCode}
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

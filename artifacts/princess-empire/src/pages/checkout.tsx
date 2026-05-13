import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useCreateOrder } from "@workspace/api-client-react";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";

const schema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter your full delivery address"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { items, total, clearCart } = useCart();
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const createOrder = useCreateOrder();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { customerName: "", customerEmail: "", customerPhone: "", address: "", notes: "" },
  });

  const shipping = total >= 15000 ? 0 : 2500;
  const orderTotal = total + shipping;

  const onSubmit = (data: FormData) => {
    if (items.length === 0) return;
    createOrder.mutate(
      {
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          address: data.address,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size ?? undefined,
            color: item.color ?? undefined,
          })),
          notes: data.notes || null,
        },
      },
      {
        onSuccess: (order) => {
          setOrderId(order.id);
          clearCart();
          setSuccess(true);
        },
      }
    );
  };

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <Link href="/shop"><Button className="mt-4">Start Shopping</Button></Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center py-16 max-w-md mx-auto px-4">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Order Placed!</h2>
          <p className="text-muted-foreground mb-2">Thank you for shopping with Princess Empire.</p>
          {orderId && <p className="text-sm text-muted-foreground mb-6">Order #{orderId} confirmed.</p>}
          <p className="text-sm text-foreground/70 mb-8">You'll receive a confirmation shortly. We'll reach out via WhatsApp with delivery updates.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/"><Button variant="outline" className="rounded-full">Back to Home</Button></Link>
            <Link href="/shop"><Button className="rounded-full">Continue Shopping</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-semibold text-foreground mb-4">Delivery Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="Jane Doe" {...field} data-testid="input-name" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input placeholder="+234 801 234 5678" {...field} data-testid="input-phone" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input type="email" placeholder="jane@example.com" {...field} data-testid="input-email" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="House number, street name, area, city, state"
                              rows={3}
                              {...field}
                              data-testid="input-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Order Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any special instructions for delivery..." rows={2} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-semibold text-foreground mb-2">Payment</h2>
                  <p className="text-sm text-muted-foreground">
                    We accept bank transfer and payment on delivery. After placing your order, our team will contact you via WhatsApp to confirm payment details.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base rounded-xl gap-2"
                  disabled={createOrder.isPending}
                  data-testid="button-place-order"
                >
                  {createOrder.isPending ? "Placing Order..." : `Place Order — ₦${orderTotal.toLocaleString()}`}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
              <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg bg-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-muted-foreground">{[item.size, item.color].filter(Boolean).join(" · ")}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  {shipping === 0 ? <span className="text-green-600">Free</span> : <span>₦{shipping.toLocaleString()}</span>}
                </div>
                <div className="flex justify-between font-bold text-lg pt-1 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">₦{orderTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

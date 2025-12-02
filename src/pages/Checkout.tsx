import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, QrCode } from "lucide-react";

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    zip: "",
    phone: "",
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentFile) {
      toast({
        title: "Payment screenshot required",
        description: "Please upload your payment screenshot before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload payment screenshot
      const fileExt = paymentFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-screenshots")
        .upload(fileName, paymentFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("payment-screenshots")
        .getPublicUrl(fileName);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_zip: formData.zip,
          shipping_phone: formData.phone,
          total_amount: totalPrice,
          payment_screenshot_url: publicUrl,
          status: "payment_uploaded",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Your order is pending payment verification.",
      });
      navigate("/orders");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-display text-3xl font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl bg-card p-6 shadow-soft">
                <h2 className="mb-4 font-display text-xl font-bold">Shipping Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-card p-6 shadow-soft">
                <h2 className="mb-4 font-display text-xl font-bold">Payment</h2>
                <div className="mb-6 rounded-lg bg-muted p-4">
                  <div className="flex items-start gap-3">
                    <QrCode className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-body text-sm font-medium">Scan QR Code to Pay</p>
                      <p className="mt-1 font-body text-xs text-muted-foreground">
                        Please scan the QR code below and complete payment. Upload the payment screenshot after completion.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center rounded-lg bg-background p-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=example@upi&pn=COZY%20DECORS&am=${totalPrice}`}
                      alt="Payment QR Code"
                      className="h-48 w-48"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="payment">Upload Payment Screenshot (PDF/Image)</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="payment"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/50 px-6 py-8 transition-colors hover:bg-muted"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="font-body text-sm text-muted-foreground">
                        {paymentFile ? paymentFile.name : "Click to upload"}
                      </span>
                    </label>
                    <input
                      id="payment"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Placing order..." : "Place Order"}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl bg-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-xl font-bold">Order Summary</h2>
              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-body text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-body text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between font-display text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;

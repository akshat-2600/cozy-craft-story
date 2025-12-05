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
import { z } from "zod";

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

// Input validation schema
const checkoutSchema = z.object({
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address too long"),
  city: z.string().trim().min(2, "City must be at least 2 characters").max(100, "City name too long"),
  zip: z.string().regex(/^[0-9]{6}$/, "Please enter a valid 6-digit PIN code"),
  phone: z.string().regex(/^[6-9][0-9]{9}$/, "Please enter a valid 10-digit phone number"),
});

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const validateForm = () => {
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentFile) {
      toast({
        title: "Payment screenshot required",
        description: "Please upload your payment screenshot before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(paymentFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPG, PNG).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (paymentFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload payment screenshot - store in user-specific folder for RLS
      const fileExt = paymentFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-screenshots")
        .upload(fileName, paymentFile);

      if (uploadError) throw uploadError;

      // Store path reference (not public URL since bucket is now private)
      const screenshotPath = fileName;

      // Create order with validated data
      const validatedData = checkoutSchema.parse(formData);
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          shipping_address: validatedData.address,
          shipping_city: validatedData.city,
          shipping_zip: validatedData.zip,
          shipping_phone: validatedData.phone,
          total_amount: totalPrice,
          payment_screenshot_url: screenshotPath,
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
                      className={errors.address ? "border-destructive" : ""}
                      required
                    />
                    {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={errors.city ? "border-destructive" : ""}
                      required
                    />
                    {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="zip">PIN Code</Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className={errors.zip ? "border-destructive" : ""}
                      placeholder="6-digit PIN"
                      maxLength={6}
                      required
                    />
                    {errors.zip && <p className="mt-1 text-xs text-destructive">{errors.zip}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={errors.phone ? "border-destructive" : ""}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                    />
                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
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
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=example@upi&pn=COZY DECORS&am=${totalPrice}`)}`}
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
                        {paymentFile ? paymentFile.name : "Click to upload (max 5MB)"}
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
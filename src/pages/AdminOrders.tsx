import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  ExternalLink,
  CheckCircle,
  XCircle,
  Eye,
  Truck,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import { PaymentScreenshotPreview } from "@/components/admin/PaymentScreenshotPreview";

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending_payment: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    payment_uploaded: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    payment_verified: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    shipped: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    status: "",
    description: "",
    location: "",
    carrier: "",
    tracking_number: "",
  });

  const activeTab = searchParams.get("tab") || "all";

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        toast({ title: "Error loading orders", description: ordersError.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set(ordersData.map((o) => o.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      // Map profiles to orders
      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
      const ordersWithProfiles = ordersData.map((order) => ({
        ...order,
        profiles: profilesMap.get(order.user_id) || null,
      }));

      setOrders(ordersWithProfiles);
    } catch (err) {
      console.error("Error:", err);
      toast({ title: "Error loading orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (orders: any[]) => {
    let filtered = orders;

    // Filter by tab
    switch (activeTab) {
      case "pending":
        filtered = filtered.filter((o) =>
          ["payment_uploaded", "payment_verified"].includes(o.status)
        );
        break;
      case "approved":
        filtered = filtered.filter((o) =>
          ["approved", "processing", "shipped"].includes(o.status)
        );
        break;
      case "rejected":
        filtered = filtered.filter((o) => o.status === "rejected");
        break;
      case "completed":
        filtered = filtered.filter((o) => o.status === "delivered");
        break;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.profiles?.full_name?.toLowerCase().includes(query) ||
          o.profiles?.email?.toLowerCase().includes(query) ||
          o.shipping_phone?.includes(query)
      );
    }

    return filtered;
  };

  const verifyPayment = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "payment_verified",
        payment_verified_by: user!.id,
        payment_verified_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Payment verified successfully" });
    fetchOrders();
  };

  const approveOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "approved" })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await supabase.from("order_tracking").insert({
      order_id: orderId,
      status: "Order Approved",
      description: "Your order has been approved and will be processed soon.",
      updated_by: user!.id,
    });

    toast({ title: "Order approved successfully" });
    fetchOrders();
  };

  const rejectOrder = async (orderId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "rejected", rejection_reason: reason })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Order rejected" });
    fetchOrders();
  };

  const updateTracking = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("order_tracking").insert({
      order_id: selectedOrder.id,
      ...trackingForm,
      updated_by: user!.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Update order status
    let newStatus = selectedOrder.status;
    if (trackingForm.status === "Processing") newStatus = "processing";
    else if (trackingForm.status === "Shipped") newStatus = "shipped";
    else if (trackingForm.status === "Delivered") newStatus = "delivered";

    if (newStatus !== selectedOrder.status) {
      await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", selectedOrder.id);
    }

    toast({ title: "Tracking updated successfully" });
    setTrackingDialogOpen(false);
    setTrackingForm({
      status: "",
      description: "",
      location: "",
      carrier: "",
      tracking_number: "",
    });
    fetchOrders();
  };

  const filteredOrders = filterOrders(orders);

  const OrderCard = ({ order }: { order: any }) => (
    <div className="rounded-xl bg-card p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-sm font-medium">
            Order #{order.id.slice(0, 8)}
          </p>
          <p className="font-body text-xs text-muted-foreground">
            {format(new Date(order.created_at), "PPp")}
          </p>
          <p className="mt-1 font-body text-sm">
            <span className="text-muted-foreground">Customer:</span>{" "}
            {order.profiles?.full_name || order.profiles?.email || "N/A"}
          </p>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {order.status.replace(/_/g, " ").toUpperCase()}
        </Badge>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <p className="mb-2 font-body text-xs font-medium text-muted-foreground">
          ORDER ITEMS
        </p>
        <div className="space-y-2">
          {order.order_items.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
            >
              <span className="font-body text-sm">{item.product_name}</span>
              <span className="font-body text-sm text-muted-foreground">
                {item.quantity} × ₹{item.product_price.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Total */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="font-body text-xs text-muted-foreground">SHIPPING</p>
          <p className="font-body text-sm">
            {order.shipping_address}, {order.shipping_city} - {order.shipping_zip}
          </p>
          <p className="font-body text-sm">📞 {order.shipping_phone}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="font-body text-xs text-muted-foreground">TOTAL</p>
          <p className="font-display text-xl font-bold">
            ₹{order.total_amount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Payment Screenshot */}
      {order.payment_screenshot_url && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedOrder(order);
              setPreviewDialogOpen(true);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Payment Screenshot
          </Button>
        </div>
      )}

      {/* Rejection Reason */}
      {order.rejection_reason && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="font-body text-xs text-red-600 dark:text-red-400">
            REJECTION REASON
          </p>
          <p className="font-body text-sm text-red-800 dark:text-red-300">
            {order.rejection_reason}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {order.status === "payment_uploaded" && (
          <>
            <Button size="sm" onClick={() => verifyPayment(order.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify Payment
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => rejectOrder(order.id)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </>
        )}
        {order.status === "payment_verified" && (
          <>
            <Button size="sm" onClick={() => approveOrder(order.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Order
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => rejectOrder(order.id)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </>
        )}
        {["approved", "processing", "shipped"].includes(order.status) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedOrder(order);
              setTrackingDialogOpen(true);
            }}
          >
            <Truck className="mr-2 h-4 w-4" />
            Update Tracking
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout title="Manage Orders">
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setSearchParams({ tab: value })}
        className="w-full"
      >
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({orders.filter(o => ["payment_uploaded", "payment_verified"].includes(o.status)).length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({orders.filter(o => ["approved", "processing", "shipped"].includes(o.status)).length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({orders.filter(o => o.status === "rejected").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({orders.filter(o => o.status === "delivered").length})
          </TabsTrigger>
        </TabsList>

        {["all", "pending", "approved", "rejected", "completed"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center rounded-xl bg-card p-8 shadow-soft">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-xl bg-card p-8 text-center shadow-soft">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-body text-muted-foreground">No orders found in this category</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Tracking</DialogTitle>
          </DialogHeader>
          <form onSubmit={updateTracking} className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select
                value={trackingForm.status}
                onValueChange={(value) =>
                  setTrackingForm({ ...trackingForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={trackingForm.description}
                onChange={(e) =>
                  setTrackingForm({ ...trackingForm, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={trackingForm.location}
                onChange={(e) =>
                  setTrackingForm({ ...trackingForm, location: e.target.value })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Carrier</Label>
                <Input
                  value={trackingForm.carrier}
                  onChange={(e) =>
                    setTrackingForm({ ...trackingForm, carrier: e.target.value })
                  }
                  placeholder="e.g., FedEx, DHL"
                />
              </div>
              <div>
                <Label>Tracking Number</Label>
                <Input
                  value={trackingForm.tracking_number}
                  onChange={(e) =>
                    setTrackingForm({
                      ...trackingForm,
                      tracking_number: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Update Tracking
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <PaymentScreenshotPreview
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        screenshotPath={selectedOrder?.payment_screenshot_url}
      />
    </AdminLayout>
  );
};

export default AdminOrders;

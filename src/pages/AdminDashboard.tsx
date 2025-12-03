import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingVerification: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [ordersRes, productsRes, revenueRes] = await Promise.all([
      supabase.from("orders").select("id, status", { count: "exact" }),
      supabase.from("products").select("id", { count: "exact" }),
      supabase
        .from("orders")
        .select("total_amount")
        .in("status", ["delivered", "shipped", "approved", "processing"]),
    ]);

    const orders = ordersRes.data || [];
    const pendingVerification = orders.filter(
      (o) => o.status === "payment_uploaded"
    ).length;
    const approvedOrders = orders.filter((o) =>
      ["approved", "processing", "shipped"].includes(o.status)
    ).length;
    const rejectedOrders = orders.filter((o) => o.status === "rejected").length;
    const completedOrders = orders.filter((o) => o.status === "delivered").length;
    const revenue =
      revenueRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

    setStats({
      totalOrders: ordersRes.count || 0,
      pendingVerification,
      approvedOrders,
      rejectedOrders,
      completedOrders,
      totalProducts: productsRes.count || 0,
      totalRevenue: revenue,
    });
  };

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Verification",
      value: stats.pendingVerification,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      onClick: () => navigate("/admin/orders?tab=pending"),
    },
    {
      label: "Approved Orders",
      value: stats.approvedOrders,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
      onClick: () => navigate("/admin/orders?tab=approved"),
    },
    {
      label: "Rejected Orders",
      value: stats.rejectedOrders,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      onClick: () => navigate("/admin/orders?tab=rejected"),
    },
    {
      label: "Completed Orders",
      value: stats.completedOrders,
      icon: Truck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      onClick: () => navigate("/admin/orders?tab=completed"),
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: "text-accent",
      bg: "bg-accent/10",
      onClick: () => navigate("/admin/products"),
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-600/10",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={card.onClick}
            className={`rounded-xl bg-card p-5 shadow-soft transition-all ${
              card.onClick ? "cursor-pointer hover:shadow-hover" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-sm text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-1 font-display text-2xl font-bold">{card.value}</p>
              </div>
              <div className={`rounded-full p-3 ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate("/admin/orders?tab=pending")}
            className="flex items-center gap-4 rounded-xl bg-card p-5 text-left shadow-soft transition-all hover:shadow-hover"
          >
            <div className="rounded-full bg-amber-500/10 p-3">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Verify Payments</h3>
              <p className="font-body text-sm text-muted-foreground">
                {stats.pendingVerification} orders waiting
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-4 rounded-xl bg-card p-5 text-left shadow-soft transition-all hover:shadow-hover"
          >
            <div className="rounded-full bg-primary/10 p-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Manage Orders</h3>
              <p className="font-body text-sm text-muted-foreground">
                View and update all orders
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-4 rounded-xl bg-card p-5 text-left shadow-soft transition-all hover:shadow-hover"
          >
            <div className="rounded-full bg-accent/10 p-3">
              <ShoppingBag className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Manage Products</h3>
              <p className="font-body text-sm text-muted-foreground">
                Add, edit, or remove products
              </p>
            </div>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  LogOut,
  Settings,
  FileText,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchStats();
  }, [user, isAdmin]);

  const fetchStats = async () => {
    const [ordersRes, productsRes, revenueRes] = await Promise.all([
      supabase.from("orders").select("id, status", { count: "exact" }),
      supabase.from("products").select("id", { count: "exact" }),
      supabase
        .from("orders")
        .select("total_amount")
        .in("status", ["delivered", "shipped"]),
    ]);

    const pendingCount =
      ordersRes.data?.filter((o) => o.status === "payment_uploaded").length || 0;
    const revenue =
      revenueRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

    setStats({
      totalOrders: ordersRes.count || 0,
      pendingOrders: pendingCount,
      totalProducts: productsRes.count || 0,
      totalRevenue: revenue,
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-sm text-muted-foreground">Total Orders</p>
                <p className="mt-1 font-display text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <Package className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-sm text-muted-foreground">Pending Orders</p>
                <p className="mt-1 font-display text-3xl font-bold">{stats.pendingOrders}</p>
              </div>
              <FileText className="h-10 w-10 text-amber-500" />
            </div>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-sm text-muted-foreground">Total Products</p>
                <p className="mt-1 font-display text-3xl font-bold">{stats.totalProducts}</p>
              </div>
              <ShoppingBag className="h-10 w-10 text-accent" />
            </div>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-sm text-muted-foreground">Total Revenue</p>
                <p className="mt-1 font-display text-3xl font-bold">
                  ₹{stats.totalRevenue.toLocaleString("en-IN")}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={() => navigate("/admin/products")}
            className="rounded-xl bg-card p-8 text-left shadow-soft transition-all hover:shadow-hover"
          >
            <ShoppingBag className="mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-2 font-display text-2xl font-bold">Manage Products</h2>
            <p className="font-body text-muted-foreground">
              Add, edit, or remove products from your catalog
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/orders")}
            className="rounded-xl bg-card p-8 text-left shadow-soft transition-all hover:shadow-hover"
          >
            <Package className="mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-2 font-display text-2xl font-bold">Manage Orders</h2>
            <p className="font-body text-muted-foreground">
              Verify payments, approve orders, and update tracking
            </p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

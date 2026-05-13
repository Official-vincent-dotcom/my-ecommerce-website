import { Link } from "wouter";
import { Package, ShoppingCart, TrendingUp, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { AdminLayout, requireAdmin } from "./layout";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });

  const statCards = stats ? [
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-blue-500" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-green-500" },
    { label: "Revenue", value: `₦${Math.round(stats.totalRevenue).toLocaleString()}`, icon: TrendingUp, color: "bg-primary" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "bg-yellow-500" },
  ] : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground font-serif">Dashboard Overview</h2>
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            + Add Product
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
            : statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-5">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Chart */}
          {stats && stats.topCategories.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Products by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.topCategories}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Low Stock */}
          {stats && (stats.lowStockProducts ?? []).length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-foreground">Low Stock Alert</h3>
              </div>
              <div className="space-y-3">
                {(stats.lowStockProducts ?? []).slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <img src={p.images[0] || `https://picsum.photos/seed/${p.id}/60/60`} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{p.name}</p>
                      <p className="text-xs text-amber-600">{p.stock} left in stock</p>
                    </div>
                    <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-primary hover:underline shrink-0">
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        {stats && stats.recentOrders.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Recent Orders</h3>
              <Link href="/admin/orders" className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Order</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Customer</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Total</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium">#{order.id}</td>
                      <td className="py-3 text-foreground/70">{order.customerName}</td>
                      <td className="py-3 font-semibold text-primary">₦{order.total.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${STATUS_COLORS[order.status] ?? "bg-muted text-foreground"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default requireAdmin(AdminDashboard);

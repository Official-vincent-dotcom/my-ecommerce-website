import { useState } from "react";
import { ShoppingCart, Eye, Search } from "lucide-react";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout, requireAdmin } from "./layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = typeof STATUSES[number];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const params = { status: statusFilter || undefined, page, limit: 15 };
  const { data, isLoading } = useListOrders(params, { query: { queryKey: getListOrdersQueryKey(params) } });
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (orderId: number, status: string) => {
    updateStatus.mutate({ id: orderId, data: { status: status as OrderStatus } }, {
      onSuccess: () => {
        toast.success(`Order #${orderId} status updated`);
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(params) });
      },
    });
  };

  const filteredOrders = (data?.orders ?? []).filter((o) =>
    !search ||
    String(o.id).includes(search) ||
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
    o.customerPhone.includes(search)
  );

  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground font-serif">Orders</h2>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} total orders</p>
          </div>
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setStatusFilter(""); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!statusFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              All
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by order ID, customer name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Order</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Total</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                    </tr>
                  ))
                  : filteredOrders.map((order) => (
                    <>
                      <tr
                        key={order.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                        data-testid={`row-order-${order.id}`}
                      >
                        <td className="px-4 py-3 font-bold text-foreground">#{order.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 font-bold text-primary">₦{order.total.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className={`text-xs px-2 py-1 rounded-lg border-0 outline-none capitalize font-medium cursor-pointer ${STATUS_COLORS[order.status] ?? "bg-muted"}`}
                            data-testid={`select-status-${order.id}`}
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            data-testid={`button-expand-${order.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      {expandedOrder === order.id && (
                        <tr key={`${order.id}-detail`} className="border-b border-border bg-muted/20">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Customer Details</p>
                                <p><span className="text-muted-foreground">Email:</span> {order.customerEmail}</p>
                                <p><span className="text-muted-foreground">Phone:</span> {order.customerPhone}</p>
                                <p><span className="text-muted-foreground">Address:</span> {order.address}</p>
                                {order.notes && <p><span className="text-muted-foreground">Notes:</span> {order.notes}</p>}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items ({order.items.length})</p>
                                <div className="space-y-2">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover bg-muted shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">×{item.quantity} @ ₦{item.price.toLocaleString()}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <span className="px-3 py-1 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default requireAdmin(AdminOrders);

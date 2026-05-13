import { useState } from "react";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { useListProducts, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout, requireAdmin } from "./layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function AdminProducts() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const params = { search: search || undefined, page, limit: 15 };
  const { data, isLoading } = useListProducts(params, { query: { queryKey: getListProductsQueryKey(params) } });
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteProduct.mutate({ id }, {
      onSuccess: () => {
        toast.success("Product deleted");
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey(params) });
      },
    });
  };

  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground font-serif">Products</h2>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} total products</p>
          </div>
          <Link href="/admin/products/new">
            <Button className="gap-2 rounded-xl" data-testid="button-add-product">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
            data-testid="input-product-search"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Product</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Labels</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-3"><div className="flex gap-3 items-center"><Skeleton className="w-10 h-10 rounded-lg" /><Skeleton className="h-4 w-32" /></div></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-10" /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-8 w-20 ml-auto" /></td>
                    </tr>
                  ))
                  : (data?.products ?? []).map((p) => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors" data-testid={`row-product-${p.id}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || `https://picsum.photos/seed/${p.id}/60/60`}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0"
                          />
                          <div>
                            <p className="font-medium text-foreground line-clamp-1 max-w-[180px]">{p.name}</p>
                            {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground/70 hidden sm:table-cell">{p.categoryName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-semibold text-primary">₦{p.price.toLocaleString()}</span>
                          {p.oldPrice && <p className="text-xs text-muted-foreground line-through">₦{p.oldPrice.toLocaleString()}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`font-medium ${p.stock <= 5 ? "text-red-500" : p.stock <= 15 ? "text-amber-500" : "text-green-600"}`}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {p.featured && <Badge className="text-xs bg-foreground text-background">Featured</Badge>}
                          {p.bestSeller && <Badge className="text-xs" variant="secondary">Best Seller</Badge>}
                          {p.flashSale && <Badge className="text-xs bg-red-500 text-white">Flash</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/admin/products/${p.id}/edit`}>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg" data-testid={`button-edit-${p.id}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-lg border-destructive/30 hover:bg-destructive hover:text-white hover:border-destructive"
                            onClick={() => handleDelete(p.id, p.name)}
                            data-testid={`button-delete-${p.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!isLoading && (!data || data.products.length === 0) && (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No products found</p>
              <Link href="/admin/products/new">
                <Button size="sm" className="mt-4 rounded-xl gap-2"><Plus className="w-4 h-4" />Add First Product</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
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

export default requireAdmin(AdminProducts);

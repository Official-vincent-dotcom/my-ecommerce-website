import { useState } from "react";
import { Plus, Pencil, Trash2, FolderOpen, X, Check } from "lucide-react";
import {
  useListCategories, useCreateCategory, useDeleteCategory,
  getListCategoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout, requireAdmin } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function AdminCategories() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });

  const handleCreate = () => {
    if (!newName.trim()) { toast.error("Category name is required"); return; }
    createCategory.mutate({ data: { name: newName.trim(), image: newImage || null } }, {
      onSuccess: () => {
        toast.success("Category created");
        invalidate();
        setNewName("");
        setNewImage("");
        setShowForm(false);
      },
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will be uncategorised.`)) return;
    deleteCategory.mutate({ id }, {
      onSuccess: () => { toast.success("Category deleted"); invalidate(); },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground font-serif">Categories</h2>
            <p className="text-sm text-muted-foreground">{(categories ?? []).length} categories</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 rounded-xl" data-testid="button-new-category">
            <Plus className="w-4 h-4" /> New Category
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-card border border-primary/30 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground">New Category</h3>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name *" data-testid="input-category-name" />
            <Input value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="Image URL (optional)" />
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={createCategory.isPending} className="gap-2 rounded-xl" data-testid="button-create-category">
                <Check className="w-4 h-4" /> {createCategory.isPending ? "Creating..." : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl gap-2">
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : (categories ?? []).length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No categories yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {(categories ?? []).map((cat) => (
                <div key={cat.id} className="px-5 py-4" data-testid={`row-category-${cat.id}`}>
                  <div className="flex items-center gap-4">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-xl object-cover bg-muted shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderOpen className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{cat.name}</p>
                      {cat.slug && <p className="text-xs text-muted-foreground">/{cat.slug}</p>}
                      {cat.productCount != null && (
                        <p className="text-xs text-muted-foreground">{cat.productCount} products</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="h-8 w-8 p-0 rounded-lg border-destructive/30 hover:bg-destructive hover:text-white hover:border-destructive"
                        data-testid={`button-delete-cat-${cat.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default requireAdmin(AdminCategories);

import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Plus, X, Upload, ImagePlus, Loader2 } from "lucide-react";
import { Link } from "wouter";
import {
  useGetProduct, useCreateProduct, useUpdateProduct,
  useListCategories,
  getGetProductQueryKey, getListCategoriesQueryKey, getListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout, requireAdmin } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function ProductForm({ isEdit }: { isEdit?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const productId = isEdit ? Number(id) : undefined;
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(productId!, {
    query: { enabled: isEdit && !!productId, queryKey: getGetProductQueryKey(productId!) }
  });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    discount: "",
    stock: "",
    categoryId: "",
    brand: "",
    featured: false,
    bestSeller: false,
    flashSale: false,
    flashSaleEndsAt: "",
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
  });
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product && isEdit) {
      setForm({
        name: product.name ?? "",
        description: product.description ?? "",
        price: String(product.price ?? ""),
        oldPrice: product.oldPrice ? String(product.oldPrice) : "",
        discount: product.discount ? String(product.discount) : "",
        stock: String(product.stock ?? ""),
        categoryId: product.categoryId ? String(product.categoryId) : "",
        brand: product.brand ?? "",
        featured: product.featured ?? false,
        bestSeller: product.bestSeller ?? false,
        flashSale: product.flashSale ?? false,
        flashSaleEndsAt: product.flashSaleEndsAt ? product.flashSaleEndsAt.split("T")[0] : "",
        images: product.images ?? [],
        sizes: product.sizes ?? [],
        colors: product.colors ?? [],
      });
    }
  }, [product, isEdit]);

  const set = (key: string, val: unknown) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("image", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        if (res.ok) {
          const data = (await res.json()) as { url: string };
          uploaded.push(data.url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch {
        toast.error(`Error uploading ${file.name}`);
      }
    }
    if (uploaded.length > 0) {
      set("images", [...form.images, ...uploaded]);
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addSize = () => {
    if (newSize.trim() && !form.sizes.includes(newSize.trim())) {
      set("sizes", [...form.sizes, newSize.trim()]);
      setNewSize("");
    }
  };

  const addColor = () => {
    if (newColor.trim() && !form.colors.includes(newColor.trim())) {
      set("colors", [...form.colors, newColor.trim()]);
      setNewColor("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) {
      toast.error("Name, price, and stock are required.");
      return;
    }

    const basePayload = {
      name: form.name,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      discount: form.discount ? Number(form.discount) : null,
      stock: Number(form.stock),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      brand: form.brand || null,
      featured: form.featured,
      bestSeller: form.bestSeller,
      flashSale: form.flashSale,
      flashSaleEndsAt: form.flashSaleEndsAt ? new Date(form.flashSaleEndsAt).toISOString() : null,
      images: form.images,
      sizes: form.sizes,
      colors: form.colors,
    };

    if (isEdit && productId) {
      const updatePayload = { ...basePayload, description: form.description || null };
      updateProduct.mutate({ id: productId, data: updatePayload }, {
        onSuccess: () => {
          toast.success("Product updated");
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({}) });
          queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
          navigate("/admin/products");
        },
      });
    } else {
      const createPayload = { ...basePayload, description: form.description || undefined };
      createProduct.mutate({ data: createPayload }, {
        onSuccess: () => {
          toast.success("Product created");
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({}) });
          navigate("/admin/products");
        },
      });
    }
  };

  if (isEdit && isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4 max-w-2xl">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
        </div>
      </AdminLayout>
    );
  }

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/products">
            <button className="p-2 rounded-xl hover:bg-accent transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          </Link>
          <h2 className="text-xl font-bold text-foreground font-serif">{isEdit ? "Edit Product" : "Add New Product"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground mb-2">Basic Information</h3>
            <div>
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Luxe Gold Dress" className="mt-1" required data-testid="input-product-name" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Product description..." rows={3} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <Label>Price (₦) *</Label>
                <Input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="25000" className="mt-1" required data-testid="input-price" />
              </div>
              <div>
                <Label>Old Price (₦)</Label>
                <Input type="number" min="0" value={form.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} placeholder="35000" className="mt-1" />
              </div>
              <div>
                <Label>Discount (%)</Label>
                <Input type="number" min="0" max="100" value={form.discount} onChange={(e) => set("discount", e.target.value)} placeholder="20" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock *</Label>
                <Input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="50" className="mt-1" required data-testid="input-stock" />
              </div>
              <div>
                <Label>Brand</Label>
                <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Afrique" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="select-category"
              >
                <option value="">Select Category</option>
                {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Images */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Product Images</h3>

            {/* Drop zone */}
            <div
              className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
              onDragLeave={(e) => e.currentTarget.classList.remove("border-primary")}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); handleImageFiles(e.dataTransfer.files); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageFiles(e.target.files)}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm">Uploading images...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium">Tap to choose images</p>
                  <p className="text-xs">or drag & drop here. Supports JPG, PNG, WEBP — max 10MB each</p>
                </div>
              )}
            </div>

            {/* Preview grid */}
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-24 h-24 object-cover rounded-xl border border-border bg-muted" />
                    <button
                      type="button"
                      onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md font-medium">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sizes & Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Sizes</h3>
              <div className="flex gap-2">
                <Input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="e.g. S, M, L, XL" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())} className="text-sm" />
                <Button type="button" onClick={addSize} variant="outline" size="sm" className="rounded-xl shrink-0"><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.sizes.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-xs bg-muted">
                    {s}
                    <button type="button" onClick={() => set("sizes", form.sizes.filter((x) => x !== s))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Colors</h3>
              <div className="flex gap-2">
                <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="e.g. Black, Red" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())} className="text-sm" />
                <Button type="button" onClick={addColor} variant="outline" size="sm" className="rounded-xl shrink-0"><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.colors.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-xs bg-muted">
                    {c}
                    <button type="button" onClick={() => set("colors", form.colors.filter((x) => x !== c))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <h3 className="font-semibold text-foreground">Product Labels</h3>
            <div className="flex flex-wrap gap-6">
              {[
                { key: "featured", label: "Featured" },
                { key: "bestSeller", label: "Best Seller" },
                { key: "flashSale", label: "Flash Sale" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(form as Record<string, unknown>)[key] as boolean}
                    onChange={(e) => set(key, e.target.checked)}
                    className="accent-primary w-4 h-4"
                    data-testid={`checkbox-${key}`}
                  />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </label>
              ))}
            </div>
            {form.flashSale && (
              <div>
                <Label>Flash Sale Ends At</Label>
                <Input type="date" value={form.flashSaleEndsAt} onChange={(e) => set("flashSaleEndsAt", e.target.value)} className="mt-1 max-w-xs" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending} className="gap-2 rounded-xl px-8 py-5" data-testid="button-submit-product">
              {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Product")}
            </Button>
            <Link href="/admin/products"><Button type="button" variant="outline" className="rounded-xl">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

function NewProduct() { return <ProductForm />; }
function EditProduct() { return <ProductForm isEdit />; }

export const AdminNewProduct = requireAdmin(NewProduct);
export const AdminEditProduct = requireAdmin(EditProduct);

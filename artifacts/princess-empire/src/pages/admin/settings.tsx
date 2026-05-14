import { useState, useEffect } from "react";
import { Settings, Save, Phone, ShieldCheck } from "lucide-react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout, requireAdmin } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const updateSettings = useUpdateSettings();

  const [storeName, setStoreName] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");

  const [credCurrentPw, setCredCurrentPw] = useState("");
  const [credNewEmail, setCredNewEmail] = useState("");
  const [credNewPw, setCredNewPw] = useState("");
  const [credConfirmPw, setCredConfirmPw] = useState("");
  const [credSaving, setCredSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName ?? "Princess Empire");
      setStoreEmail(settings.storeEmail ?? "");
      setStoreAddress(settings.storeAddress ?? "");
      setWhatsappNumber(settings.whatsappNumber ?? "");
      setCurrency(settings.currency ?? "NGN");
      setHeroTitle(settings.heroTitle ?? "");
      setHeroSubtitle(settings.heroSubtitle ?? "");
    }
  }, [settings]);

  const handleCredentialsSave = async () => {
    if (!credCurrentPw) {
      toast.error("Enter your current password to make changes");
      return;
    }
    if (!credNewEmail && !credNewPw) {
      toast.error("Provide a new email or new password");
      return;
    }
    if (credNewPw && credNewPw !== credConfirmPw) {
      toast.error("New passwords do not match");
      return;
    }
    setCredSaving(true);
    try {
      const res = await fetch("/api/auth/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: credCurrentPw,
          newEmail: credNewEmail || undefined,
          newPassword: credNewPw || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Admin credentials updated successfully");
        setCredCurrentPw("");
        setCredNewEmail("");
        setCredNewPw("");
        setCredConfirmPw("");
      } else {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed to update credentials");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
    setCredSaving(false);
  };

  const handleSave = () => {
    updateSettings.mutate({
      data: {
        whatsappNumber,
        storeName: storeName || null,
        storeEmail: storeEmail || null,
        storeAddress: storeAddress || null,
        currency: currency || null,
        heroTitle: heroTitle || null,
        heroSubtitle: heroSubtitle || null,
      },
    }, {
      onSuccess: () => {
        toast.success("Settings saved successfully");
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      },
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-2xl space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground font-serif">Store Settings</h2>
          <Button onClick={handleSave} disabled={updateSettings.isPending} className="gap-2 rounded-xl" data-testid="button-save-settings">
            <Save className="w-4 h-4" /> {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Store Info */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" /> Store Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Store Name</Label>
              <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1" data-testid="input-store-name" />
            </div>
            <div>
              <Label>Store Email</Label>
              <Input type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} placeholder="hello@store.com" className="mt-1" />
            </div>
            <div>
              <Label>Currency</Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none"
              >
                <option value="NGN">NGN — Nigerian Naira (₦)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="GBP">GBP — British Pound (£)</option>
              </select>
            </div>
            <div>
              <Label>Store Address</Label>
              <Input value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} placeholder="Lagos, Nigeria" className="mt-1" />
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#25D366]" /> WhatsApp Settings
          </h3>
          <p className="text-sm text-muted-foreground">The WhatsApp floating button on your store uses this number. Include country code.</p>
          <div>
            <Label>WhatsApp Number *</Label>
            <div className="relative mt-1">
              <Input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+2348012345678"
                className="pl-10"
                data-testid="input-whatsapp-number"
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
            </div>
          </div>
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#25D366] hover:underline"
            >
              Test WhatsApp link →
            </a>
          )}
        </div>

        {/* Hero Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Homepage Hero Text</h3>
          <div>
            <Label>Hero Title</Label>
            <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="e.g. New Season" className="mt-1" />
          </div>
          <div>
            <Label>Hero Subtitle</Label>
            <Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="e.g. Arrivals" className="mt-1" />
          </div>
        </div>

        {/* Admin Credentials */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Admin Access
          </h3>
          <p className="text-sm text-muted-foreground">Change the email and password used to log into the admin panel. You must enter your current password to save changes.</p>

          <div>
            <Label>Current Password *</Label>
            <Input
              type="password"
              value={credCurrentPw}
              onChange={(e) => setCredCurrentPw(e.target.value)}
              placeholder="Your current password"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <Label>New Admin Email</Label>
              <Input
                type="email"
                value={credNewEmail}
                onChange={(e) => setCredNewEmail(e.target.value)}
                placeholder="admin@yourbusiness.com"
                className="mt-1"
              />
            </div>
            <div />
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={credNewPw}
                onChange={(e) => setCredNewPw(e.target.value)}
                placeholder="New password"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={credConfirmPw}
                onChange={(e) => setCredConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="mt-1"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCredentialsSave}
            disabled={credSaving}
            variant="outline"
            className="gap-2 rounded-xl"
          >
            <ShieldCheck className="w-4 h-4" />
            {credSaving ? "Updating..." : "Update Credentials"}
          </Button>
        </div>

        <Button onClick={handleSave} disabled={updateSettings.isPending} className="gap-2 rounded-xl w-full sm:w-auto px-8 py-5" data-testid="button-save-settings-bottom">
          <Save className="w-4 h-4" /> {updateSettings.isPending ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </AdminLayout>
  );
}

export default requireAdmin(AdminSettings);

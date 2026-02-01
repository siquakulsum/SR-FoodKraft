import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/store/settings-store';
import { Receipt, Building2, Hash, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GSTSettingsManager() {
  const { settings, updateSettings } = useSettingsStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    gstRate: settings.gstRate.toString(),
    businessName: settings.businessName,
    businessAddress: settings.businessAddress,
    gstNumber: settings.gstNumber,
    deliveryCharges: settings.deliveryCharges.toString(),
    serviceCharges: settings.serviceCharges.toString(),
  });

  const handleSave = async () => {
    // Validation
    const gstRateNum = parseFloat(formData.gstRate);
    if (isNaN(gstRateNum) || gstRateNum < 0 || gstRateNum > 100) {
      toast({
        title: "Validation Error",
        description: "GST Rate must be a number between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    if (!formData.businessName.trim()) {
      toast({
        title: "Validation Error",
        description: "Business name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings({
        gstRate: gstRateNum,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        gstNumber: formData.gstNumber,
        deliveryCharges: parseFloat(formData.deliveryCharges) || 0,
        serviceCharges: parseFloat(formData.serviceCharges) || 0,
      });
      toast({
        title: "Settings Updated",
        description: "Business and GST settings have been saved successfully.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      gstRate: settings.gstRate.toString(),
      businessName: settings.businessName,
      businessAddress: settings.businessAddress,
      gstNumber: settings.gstNumber,
      deliveryCharges: settings.deliveryCharges.toString(),
      serviceCharges: settings.serviceCharges.toString(),
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">GST & Business Settings</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Configure tax rates and business information</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto min-w-[120px]"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* GST Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-500" />
              GST Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gstRate">GST Rate (%)</Label>
              <Input
                id="gstRate"
                type="number"
                step="0.01"
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Standard GST rate for restaurants (typically 18%)
              </p>
            </div>

            <div>
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
                placeholder="29ABCDE1234F1Z5"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">GST Calculation Preview</h4>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>Subtotal (₹1,000):</span>
                  <span>₹1,000</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({formData.gstRate}%):</span>
                  <span>₹{(1000 * parseFloat(formData.gstRate || '0') / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total:</span>
                  <span>₹{(1000 + (1000 * parseFloat(formData.gstRate || '0') / 100)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-500" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="businessAddress">Business Address</Label>
              <textarea
                id="businessAddress"
                rows={3}
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Charges Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              Additional Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="deliveryCharges">Delivery Charges (₹)</Label>
              <Input
                id="deliveryCharges"
                type="number"
                step="0.01"
                value={formData.deliveryCharges}
                onChange={(e) => setFormData({ ...formData, deliveryCharges: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="serviceCharges">Service Charges (₹)</Label>
              <Input
                id="serviceCharges"
                type="number"
                step="0.01"
                value={formData.serviceCharges}
                onChange={(e) => setFormData({ ...formData, serviceCharges: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* GST Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-orange-500" />
              GST Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">Current Settings</h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span>GST Rate:</span>
                    <span className="font-medium">{settings.gstRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST Number:</span>
                    <span className="font-medium">{settings.gstNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges:</span>
                    <span className="font-medium">₹{settings.deliveryCharges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charges:</span>
                    <span className="font-medium">₹{settings.serviceCharges}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

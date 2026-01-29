import { useEffect, useState } from 'react';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { useSettingsStore } from '@/store/settings-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Upload,
  Save,
  Phone,
  Mail,
  Globe,
  Truck,
  Receipt,
  Building2,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { SiteSetting } from '@/types/cms';

export default function SiteSettingsManager() {
  const {
    siteSettings,
    loading,
    fetchSiteSettings,
    updateSiteSetting,
    uploadImage,
  } = useCMSEnhancedStore();

  const { settings: businessSettings, initialize: initializeSettings } = useSettingsStore();
  const { toast } = useToast();

  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [expandedJson, setExpandedJson] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Fetch both CMS settings and business settings
    const loadAllSettings = async () => {
      await fetchSiteSettings();
      await initializeSettings();
    };
    loadAllSettings();
  }, []);

  const handleChange = (id: string, value: string) => {
    setEditingValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (setting: SiteSetting) => {
    const newValue = editingValues[setting.id];
    if (newValue !== undefined && newValue !== setting.value) {
      setIsSaving(setting.id);
      try {
        await updateSiteSetting(setting.key, newValue, setting.type);
        // Refresh both settings stores to get the updated values
        await fetchSiteSettings();
        await initializeSettings();
        setEditingValues((prev) => {
          const updated = { ...prev };
          delete updated[setting.id];
          return updated;
        });
        toast({
          title: "Setting Updated",
          description: `${setting.key} has been updated successfully.`,
        });
      } catch (error: any) {
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update setting.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(null);
      }
    }
  };

  const handleImageUpload = async (setting: SiteSetting, file: File) => {
    setUploadingKey(setting.key);
    try {
      const bucket = setting.key.includes('admin') ? 'admin' : 'branding';
      const imageUrl = await uploadImage(file, bucket);
      await updateSiteSetting(setting.key, imageUrl, 'image');
      setEditingValues((prev) => {
        const updated = { ...prev };
        delete updated[setting.id];
        return updated;
      });
      toast({
        title: "Image Uploaded",
        description: "Image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploadingKey(null);
    }
  };

  const getValue = (setting: SiteSetting) => {
    return editingValues[setting.id] !== undefined ? editingValues[setting.id] : setting.value;
  };

  const hasChanges = (setting: SiteSetting) => {
    return editingValues[setting.id] !== undefined && editingValues[setting.id] !== setting.value;
  };

  const toggleJsonExpanded = (key: string) => {
    setExpandedJson(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderJsonPreview = (setting: SiteSetting) => {
    try {
      let data;

      // Special handling for deliveryZones - check both sources
      if (setting.key === 'deliveryZones') {
        try {
          data = JSON.parse(setting.value);
        } catch (e) {
          // If parsing fails, try to get from businessSettings
          data = businessSettings.deliveryZones || [];
        }

        // If data is still empty or invalid, use businessSettings as fallback
        if (!Array.isArray(data) || data.length === 0) {
          data = businessSettings.deliveryZones || [];
        }
      } else {
        data = JSON.parse(setting.value);
      }

      const isExpanded = expandedJson[setting.key];

      // Special rendering for deliveryZones
      if (setting.key === 'deliveryZones' && Array.isArray(data)) {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Delivery Zones ({data.length})
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleJsonExpanded(setting.key)}
              >
                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isExpanded ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            {isExpanded && (
              <div className="space-y-2">
                {data.map((zone: any, index: number) => (
                  <div key={zone.id || index} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${zone.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                        <span className="font-medium text-slate-900 dark:text-white">{zone.name}</span>
                      </div>
                      <Badge variant={zone.isActive ? "default" : "secondary"}>
                        {zone.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-slate-600 dark:text-slate-400">
                        <Truck className="w-3 h-3 inline mr-1" />
                        ₹{zone.deliveryCharges}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {zone.estimatedTime}
                      </div>
                    </div>
                    {zone.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{zone.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Special rendering for contact_details
      if (setting.key === 'contact_details') {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Contact Details Configuration
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleJsonExpanded(setting.key)}
              >
                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isExpanded ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            {isExpanded && (
              <div className="space-y-3">
                {data.hero && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h5 className="font-medium text-slate-900 dark:text-white mb-2">Hero Section</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{data.hero.title}</p>
                  </div>
                )}
                {data.contactInfo && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h5 className="font-medium text-slate-900 dark:text-white mb-2">Contact Info</h5>
                    <div className="space-y-1 text-sm">
                      {data.contactInfo.phones && data.contactInfo.phones.length > 0 && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Phone className="w-3 h-3" />
                          {data.contactInfo.phones[0].number}
                        </div>
                      )}
                      {data.contactInfo.emails && data.contactInfo.emails.length > 0 && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Mail className="w-3 h-3" />
                          {data.contactInfo.emails[0].email}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      // Special rendering for homepage_hero
      if (setting.key === 'homepage_hero') {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Homepage Hero Configuration
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleJsonExpanded(setting.key)}
              >
                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isExpanded ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            {isExpanded && (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="space-y-2 text-sm">
                  {data.title && (
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Title:</span>
                      <p className="text-slate-600 dark:text-slate-400">{data.title}</p>
                    </div>
                  )}
                  {data.subtitle && (
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Subtitle:</span>
                      <p className="text-slate-600 dark:text-slate-400">{data.subtitle}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      // Generic JSON rendering
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              JSON Configuration
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleJsonExpanded(setting.key)}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isExpanded ? 'Hide' : 'Show'} Raw JSON
            </Button>
          </div>
          {isExpanded && (
            <pre className="p-3 bg-slate-900 text-green-400 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      );
    } catch (e) {
      return (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">Invalid JSON format</p>
        </div>
      );
    }
  };

  // Filter out settings that are managed by dedicated managers
  const managedByOtherComponents = [
    'gstRate',
    'businessName',
    'businessAddress',
    'gstNumber',
    'deliveryCharges',
    'serviceCharges'
  ];

  const displaySettings = siteSettings.filter(
    setting => !managedByOtherComponents.includes(setting.key)
  );

  const settingsByCategory = displaySettings.reduce((acc, setting) => {
    const category = setting.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>);

  const categoryLabels: Record<string, string> = {
    branding: 'Branding & Logos',
    contact: 'Contact Information',
    social: 'Social Media',
    general: 'General Settings',
    content: 'Content Management',
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'branding': return Globe;
      case 'contact': return Phone;
      case 'social': return Mail;
      case 'content': return Settings;
      default: return Settings;
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-500" />
            Quick Business Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Business Name</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-white">{businessSettings.businessName}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-green-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">GST Rate</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-white">{businessSettings.gstRate}%</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Delivery Charges</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-white">₹{businessSettings.deliveryCharges}</p>
            </div>
          </div>

          {/* Enhanced Note Section */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Manage These Settings in Their Dedicated Sections
                </h4>
                <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
                  For better organization and advanced options, please use the dedicated CMS sections:
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <Receipt className="w-3 h-3" />
                    <span><strong>GST Settings</strong> - Manage GST rate, business details, and tax configuration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Truck className="w-3 h-3" />
                    <span><strong>Delivery Charges</strong> - Configure delivery zones, charges, and policies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span><strong>Contact Details</strong> - Update contact information, forms, and business hours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    <span><strong>Homepage Hero</strong> - Customize homepage banners and featured content</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Site Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && displaySettings.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading settings...
            </div>
          ) : displaySettings.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No site settings found. Settings are managed in dedicated sections.
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(settingsByCategory).map(([category, settings]) => {
                const Icon = getCategoryIcon(category);
                return (
                  <div key={category}>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {categoryLabels[category] || category}
                    </h4>
                    <div className="space-y-4">
                      {settings.map((setting) => (
                        <div key={setting.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                            <div className="flex-1">
                              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </Label>
                              {setting.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {setting.description}
                                </p>
                              )}
                            </div>
                            {hasChanges(setting) && (
                              <Button
                                onClick={() => handleSave(setting)}
                                disabled={isSaving === setting.id}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isSaving === setting.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-3 h-3 mr-1" />
                                    Save
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                          {setting.type === 'json' ? (
                            renderJsonPreview(setting)
                          ) : setting.type === 'image' ? (
                            <div className="space-y-2">
                              {getValue(setting) && (
                                <img
                                  src={getValue(setting)}
                                  alt={setting.key}
                                  className="w-32 h-32 object-contain bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-2"
                                />
                              )}
                              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-all w-fit text-sm">
                                <Upload className="w-4 h-4" />
                                {uploadingKey === setting.key ? 'Uploading...' : 'Upload Image'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(setting, file);
                                  }}
                                  disabled={uploadingKey === setting.key}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          ) : setting.type === 'boolean' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={getValue(setting) === 'true'}
                                onChange={(e) => handleChange(setting.id, e.target.checked ? 'true' : 'false')}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {getValue(setting) === 'true' ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          ) : setting.type === 'number' ? (
                            <Input
                              type="number"
                              value={getValue(setting)}
                              onChange={(e) => handleChange(setting.id, e.target.value)}
                              className="max-w-xs"
                            />
                          ) : (
                            <Input
                              type="text"
                              value={getValue(setting)}
                              onChange={(e) => handleChange(setting.id, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/service-card';
import { SettingsDialog } from '@/components/settings-dialog';
import { fetchServices, type MCPService } from '@/lib/api';

export default function Dashboard() {
  const [services, setServices] = useState<MCPService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<MCPService | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await fetchServices();
      setServices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleConfigure = (service: MCPService) => {
    setSelectedService(service);
    setSettingsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">MCP Base</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedService(null);
              setSettingsOpen(true);
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={loadServices} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Services</h2>
              <p className="text-muted-foreground mt-1">
                {services.length} MCP services available
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.name}
                  service={service}
                  onConfigure={() => handleConfigure(service)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <SettingsDialog
        service={selectedService}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={loadServices}
      />
    </div>
  );
}

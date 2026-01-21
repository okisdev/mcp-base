'use client';

import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ServiceCard } from '@/components/service-card';
import { SettingsDialog } from '@/components/settings-dialog';
import { Button } from '@/components/ui/button';
import { fetchServices, type MCPService } from '@/lib/api';

export default function Dashboard() {
  const [services, setServices] = useState<MCPService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<MCPService | null>(
    null
  );
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
    <div className='min-h-screen bg-background'>
      <header className='border-b'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4'>
          <h1 className='font-semibold text-xl'>MCP Base</h1>
          <Button
            onClick={() => {
              setSelectedService(null);
              setSettingsOpen(true);
            }}
            size='sm'
            variant='outline'
          >
            <Settings className='mr-2 h-4 w-4' />
            Settings
          </Button>
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='h-8 w-8 animate-spin rounded-full border-primary border-b-2' />
          </div>
        ) : error ? (
          <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center'>
            <p className='text-destructive text-sm'>{error}</p>
            <Button
              className='mt-2'
              onClick={loadServices}
              size='sm'
              variant='outline'
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className='mb-6'>
              <h2 className='font-semibold text-2xl'>Services</h2>
              <p className='mt-1 text-muted-foreground'>
                {services.length} MCP services available
              </p>
            </div>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {services.map((service) => (
                <ServiceCard
                  key={service.name}
                  onConfigure={() => handleConfigure(service)}
                  service={service}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <SettingsDialog
        onOpenChange={setSettingsOpen}
        onSave={loadServices}
        open={settingsOpen}
        service={selectedService}
      />
    </div>
  );
}

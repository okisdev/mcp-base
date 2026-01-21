'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { JSONSchema, MCPService } from '@/lib/api';
import { getConfig, type ServiceConfig, setConfig } from '@/lib/store';

interface SettingsDialogProps {
  service: MCPService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

function getConfigFields(
  schema?: JSONSchema
): Array<{ key: string; description: string }> {
  if (!schema?.properties) {
    return [];
  }

  return Object.entries(schema.properties).map(([key, prop]) => ({
    key,
    description: prop.description || key,
  }));
}

export function SettingsDialog({
  service,
  open,
  onOpenChange,
  onSave,
}: SettingsDialogProps) {
  const [config, setConfigState] = useState<ServiceConfig>({});

  useEffect(() => {
    if (service && open) {
      setConfigState(getConfig(service.name));
    }
  }, [service, open]);

  if (!service) {
    return null;
  }

  const fields = getConfigFields(service.configSchema);

  const handleSave = () => {
    setConfig(service.name, config);
    onOpenChange(false);
    onSave?.();
  };

  const handleChange = (key: string, value: string) => {
    setConfigState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='capitalize'>
            {service.name} Settings
          </DialogTitle>
          <DialogDescription>
            Configure API keys and credentials for {service.name}.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          {fields.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              This service does not require any configuration.
            </p>
          ) : (
            fields.map((field) => (
              <div className='grid gap-2' key={field.key}>
                <Label htmlFor={field.key}>{field.key}</Label>
                <Input
                  id={field.key}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.description}
                  type='password'
                  value={config[field.key] || ''}
                />
                <p className='text-muted-foreground text-xs'>
                  {field.description}
                </p>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant='outline'>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

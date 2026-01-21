'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Settings, Wrench } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MCPService } from '@/lib/api';
import { isConfigured } from '@/lib/store';

interface ServiceCardProps {
  service: MCPService;
  onConfigure: () => void;
}

function getRequiredFields(service: MCPService): string[] {
  if (!service.configSchema?.required) {
    return [];
  }
  return service.configSchema.required;
}

export function ServiceCard({ service, onConfigure }: ServiceCardProps) {
  const requiredFields = getRequiredFields(service);
  const configured = requiredFields.length === 0 || isConfigured(service.name, requiredFields);

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg capitalize">{service.name}</CardTitle>
            <CardDescription className="mt-1.5">{service.description}</CardDescription>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onConfigure}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="h-4 w-4" />
            <span>{service.tools.length} tools</span>
          </div>
          <div className="flex items-center gap-2">
            {configured ? (
              <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                Configured
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Circle className="h-4 w-4" />
                Not configured
              </span>
            )}
          </div>
        </div>
        <Link href={`/services/${service.name}`} className="block mt-4">
          <Button variant="outline" className="w-full">
            Open Service
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

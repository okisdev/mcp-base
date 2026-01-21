'use client';

import { CheckCircle2, Circle, Settings, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  const configured =
    requiredFields.length === 0 || isConfigured(service.name, requiredFields);

  return (
    <Card className='transition-colors hover:border-primary/50'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-lg capitalize'>{service.name}</CardTitle>
            <CardDescription className='mt-1.5'>
              {service.description}
            </CardDescription>
          </div>
          <Button onClick={onConfigure} size='icon-sm' variant='ghost'>
            <Settings className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-muted-foreground text-sm'>
            <Wrench className='h-4 w-4' />
            <span>{service.tools.length} tools</span>
          </div>
          <div className='flex items-center gap-2'>
            {configured ? (
              <span className='flex items-center gap-1.5 text-green-600 text-sm dark:text-green-500'>
                <CheckCircle2 className='h-4 w-4' />
                Configured
              </span>
            ) : (
              <span className='flex items-center gap-1.5 text-muted-foreground text-sm'>
                <Circle className='h-4 w-4' />
                Not configured
              </span>
            )}
          </div>
        </div>
        <Link className='mt-4 block' href={`/services/${service.name}`}>
          <Button className='w-full' variant='outline'>
            Open Service
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { JSONSchema, MCPTool } from '@/lib/api';

interface ToolFormProps {
  tool: MCPTool;
  onExecute: (params: Record<string, unknown>) => void;
  isLoading?: boolean;
}

interface FormField {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  isObject?: boolean;
}

function extractFields(schema: JSONSchema): FormField[] {
  if (!schema.properties) {
    return [];
  }

  const required = schema.required || [];

  return Object.entries(schema.properties).map(([name, prop]) => ({
    name,
    type: prop.type || 'string',
    description: prop.description,
    required: required.includes(name),
    defaultValue: prop.default,
    isObject: prop.type === 'object' || prop.additionalProperties !== undefined,
  }));
}

export function ToolForm({ tool, onExecute, isLoading }: ToolFormProps) {
  const fields = extractFields(tool.inputSchema);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      if (field.defaultValue !== undefined) {
        initial[field.name] = String(field.defaultValue);
      }
    }
    return initial;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params: Record<string, unknown> = {};
    for (const field of fields) {
      const value = values[field.name];
      if (value === undefined || value === '') {
        continue;
      }

      if (field.type === 'number') {
        params[field.name] = Number(value);
      } else if (field.type === 'boolean') {
        params[field.name] = value === 'true';
      } else if (field.isObject) {
        try {
          params[field.name] = JSON.parse(value);
        } catch {
          params[field.name] = value;
        }
      } else {
        params[field.name] = value;
      }
    }

    onExecute(params);
  };

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <div className='space-y-1'>
        <h3 className='font-medium'>{tool.name}</h3>
        <p className='text-muted-foreground text-sm'>{tool.description}</p>
      </div>

      {fields.length > 0 && (
        <div className='space-y-4'>
          {fields.map((field) => (
            <div className='grid gap-2' key={field.name}>
              <Label htmlFor={field.name}>
                {field.name}
                {field.required && (
                  <span className='ml-1 text-destructive'>*</span>
                )}
              </Label>
              {field.isObject ? (
                <Textarea
                  className='font-mono text-sm'
                  id={field.name}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={
                    field.description || `Enter ${field.name} as JSON`
                  }
                  rows={3}
                  value={values[field.name] || ''}
                />
              ) : (
                <Input
                  id={field.name}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.description || `Enter ${field.name}`}
                  required={field.required}
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={values[field.name] || ''}
                />
              )}
              {field.description && (
                <p className='text-muted-foreground text-xs'>
                  {field.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Button className='w-full' disabled={isLoading} type='submit'>
        <Play className='mr-2 h-4 w-4' />
        {isLoading ? 'Executing...' : 'Execute'}
      </Button>
    </form>
  );
}

'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { MCPToolResult } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ResultViewProps {
  result: MCPToolResult | null;
  className?: string;
}

function formatContent(content: MCPToolResult['content']): string {
  return content
    .map((item) => {
      if (item.type === 'text' && item.text) {
        try {
          const parsed = JSON.parse(item.text);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return item.text;
        }
      }
      return JSON.stringify(item, null, 2);
    })
    .join('\n');
}

export function ResultView({ result, className }: ResultViewProps) {
  if (!result) {
    return (
      <div
        className={cn(
          'rounded-lg border border-dashed p-6 text-center',
          className
        )}
      >
        <p className='text-muted-foreground text-sm'>
          Execute a tool to see results here
        </p>
      </div>
    );
  }

  const isError = result.isError;
  const content = formatContent(result.content);

  return (
    <div className={cn('space-y-2', className)}>
      <div className='flex items-center gap-2'>
        {isError ? (
          <>
            <AlertCircle className='h-4 w-4 text-destructive' />
            <span className='font-medium text-destructive text-sm'>Error</span>
          </>
        ) : (
          <>
            <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-500' />
            <span className='font-medium text-green-600 text-sm dark:text-green-500'>
              Success
            </span>
          </>
        )}
      </div>
      <pre
        className={cn(
          'max-h-96 overflow-auto rounded-lg border p-4 font-mono text-sm',
          isError ? 'border-destructive/20 bg-destructive/10' : 'bg-muted/50'
        )}
      >
        {content}
      </pre>
    </div>
  );
}

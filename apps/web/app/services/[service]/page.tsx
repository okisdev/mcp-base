'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ToolForm } from '@/components/tool-form';
import { ResultView } from '@/components/result-view';
import { SettingsDialog } from '@/components/settings-dialog';
import {
  fetchTools,
  executeTool,
  type MCPTool,
  type MCPToolResult,
  type MCPService,
  type JSONSchema,
} from '@/lib/api';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ service: string }>;
}

export default function ServicePage({ params }: PageProps) {
  const { service: serviceName } = use(params);

  const [tools, setTools] = useState<MCPTool[]>([]);
  const [configSchema, setConfigSchema] = useState<JSONSchema | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<MCPToolResult | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadTools = async () => {
    try {
      setLoading(true);
      const data = await fetchTools(serviceName);
      setTools(data.tools);
      setConfigSchema(data.configSchema);
      if (data.tools.length > 0 && !selectedTool) {
        setSelectedTool(data.tools[0]);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, [serviceName]);

  const handleExecute = async (params: Record<string, unknown>) => {
    if (!selectedTool) return;

    try {
      setExecuting(true);
      setResult(null);
      const data = await executeTool(serviceName, selectedTool.name, params);
      setResult(data);
    } catch (err) {
      setResult({
        content: [{ type: 'text', text: err instanceof Error ? err.message : 'Unknown error' }],
        isError: true,
      });
    } finally {
      setExecuting(false);
    }
  };

  // Create a minimal service object for settings dialog
  const serviceForSettings: MCPService = {
    name: serviceName,
    description: '',
    tools: tools,
    configSchema: configSchema,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold capitalize">{serviceName}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
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
            <Button variant="outline" size="sm" onClick={loadTools} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Tool list */}
            <div className="space-y-2">
              <h2 className="font-medium text-sm text-muted-foreground px-2">Tools</h2>
              <nav className="space-y-1">
                {tools.map((tool) => (
                  <button
                    key={tool.name}
                    type="button"
                    onClick={() => {
                      setSelectedTool(tool);
                      setResult(null);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      selectedTool?.name === tool.name
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    {tool.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tool form and results */}
            <div className="space-y-6">
              {selectedTool ? (
                <>
                  <Card>
                    <CardContent className="pt-6">
                      <ToolForm
                        tool={selectedTool}
                        onExecute={handleExecute}
                        isLoading={executing}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-4">Result</h3>
                      <ResultView result={result} />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="rounded-lg border border-dashed p-12 text-center">
                  <p className="text-muted-foreground">Select a tool to get started</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <SettingsDialog
        service={serviceForSettings}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={loadTools}
      />
    </div>
  );
}

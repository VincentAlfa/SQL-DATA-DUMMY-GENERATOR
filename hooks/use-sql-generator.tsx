import { useState } from 'react';
import { formatSQLOutput } from '@/lib/formatSQL';

export function useSQLGenerator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedData, setGeneratedData] = useState('');
  const [streamingData, setStreamingData] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const processSQL = async (sqlContent: string, tableConfigs: Record<string, number> = {}) => {
    if (!sqlContent) {
      setError('Please provide SQL schema first');
      return;
    }

    setIsProcessing(true);
    setError('');
    setGeneratedData('');
    setStreamingData('');

    try {
      const response = await fetch('/api/generate-dummy-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sqlSchema: sqlContent,
          tableConfigs,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedData = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            if (line.startsWith('0:')) {
              const jsonStr = line.slice(2);
              const parsed = JSON.parse(jsonStr);

              if (parsed.type === 'text-delta' && parsed.textDelta) {
                accumulatedData += parsed.textDelta;
                setStreamingData(formatSQLOutput(accumulatedData));
              }
            } else {
              accumulatedData += line;
              setStreamingData(formatSQLOutput(accumulatedData));
            }
          } catch (parseError) {
            console.error('Error parsing chunk:', parseError, 'Raw line:', line);
            accumulatedData += chunk;
            setStreamingData(formatSQLOutput(accumulatedData));
          }
        }
      }

      const formattedData = formatSQLOutput(accumulatedData);
      setGeneratedData(formattedData);
      setStreamingData(formattedData);
    } catch (err) {
      console.error('Error in processSQL:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = () => {
    const dataToDownload = generatedData || streamingData;
    if (!dataToDownload) return;

    const blob = new Blob([dataToDownload], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dummy_data.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const dataToDownload = generatedData || streamingData;
    if (!dataToDownload) return;

    await navigator.clipboard.writeText(dataToDownload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    isProcessing,
    generatedData,
    streamingData,
    error,
    copied,
    processSQL,
    downloadResults,
    copyToClipboard,
    setError,
    setGeneratedData,
    setStreamingData,
  };
}

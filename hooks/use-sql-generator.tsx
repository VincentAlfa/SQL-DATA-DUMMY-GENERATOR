import { useCallback, useMemo, useState } from 'react';
import { useCompletion } from '@ai-sdk/react';

function stripCodeFences(text: string) {
  return text
    .replace(/^```(?:sql)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

export function useSQLGenerator() {
  const [copied, setCopied] = useState(false);
  const [manualError, setManualError] = useState('');

  const { completion, complete, isLoading, error, setCompletion, stop } = useCompletion({
    api: '/api/generate-dummy-data',
    streamProtocol: 'text',
    experimental_throttle: 120,
  });

  const streamingData = useMemo(() => stripCodeFences(completion), [completion]);
  const generatedData = isLoading ? '' : streamingData;
  const combinedError = manualError || error?.message || '';

  const processSQL = useCallback(
    async (sqlContent: string, tableConfigs: Record<string, number> = {}) => {
      if (!sqlContent.trim()) {
        setManualError('Please provide SQL schema first');
        return;
      }

      setManualError('');
      setCompletion('');

      try {
        await complete(sqlContent, { body: { tableConfigs } });
      } catch (err) {
        setManualError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    },
    [complete, setCompletion],
  );

  const downloadResults = useCallback(() => {
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
  }, [generatedData, streamingData]);

  const copyToClipboard = useCallback(async () => {
    const dataToCopy = generatedData || streamingData;
    if (!dataToCopy) return;

    await navigator.clipboard.writeText(dataToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedData, streamingData]);

  const setError = useCallback((value: string) => setManualError(value), []);

  return {
    isProcessing: isLoading,
    generatedData,
    streamingData,
    error: combinedError,
    copied,
    processSQL,
    downloadResults,
    copyToClipboard,
    setError,
    stop,
  };
}

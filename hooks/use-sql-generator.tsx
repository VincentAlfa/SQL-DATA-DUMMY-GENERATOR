import { useCallback, useMemo, useState } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { ANALYSIS_DELIM } from '@/lib/utils';

function stripCodeFences(text: string) {
  return text
    .replace(/^```(?:sql)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function splitStream(text: string) {
  const idx = text.indexOf(ANALYSIS_DELIM);
  if (idx === -1) {
    return { sql: text, analysis: '' };
  }
  return {
    sql: text.slice(0, idx),
    analysis: text.slice(idx + ANALYSIS_DELIM.length),
  };
}

export function useSQLGenerator() {
  const [copied, setCopied] = useState(false);
  const [manualError, setManualError] = useState('');

  const { completion, complete, isLoading, error, setCompletion, stop } = useCompletion({
    api: '/api/generate-dummy-data',
    streamProtocol: 'text',
    experimental_throttle: 50,
  });

  const { sql: sqlCompletion, analysis: analysisCompletion } = useMemo(
    () => splitStream(completion),
    [completion],
  );

  const streamingSQL = useMemo(() => stripCodeFences(sqlCompletion), [sqlCompletion]);
  const streamingAnalysis = useMemo(() => analysisCompletion.trim(), [analysisCompletion]);

  const generatedData = isLoading ? '' : streamingSQL;
  const analysisData = isLoading ? '' : streamingAnalysis;
  const combinedError = manualError || error?.message || '';

  const processSQL = useCallback(
    async (
      sqlContent: string,
      tableConfigs: Record<string, number> = {},
      tableInstructions: Record<string, string> = {},
    ) => {
      if (!sqlContent.trim()) {
        setManualError('Please provide SQL schema first');
        return;
      }

      setManualError('');
      setCompletion('');

      try {
        await complete(sqlContent, {
          body: {
            tableConfigs,
            tableInstructions,
            analyzeSchema: true,
          },
        });
      } catch (err) {
        setManualError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    },
    [complete, setCompletion],
  );

  const downloadResults = useCallback(() => {
    const dataToDownload = generatedData || streamingSQL;
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
  }, [generatedData, streamingSQL]);

  const copyToClipboard = useCallback(async () => {
    const dataToCopy = generatedData || streamingSQL;
    if (!dataToCopy) return;

    await navigator.clipboard.writeText(dataToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedData, streamingSQL]);

  const setError = useCallback((value: string) => setManualError(value), []);

  return {
    isProcessing: isLoading,
    generatedData,
    streamingData: streamingSQL,
    analysisData,
    error: combinedError,
    copied,
    processSQL,
    downloadResults,
    copyToClipboard,
    setError,
    stop,
  };
}

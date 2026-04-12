import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Download } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SQLCodeDisplayProps {
  displayData: string;
  copied: boolean;
  isProcessing: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

export function SQLCodeDisplay({
  displayData,
  copied,
  isProcessing,
  onCopy,
  onDownload,
}: SQLCodeDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated SQL Dummy Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='relative'>
            <div className='flex items-center justify-between bg-gray-100 px-4 rounded-t-lg border border-b-0 border-gray-200'>
              <span className='text-sm font-medium'>sql</span>
              <Button
                variant='ghost'
                size='sm'
                onClick={onCopy}
                className='h-8 px-2 hover:bg-gray-200'
              >
                {copied ? (
                  <>
                    <Check className='w-4 h-4 mr-1' />
                    <span className='text-sm'>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className='w-4 h-4 mr-1' />
                    <span className='text-sm'>Copy code</span>
                  </>
                )}
              </Button>
            </div>

            <div className='rounded-b-lg overflow-hidden border border-gray-200 max-h-96 overflow-y-auto bg-white'>
              {isProcessing ? (
                <pre className='m-0 p-4 text-sm leading-6 font-mono whitespace-pre-wrap break-words'>
                  {displayData}
                </pre>
              ) : (
                <SyntaxHighlighter
                  showLineNumbers={false}
                  language='sql'
                  style={vs}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}
                  wrapLines
                >
                  {displayData}
                </SyntaxHighlighter>
              )}
            </div>

            {isProcessing && (
              <div className='absolute bottom-2 right-2'>
                <div className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'>
                  Streaming...
                </div>
              </div>
            )}
          </div>
          <div className='flex gap-2'>
            <Button onClick={onDownload} className='flex-1' disabled={!displayData || isProcessing}>
              <Download className='w-4 h-4 mr-2' />
              {isProcessing ? 'Generation in Progress...' : 'Download SQL File'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

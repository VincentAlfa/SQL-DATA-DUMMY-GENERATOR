'use client';

import { SQLCodeDisplay } from '@/components/sql-code-display/sql-code-display';
import { SQLFileUpload } from '@/components/sql-file-upload/sql-file-upload';
import { SQLInputMethod } from '@/components/sql-input-method/sql-input-method';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useSQLGenerator } from '@/hooks/use-sql-generator';
import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  sqlContent: z.string(),
  inputMethod: z.enum(['upload', 'paste']),
  file: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function SQLDummyDataGenerator() {
  const {
    isProcessing,
    generatedData,
    streamingData,
    error,
    copied,
    processSQL,
    downloadResults,
    copyToClipboard,
    setError,
  } = useSQLGenerator();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqlContent: '',
      inputMethod: 'upload',
      file: undefined,
    },
  });

  const watchedInputMethod = form.watch('inputMethod');
  const watchedSqlContent = form.watch('sqlContent');
  const watchedFile = form.watch('file');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (
      (uploadedFile && uploadedFile.type === 'application/sql') ||
      uploadedFile?.name.endsWith('.sql')
    ) {
      form.setValue('file', uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        form.setValue('sqlContent', content);
      };
      reader.readAsText(uploadedFile);
      setError('');
    } else {
      setError('Please upload a valid SQL file');
    }
  };

  const resetProcess = () => {
    form.reset({
      sqlContent: '',
      inputMethod: 'upload',
      file: undefined,
    });
  };

  const onSubmit = (data: FormData) => {
    processSQL(data.sqlContent);
  };

  const displayData = generatedData || streamingData;

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>SQL Dummy Data Generator</h1>
          <p className='text-lg text-gray-600'>
            Upload your SQL schema and let AI generate realistic dummy data
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <Card className='mb-8'>
              <CardHeader>
                <CardTitle>SQL Schema Input</CardTitle>
                <CardDescription>Choose how you want to provide your SQL schema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <SQLInputMethod form={form} />

                  {watchedInputMethod === 'upload' && (
                    <SQLFileUpload
                      form={form}
                      onFileUpload={handleFileUpload}
                      fileName={watchedFile?.name}
                    />
                  )}

                  {watchedInputMethod === 'paste' && (
                    <FormField
                      control={form.control}
                      name='sqlContent'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SQL Schema</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                form.setValue('file', undefined);
                              }}
                              placeholder='CREATE TABLE users (
                                            id INT PRIMARY KEY AUTO_INCREMENT,
                                            username VARCHAR(50) UNIQUE NOT NULL,
                                            email VARCHAR(100) UNIQUE NOT NULL,
                                            ...
                                          );'
                              className='h-48 font-mono text-sm'
                            />
                          </FormControl>
                          <FormDescription>
                            Paste your SQL schema directly into this text area
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedSqlContent && watchedInputMethod === 'upload' && (
                    <FormField
                      control={form.control}
                      name='sqlContent'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SQL Content Preview</FormLabel>
                          <FormControl>
                            <Textarea
                              value={field.value}
                              readOnly
                              className='h-32 font-mono text-sm'
                            />
                          </FormControl>
                          <FormDescription>Preview of your uploaded SQL schema</FormDescription>
                        </FormItem>
                      )}
                    />
                  )}

                  <div className='flex gap-4'>
                    <Button
                      type='submit'
                      disabled={!watchedSqlContent || isProcessing}
                      className='flex-1'
                    >
                      {isProcessing ? 'Generating...' : 'Generate Dummy Data'}
                    </Button>
                    <Button
                      type='button'
                      onClick={resetProcess}
                      variant='outline'
                      disabled={isProcessing}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>

        {error && (
          <Alert className='mb-8 border-red-200 bg-red-50'>
            <AlertDescription className='text-red-800'>{error}</AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <Card className='mb-8'>
            <CardContent className='pt-6'>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Generating dummy data...</span>
                  <span>{streamingData.length > 0 ? 'Streaming...' : 'Starting...'}</span>
                </div>
                <Progress value={streamingData.length > 0 ? 75 : 25} />
              </div>
            </CardContent>
          </Card>
        )}

        {displayData && (
          <SQLCodeDisplay
            displayData={displayData}
            copied={copied}
            isProcessing={isProcessing}
            onCopy={copyToClipboard}
            onDownload={downloadResults}
          />
        )}
      </div>
    </div>
  );
}

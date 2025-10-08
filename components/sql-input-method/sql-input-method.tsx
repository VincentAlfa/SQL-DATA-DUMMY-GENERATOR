import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload, FileText } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface SQLInputMethodProps {
  form: UseFormReturn<any>;
}

export function SQLInputMethod({ form }: SQLInputMethodProps) {
  return (
    <FormField
      control={form.control}
      name='inputMethod'
      render={({ field }) => (
        <FormItem>
          <FormLabel>Input Method</FormLabel>
          <FormControl>
            <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg'>
              <button
                type='button'
                onClick={() => {
                  field.onChange('upload');
                  form.setValue('sqlContent', '');
                  form.setValue('file', undefined);
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  field.value === 'upload'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className='w-4 h-4 inline mr-2' />
                Upload File
              </button>
              <button
                type='button'
                onClick={() => {
                  field.onChange('paste');
                  form.setValue('file', undefined);
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  field.value === 'paste'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className='w-4 h-4 inline mr-2' />
                Paste Text
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

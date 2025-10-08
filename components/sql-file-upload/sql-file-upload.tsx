import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Upload } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface SQLFileUploadProps {
  form: UseFormReturn<any>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string;
}

export function SQLFileUpload({ form, onFileUpload, fileName }: SQLFileUploadProps) {
  return (
    <FormField
      control={form.control}
      name='file'
      render={({ field }) => (
        <FormItem>
          <FormLabel>SQL File</FormLabel>
          <FormControl>
            <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
              <input
                type='file'
                accept='.sql'
                onChange={onFileUpload}
                className='hidden'
                id='sql-upload'
              />
              <label htmlFor='sql-upload' className='cursor-pointer'>
                <Upload className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-lg font-medium text-gray-700'>
                  {fileName || 'Click to upload SQL file'}
                </p>
                <p className='text-sm text-gray-500'>Supports .sql files up to 10MB</p>
              </label>
            </div>
          </FormControl>
          <FormDescription>Upload a .sql file containing your database schema</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

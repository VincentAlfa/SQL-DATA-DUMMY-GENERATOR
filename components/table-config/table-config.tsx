import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { TableInfo } from '@/lib/detectTableFromSQL';
import { Textarea } from '../ui/textarea';

interface TableConfigProps {
  form: UseFormReturn<any>;
  tables: TableInfo[];
}

export function TableConfig({ form, tables }: TableConfigProps) {
  if (tables.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Records per Table</CardTitle>
        <CardDescription>
          Customize the number of records to generate for each table
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4 md:grid-cols-2'>
          {tables.map((table) => (
            <div key={table.name} className='flex flex-col space-y-2'>
              <FormField
                key={table.name}
                control={form.control}
                name={`tableConfigs.${table.name}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='capitalize'>{table.name}</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        inputMode='numeric'
                        placeholder='Enter number of records'
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                key={`${table.name}-instructions`}
                control={form.control}
                name={`tableInstructions.${table.name}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='capitalize'>
                      Custom instructions for {table.name}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                      placeholder="Custom Instructions (optional)"
                        maxLength={200}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

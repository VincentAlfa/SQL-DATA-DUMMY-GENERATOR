import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { TableInfo } from '@/lib/detectTableFromSQL';

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
            <FormField
              key={table.name}
              control={form.control}
              name={`tableConfigs.${table.name}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='capitalize'>{table.name}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='enter number of records'
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

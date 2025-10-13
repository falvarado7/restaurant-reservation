import { useParams, useNavigate } from "react-router-dom";
import { useDeleteTable, useUpdatetable, useTable } from "../hooks";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { Button, Card, Input, Label } from "../../../app/components/ui";
import { toast } from "sonner";

const Schema = z.object({
    table_id: z.number().optional(),
    table_name: z.string().min(1),
    capacity: z.coerce.number().int().min(1),
    reservation_id: z.number().optional().nullable(),
    image_url: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof Schema>;

function EditTablePage() {
    const { table_id } = useParams<{ table_id: string }>();
    const nav = useNavigate();
    const { data, isLoading } = useTable(table_id!);

    const {
        mutateAsync: updateTableAsync,
        isPending: isUpdating
    } = useUpdatetable();

    const {
        mutateAsync: deleteTableAsync,
        isPending: isDeleting
    } = useDeleteTable();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(Schema) as Resolver<FormValues>,
    });

    // hydrate when loaded
      if (data && !isLoading) {
          const v: any = {
              ...data,
                capacity: Number(data.capacity),
          };
              // Avoid infinite reset loops
              // @ts-ignore
          if ((reset as any)._didInit !== true) {
              reset(v);
              // @ts-ignore
              (reset as any)._didInit = true;
          }
      }

      const onSubmit = async (values: FormValues) => {
          try {
              await updateTableAsync({ ...values, table_id: Number(table_id) } as any);
              toast.success("Table updated");
              nav(`/dashboard`);
          } catch (e) {
              toast.error(String(e));
          }
      };

      const delTable = async () => {
        try {
            const ok = confirm("Do you want to delete this table? This cannot be undone.");
            if (!ok) return;
            await deleteTableAsync(Number(table_id));
            toast.success("Table deleted");
            nav(`/dashboard`);
        } catch (e) {
            toast.error(String(e));
        }
    }

      return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Edit Table</h1>
            <Card className="p-2">
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Label>Table name</Label>
                        <Input {...register("table_name")} />
                        {errors.table_name && <p className="mt-1 text-xs text-red-600 pl-3">{errors.table_name.message}</p>}
                    </div>
                    <div>
                        <Label>Capacity</Label>
                        <Input type="number" min={1} {...register("capacity")} />
                        {errors.capacity && <p className="mt-1 text-xs text-red-600 pl-3">{errors.capacity.message}</p>}
                    </div>
                    <div>
                        <Label>Image</Label>
                        <Input {...register("image_url")} />
                        {errors.image_url && <p className="mt-1 text-xs text-red-600 pl-3">{errors.image_url.message}</p>}
                    </div>
                    <div className="sm:col-span-2 flex gap-2 pt-2">
                        <button type="submit" disabled={isUpdating || isDeleting}
                            className="
                                inline-flex items-center gap-2 rounded-xl sm:px-4 sm:py-2 px-2.5 py-1.5 text-sm font-medium transition border
                                bg-gray-200 dark:bg-zinc-900 text-green-700 border-green-600 hover:bg-green-200
                                dark:text-green-400  dark:hover:bg-green-950"
                        >
                            {isUpdating ? "Saving..." : "Save"}
                        </button>
                        <Button type="button" className="bg-gray-200 text-zinc-800 border-zinc-50
                                dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-700"
                            onClick={() => nav(-1)}
                        >
                            Cancel
                        </Button>
                        <button
                            disabled={isUpdating || isDeleting}
                            className="
                                inline-flex items-center gap-2 rounded-xl sm:px-4 sm:py-2 px-2.5 py-1.5 text-sm font-medium transition border
                                bg-gray-200 dark:bg-zinc-900 text-red-700 border-red-600 hover:bg-red-200
                                dark:text-red-400  dark:hover:bg-red-950"
                            onClick={delTable}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
      );
}

export default EditTablePage
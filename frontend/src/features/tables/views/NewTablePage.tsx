import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input, Label } from "../../../app/components/ui";
import { useCreateTable } from "../hooks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Schema = z.object({
    table_name: z.string().min(1, "Required"),
    capacity: z.coerce.number().int().min(1, "Must be at least 1"),
    image_url: z.string().min(1, "Required")
});

type FormValues = z.infer<typeof Schema>;

export default function NewTablePage() {
    const nav = useNavigate();
    const { mutateAsync, isPending } = useCreateTable();

    const {
        register,
        handleSubmit,
        formState: { errors },
} = useForm<FormValues>({
    resolver: zodResolver(Schema) as Resolver<FormValues>,
});

    const onSubmit = async (values: FormValues) => {
        try {
            await mutateAsync(values as any);
            toast.success("Table created");
            nav(`/dashboard`);
        } catch (e) {
            toast.error(String(e));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">New Table</h1>
            <Card className="p-2">
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Label>Table name</Label>
                        <Input placeholder="Bar #1, Booth A, Table 7…" {...register("table_name")} />
                        {errors.table_name && <p className="mt-1 text-xs text-red-600 pl-3">{errors.table_name.message}</p>}
                    </div>
                    <div>
                        <Label>Capacity</Label>
                        <Input type="number" min={1} {...register("capacity")} />
                        {errors.capacity && <p className="mt-1 text-xs text-red-600 pl-3">{errors.capacity.message}</p>}
                    </div>
                    <div>
                        <Label>Image</Label>
                        <Input placeholder="Image URL..." {...register("image_url")} />
                        {errors.image_url && <p className="mt-1 text-xs text-red-600 pl-3">{errors.image_url.message}</p>}
                    </div>
                    <div className="sm:col-span-2 flex gap-2 pt-2">
                        <Button type="submit" disabled={isPending}
                            className="bg-gray-200 text-zinc-800 border-zinc-50
                                dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-700"
                        >
                            Create
                        </Button>
                        <Button type="button" className="bg-gray-200 text-zinc-800 border-zinc-50
                                dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-700"
                            onClick={() => nav(-1)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
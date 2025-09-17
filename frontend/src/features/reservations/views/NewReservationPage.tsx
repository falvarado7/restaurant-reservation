import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input, Label } from "../../../app/components/ui";
import { useCreateReservation } from "../hooks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

const Schema = z.object({
    first_name: z.string().min(1, "Required"),
    last_name: z.string().min(1, "Required"),
    mobile_number: z.string().min(7, "Enter a phone number"),
    reservation_date: z.string().min(10, "YYYY-MM-DD"),
    reservation_time: z.string().min(5, "HH:mm"),
    people: z.coerce.number().int().min(1, "Must be at least 1"),
});

type FormValues = z.infer<typeof Schema>;

export default function NewReservationPage() {
    const nav = useNavigate();
    const { mutateAsync, isPending } = useCreateReservation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(Schema) as Resolver<FormValues>,
        defaultValues: {
            reservation_date: format(new Date(), "yyyy-MM-dd"),
            reservation_time: "12:00",
            people: 2,
        } as any,
    });

    const onSubmit = async (values: FormValues) => {
        try {
            await mutateAsync(values as any);
            toast.success("Reservation created");
            nav(`/dashboard?date=${values.reservation_date}`);
        } catch (e) {
            toast.error(String(e));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">New Reservation</h1>
            <Card className="p-2">
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label>First name</Label>
                    <Input {...register("first_name")} />
                    {errors.first_name && <p className="mt-1 text-xs text-red-600 pl-3">{errors.first_name.message}</p>}
                </div>
                <div>
                    <Label>Last name</Label>
                    <Input {...register("last_name")} />
                    {errors.last_name && <p className="mt-1 text-xs text-red-600 pl-3">{errors.last_name.message}</p>}
                </div>
                <div>
                    <Label>Mobile number</Label>
                    <Input placeholder="555-555-5555" {...register("mobile_number")} />
                    {errors.mobile_number && <p className="mt-1 text-xs text-red-600 pl-3">{errors.mobile_number.message}</p>}
                </div>
                <div>
                    <Label>People</Label>
                    <Input type="number" min={1} {...register("people")} />
                    {errors.people && <p className="mt-1 text-xs text-red-600 pl-3">{errors.people.message}</p>}
                </div>
                <div>
                    <Label>Date</Label>
                    <Input type="date" {...register("reservation_date")} />
                    {errors.reservation_date && <p className="mt-1 text-xs text-red-600 pl-3">{errors.reservation_date.message}</p>}
                </div>
                <div>
                    <Label>Time</Label>
                    <Input type="time" {...register("reservation_time")} />
                    {errors.reservation_time && <p className="mt-1 text-xs text-red-600 pl-3">{errors.reservation_time.message}</p>}
                </div>
                <div className="sm:col-span-2 flex gap-2 pt-2">
                    <Button type="submit"
                        disabled={isPending}
                        className="bg-gray-200 text-zinc-800 border-zinc-50
                            dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-700"
                    >
                        Create
                    </Button>
                    <Button type="button"
                        className="bg-gray-200 text-zinc-800 border-zinc-50
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
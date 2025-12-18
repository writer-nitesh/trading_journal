'use client'

import { Controller, useForm } from 'react-hook-form';
import { Card, CardContent } from "../ui/card"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import { useEffect, useState } from 'react';
import { createSubscriber } from '@/lib/firebase/database/subscriberAction';

const brokers = [
    { name: "Zerodha", value: "zerodha" },
    { name: "Groww", value: "groww" },
    { name: "Angel One", value: "angelone" },
    { name: "Upstox", value: "upstox" },
    { name: "Fyers", value: "fyers" },
    { name: "5paisa", value: "5paisa" },
    { name: "Shoonya", value: "shoonya" },
    { name: "ICICI Direct", value: "icici_direct" },
    { name: "HDFC Securities", value: "hdfc_securities" },
    { name: "Kotak Securities", value: "kotak_securities" },
    { name: "Dhan", value: "dhan" }
];

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    broker: z.string().min(1, { message: "Broker is required" }),
    whatsapp: z
        .string()
        .optional()
        .refine(val => !val || /^[0-9]{10}$/.test(val), {
            message: "Invalid WhatsApp number",
        }),
});

export default function SubscriberForm() {
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({ resolver: zodResolver(formSchema) });

    const [formSubmitStatus, setFormSubmitStatus] = useState(false);
    const [message, setMessage] = useState();
    const onSubmit = async (data) => {
        try {
            const response = await createSubscriber(data)
            setFormSubmitStatus(true);
            reset()
            setMessage(response.message)
            toast.success(response.message);
        } catch (error) {
            toast.error("Failed to subscribe");
        }
    };
    useEffect(() => {
        if (formSubmitStatus) {
            const timeoutId = setTimeout(() => {
                setFormSubmitStatus(false);
            }, 3000);

            return () => clearTimeout(timeoutId);

        }
    }, [formSubmitStatus]);

    useEffect(() => {
        const errorMessages = [
            errors.email?.message,
            errors.broker?.message,
            errors.whatsapp?.message,
        ].filter(Boolean);

        let timeoutId;
        errorMessages.forEach((msg, index) => {
            timeoutId = setTimeout(() => {
                toast.error(msg);
            }, index * 800);
        });

        return () => clearTimeout(timeoutId);
    }, [errors]);

    return (
        <Card className="rounded-md w-full max-w-[300px]">
            <form onSubmit={handleSubmit(onSubmit)} aria-label="Subscribe form">
                <CardContent className="flex flex-col gap-5 m-0 p-4">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        {...register("email")}
                    />
                    {errors.email && (
                        <span id="email-error" className="sr-only">
                            {errors.email.message}
                        </span>
                    )}

                    <Label htmlFor="broker">Broker</Label>
                    <Controller
                        name="broker"
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue=""

                            >
                                <SelectTrigger id="broker" aria-invalid={!!errors.broker} className="w-full">
                                    <SelectValue placeholder="Select your broker" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brokers.map((broker, index) => (
                                        <SelectItem key={index} value={broker.value}>
                                            {broker.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.broker && (
                        <span id="broker-error" className="sr-only">
                            {errors.broker.message}
                        </span>
                    )}

                    <Label htmlFor="whatsapp">WhatsApp (Optional)</Label>
                    <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="Enter WhatsApp number"
                        aria-invalid={!!errors.whatsapp}
                        aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
                        {...register("whatsapp")}
                    />
                    {errors.whatsapp && (
                        <span id="whatsapp-error" className="sr-only">
                            {errors.whatsapp.message}
                        </span>
                    )}

                    <p
                        className='text-green-500 text-xs text-center'
                    >
                        {formSubmitStatus && message}
                    </p>

                    <Button
                        type="submit"
                        className="w-full bg-[#d9ebff] text-black hover:bg-[#d9ebff] hover:text-black"
                        aria-label="Submit subscription form"
                    >
                        Submit
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}

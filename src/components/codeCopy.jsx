
'use client'
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ClipboardCopyIcon, CheckIcon } from "lucide-react"

export const CodeCopy = ({ name, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => console.error("Failed to copy text: ", err));
    };

    return (
        <Card className="rounded-md shadow-none border-none gap-0 m-0 p-0 bg-transparent">
            <CardHeader className="p-0 m-0">
                <Label>{name}</Label>
            </CardHeader>
            <CardContent className="flex gap-2 justify-center items-center m-0 p-0">
                <Input
                    id={name}
                    name={name}
                    value={value}
                    readOnly
                />

                <Button
                    type="button"
                    variant="outline"
                    className="flex gap-2 justify-center items-center"
                    onClick={handleCopy}
                >

                    {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardCopyIcon className="w-4 h-4" />}
                </Button>
            </CardContent>

        </Card>
    );
}

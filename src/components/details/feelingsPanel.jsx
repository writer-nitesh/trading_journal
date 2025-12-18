'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useGlobalState from '@/hooks/globalState';
import { updateUserDocument } from '@/lib/firebase/database/index';
import { TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { toast } from "sonner";
import { Button } from '../ui/button';
import { JournalContext } from './journalDetailsProvider';
import { trackEvent } from '../../lib/mixpanelClient';
import { parseBrokerTimestamp } from '../journal/calenderView';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function FeelingsPanel() {
    const { selectedTrade, selectedDate } = useContext(JournalContext);

    console.log("selectedTrade:--------------------", selectedDate);

    const [journalEntry, setJournalEntry] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [existingChartImage, setExistingChartImage] = useState('');
    const [imageError, setImageError] = useState('');
    const { data } = useGlobalState();

    useEffect(() => {
        const todaysDocs = data?.find((doc) => {
            const rawDate = doc.trades?.date;
            if (!rawDate || !selectedDate) return false;

            const parsedDate = parseBrokerTimestamp(rawDate);
            if (!parsedDate) return false;
            return `${new Date(parsedDate).getFullYear()}-${new Date(parsedDate).getMonth()}-${new Date(parsedDate).getDate()}` === selectedDate;
        });

        if (todaysDocs) {
            const currentdoc = todaysDocs.trades[selectedTrade];
            setJournalEntry(currentdoc?.description || '');
            setExistingChartImage(currentdoc?.chartImage || '');
            setImageError(''); // Clear any previous errors
        }
    }, [data, selectedDate, selectedTrade]);

    const todaysDocs = data?.find((doc) => {
        const rawDate = doc.trades?.date;
        if (!rawDate || !selectedDate) return false;

        const parsedDate = parseBrokerTimestamp(rawDate);
        if (!parsedDate) return false;
        return `${new Date(parsedDate).getFullYear()}-${new Date(parsedDate).getMonth()}-${new Date(parsedDate).getDate()}` === selectedDate;
    }); const docId = todaysDocs?.id;

    const validateFile = (file) => {
        if (!file) return 'No file selected';
        if (!ALLOWED_FILE_TYPES.includes(file.type)) return 'Invalid file type. Please upload a valid image file.';
        if (file.size > MAX_FILE_SIZE) return 'File size too large. Maximum size is 5MB.';
        return null;
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setImageError('');

        const error = validateFile(file);
        if (error) {
            setImageError(error);
            toast.error(error);
            return;
        }

        if (!docId) {
            const error = "No document found for selected date";
            setImageError(error);
            toast.error(error);
            return;
        }

        setUploading(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            const base64Buffer = Buffer.from(buffer).toString('base64');

            // Delete existing image via API
            if (existingChartImage) {
                try {
                    await fetch('/api/delete-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: existingChartImage }),
                    });
                } catch (err) {
                    console.error("Failed to delete existing image:", err);
                    // Continue with upload even if delete fails
                }
            }

            // Upload new image via API
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buffer: base64Buffer,
                    originalFileName: file.name,
                    contentType: file.type,
                    folderName: 'chart_images'
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            const imageUrl = data.url;

            await updateUserDocument("journal", docId, {
                [`trades.${selectedTrade}.chartImage`]: imageUrl,
                updated_at: new Date()
            });

            setExistingChartImage(imageUrl);
            setImageError('');
            toast.success("Image uploaded successfully!");
            trackEvent('chart_image_uploaded', { success: true });
        } catch (err) {
            const errorMessage = "Failed to upload image. Please try again.";
            setImageError(errorMessage);
            toast.error(errorMessage);
            console.error("Upload failed:", err);
            trackEvent('chart_image_uploaded', { success: false, error: err.message });
        } finally {
            setUploading(false);
        }
    };

    const handleSaveDescription = async () => {
        trackEvent('saved_notes');
        if (!docId) {
            toast.error("No document found for selected date");
            return;
        }

        setSaving(true);
        try {
            await updateUserDocument("journal", docId, {
                [`trades.${selectedTrade}.description`]: journalEntry,
                updated_at: new Date()
            });

            toast.success("Description saved!");

        } catch (err) {
            toast.error("Failed to save description.");
            console.error("Error saving description:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="rounded p-0 m-0 lg:h-[calc(100vh-6.3rem)]">
            <CardContent className="p-3 flex flex-col gap-4 overflow-y-auto custom-scroll">
                <input
                    id="image_upload"
                    className="hidden"
                    type="file"
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    onChange={handleFileChange}
                />

                {existingChartImage ? (
                    <label htmlFor="image_upload" className='flex flex-col gap-2 p-0 rounded cursor-pointer'>
                        <Image
                            src={existingChartImage}
                            alt="Chart"
                            className="h-64 w-full object-contain rounded border"
                            width={500}
                            height={500}
                            quality={100}
                            priority
                            onError={() => {
                                setImageError('Failed to load image');
                                setExistingChartImage('');
                            }}
                        />
                        {imageError && <div className="text-red-500 text-sm">{imageError}</div>}
                    </label>
                ) : (
                    <div className="h-64 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                        <label htmlFor="image_upload" className="text-center text-neutral-500 dark:text-neutral-400 cursor-pointer">
                            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                            <div>Click to upload chart image</div>
                            <div className="text-sm">Supported formats: JPG, PNG, GIF, WebP (max 5MB)</div>
                            {uploading && <div className="text-sm text-neutral-900 dark:text-neutral-100 mt-2">Uploading...</div>}
                            {imageError && <div className="text-red-500 text-sm mt-2">{imageError}</div>}
                        </label>
                    </div>
                )}

                <div className='flex flex-col gap-2'>
                    <Label className="text-neutral-900 dark:text-neutral-100 font-medium mb-2 block">
                        Write down your feelings 
                    </Label>
                    <Textarea
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                        placeholder="Describe your trading experience, emotions, and thoughts..."
                        className="min-h-64 border-neutral-200 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
                    />
                    <Button
                        type="button"
                        onClick={handleSaveDescription}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
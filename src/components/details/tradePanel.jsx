'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TrendingDown, Shield, Smile, Frown, Meh, Heart, Zap, Award, BookOpen, Check } from 'lucide-react'
import { JournalContext } from './journalDetailsProvider'
import { useContext, useEffect, useState } from 'react'
import { calculateDetails } from '@/lib/logic'
import { updateUserDocument } from '@/lib/firebase/database/index'
import { toast } from "sonner";
import useGlobalState from '@/hooks/globalState'
import { trackEvent } from '../../lib/mixpanelClient';
import { parseBrokerTimestamp } from '../journal/calenderView'

const tradeSchema = z.object({
    stop_loss_price: z.coerce.number().min(0),
    target_price: z.coerce.number().min(0),
    feelings: z.string().optional(),
})

const inputFields = [
    { label: 'Entry price', name: 'entry_price', editable: false },
    { label: 'Exit price', name: 'exit_price', editable: false },
    { label: 'Quantity', name: 'quantity', editable: false },
    { label: 'Stop loss price', name: 'stop_loss_price', editable: true },
    { label: 'Target price', name: 'target_price', editable: true },
    { label: 'Reward : Risk', name: 'reward_risk', editable: false },
]

const feelings = [
    { id: 'calm', label: 'Calm', icon: Smile, color: 'text-green-600' },
    { id: 'overconfident', label: 'Over confident', icon: Zap, color: 'text-yellow-600' },
    { id: 'nervous', label: 'Nervous', icon: Frown, color: 'text-blue-600' },
    { id: 'confused', label: 'Confused', icon: Meh, color: 'text-purple-600' },
    { id: 'revenge', label: 'Revenge mode', icon: TrendingDown, color: 'text-red-600' },
    { id: 'happy', label: 'Happy', icon: Heart, color: 'text-pink-600' },
    { id: 'fear', label: 'Fear', icon: Shield, color: 'text-orange-600' },
    { id: 'lettinggo', label: 'Letting go', icon: Smile, color: 'text-cyan-600' },
    { id: 'hardwork', label: 'Hard work paid off', icon: Award, color: 'text-indigo-600' },
    { id: 'wanttolearn', label: 'Want to learn', icon: BookOpen, color: 'text-emerald-600' },
]

// Updated Checkbox component to handle event bubbling
export function Checkbox({ checked = false, onChange, label, className = "" }) {
    const handleClick = (event) => {
        // Prevent event bubbling to parent container
        event.stopPropagation();
        onChange?.(!checked);
    };

    return (
        <div
            className={`flex items-center cursor-pointer select-none ${className}`}
            onClick={handleClick}
        >
            <div
                className={`
                        w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all duration-200
                        ${checked
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-neutral-300 bg-white hover:border-blue-400 dark:border-neutral-600 dark:bg-neutral-800'
                    }
                    `}
            >
                {checked && <Check className="w-3 h-3" />}
            </div>
            {label && (
                <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                    {label}
                </span>
            )}
        </div>
    );
}

export default function TradePanel() {

    const { todaysTrade, selectedTrade, selectedDate } = useContext(JournalContext);
    const [currentTrade, setCurrentTrade] = useState();
    const [initialAttributes, setInitialAttributes] = useState();
    const { data } = useGlobalState();

    // Update to use todaysTrade directly since it now contains all trade data
    useEffect(() => {
        if (todaysTrade && selectedTrade) {
            console.log("*****************", todaysTrade[selectedTrade]);


            setCurrentTrade(todaysTrade[selectedTrade]);
        } else {
            setCurrentTrade(null);
        }
    }, [selectedTrade, todaysTrade]);



    useEffect(() => {
        if (currentTrade && currentTrade.orders) {
            const calcs = calculateDetails(currentTrade.orders);
            console.log("*****************", calcs);
            console.log("*****************", currentTrade.orders);

            setInitialAttributes(calcs || {
                entry_price: 0,
                exit_price: 0,
                quantity: 0,
                pnl: 0
            });
        } else {
            setInitialAttributes({
                entry_price: 0,
                exit_price: 0,
                quantity: 0,
                pnl: 0
            });
        }
    }, [currentTrade]);



    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(tradeSchema),
        mode: 'onBlur',
        defaultValues: {
            stop_loss_price: 0,
            target_price: 0,
            feelings: '',
        }
    })

    const watchedValues = watch()
    const [rewardToRisk, setRewardToRisk] = useState('')

    // Set form values when trade data changes - FIXED
    useEffect(() => {
        if (currentTrade) {
            // Get the values from currentTrade, not todaysDocs
            const stopLossValue = currentTrade.stop_loss || 0;
            const targetPriceValue = currentTrade.target_price || 0;
            const feelingsValue = currentTrade.feelings || '';

            console.log('Setting form values:', {
                stop_loss_price: stopLossValue,
                target_price: targetPriceValue,
                feelings: feelingsValue
            });

            // Use reset instead of setValue to properly update the form
            reset({
                stop_loss_price: stopLossValue,
                target_price: targetPriceValue,
                feelings: feelingsValue
            });
        }
    }, [currentTrade, reset]); // Added reset to dependencies

    // Live Reward:Risk Update - Fixed calculation with stop loss validation
    useEffect(() => {
        const stopLoss = parseFloat(watchedValues.stop_loss_price) || 0
        const entry = initialAttributes?.entry_price || 0
        const exit = initialAttributes?.exit_price || 0

        // Get transaction type from first order
        const transactionType = currentTrade?.orders?.[0]?.transaction_type

        // Validate stop loss based on transaction type with precise comparison
        if (transactionType === "BUY") {
            if (stopLoss > entry) {
                setRewardToRisk(errors.stop_loss_price ? 'Invalid SL' : '—');
                return;
            }
        } else if (transactionType === "SELL") {
            if (stopLoss < entry) {
                setRewardToRisk(errors.stop_loss_price ? 'Invalid SL' : '—');
                return;
            }
        }

        if (entry > 0 && stopLoss > 0) {
            const reward = Math.abs(exit - entry)
            const risk = Math.abs(entry - stopLoss)

            if (risk > 0) {
                // Use more precise calculation without rounding
                const ratio = reward / risk;
                setRewardToRisk(ratio.toFixed(2))
            } else {
                setRewardToRisk('∞') // Infinite reward if no risk
            }
        } else {
            setRewardToRisk('—')
        }
    }, [watchedValues.stop_loss_price, initialAttributes, currentTrade])

    const onSubmit = async (formData) => {
        trackEvent('saved_emotions'); 
        try {
            // Get the current document that matches the selected date
            const todaysDocs = data?.find((doc) => {
                const rawDate = doc.trades?.date;
                if (!rawDate || !selectedDate) return false;

                const parsedDate = parseBrokerTimestamp(rawDate);
                if (!parsedDate) return false;
            return `${new Date(parsedDate).getFullYear()}-${new Date(parsedDate).getMonth()}-${new Date(parsedDate).getDate()}` === selectedDate;
            });

            const docId = todaysDocs?.id;

            if (!docId) {
                console.error("Document ID not found");
                return;
            }

            if (!selectedTrade) {
                console.error("No trade selected");
                return;
            }

            const transactionType = currentTrade?.orders?.[0]?.transaction_type;
            const entry = initialAttributes?.entry_price || 0;
            const stopLoss = formData.stop_loss_price;

            if (!stopLoss == 0) {
                  if (transactionType === "BUY") {
                if (stopLoss > entry || stopLoss ==0) {
                    toast.error("Stop loss cannot be higher than entry price for BUY orders");
                    return;
                }
            } else if (transactionType === "SELL") {
                if (stopLoss < entry || stopLoss ==0) {
                    toast.error("Stop loss cannot be lower than entry price for SELL orders");
                    return;
                }
            }
            }

          

            // Update payload with the correct path
            const updatePayload = {
                [`trades.${selectedTrade}.stop_loss`]: formData.stop_loss_price,
                [`trades.${selectedTrade}.target_price`]: formData.target_price,
                [`trades.${selectedTrade}.feelings`]: formData.feelings || '',
                updated_at: new Date()
            };

            console.log('Update payload:', updatePayload);

            // Update document using Firestore
            await updateUserDocument('journal', docId, updatePayload);
            toast.success('Trade updated successfully');
            

        } catch (error) {
            toast.error('Failed to update trade');
            console.error("🔥 Error updating trade:", error);
        }
    };

    const toggleFeeling = (feelingId) => {
        const current = getValues('feelings')
        // If the feeling is already selected, unselect it
        if (current === feelingId) {
            setValue('feelings', '', { shouldDirty: true })
        } else {
            // Otherwise, select the new feeling
            setValue('feelings', feelingId, { shouldDirty: true })
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="rounded flex flex-col lg:h-[calc(100vh-6.3rem)] p-0">
                    <CardContent className="space-y-4 flex-1 overflow-y-auto custom-scroll p-4">
                        <CardHeader className="p-0 m-0">
                            <div className="flex items-center justify-between">
                                <div className='flex gap-2'>
                                    <span className='font-bold'>P/L</span>
                                    <span>{initialAttributes?.pnl?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div>{currentTrade?.orders?.[0]?.tradingsymbol || 'N/A'}</div>
                            </div>
                        </CardHeader>

                        <div className="flex flex-col gap-2 mt-1">
                            {inputFields.map((input) => {
                                let fieldValue = '';

                                if (input.name === 'reward_risk') {
                                    fieldValue = rewardToRisk;
                                } else if (input.name === 'stop_loss_price') {
                                    fieldValue = watchedValues.stop_loss_price || 0;
                                } else if (input.name === 'target_price') {
                                    fieldValue = watchedValues.target_price || 0;
                                } else {
                                    fieldValue = initialAttributes?.[input.name] || '';
                                }

                                return (
                                    <div key={input.name} className="flex gap-1 justify-between">
                                        <Label>{input.label}</Label>
                                        <div className="flex flex-col">
                                            <Input
                                                type="number"
                                                placeholder={input.name === "reward_risk" ? '—' : `Enter ${input.label.toLowerCase()}`}
                                                className="w-48"
                                                readOnly={!input.editable}
                                                step="0.01"
                                                {...(input.editable
                                                    ? register(input.name)
                                                    : {
                                                        value: fieldValue,
                                                        disabled: true,
                                                    })}

                                            />
                                            {errors[input.name] && input.editable && (
                                                <span className="text-red-500 text-xs mt-1">
                                                    {errors[input.name]?.message}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <Label className="pt-2">Describe how you are feeling</Label>
                        <div className="grid grid-cols-2 gap-1 mb-4">
                            {feelings.map((feeling) => {
                                const Icon = feeling.icon
                                const selected = watchedValues.feelings === feeling.id

                                return (
                                    <div
                                        key={feeling.id}
                                        onClick={() => toggleFeeling(feeling.id)}
                                        className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-colors ${selected
                                            ? 'bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600'
                                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50 border border-transparent'
                                            }`}
                                    >
                                        <Checkbox
                                            checked={selected}
                                            onChange={() => toggleFeeling(feeling.id)}
                                        />
                                        <Icon className={`w-4 h-4 ${feeling.color}`} />
                                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                            {feeling.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        <button
                            type="submit"
                            className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-neutral-800 transition-colors"
                        >
                            Save
                        </button>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
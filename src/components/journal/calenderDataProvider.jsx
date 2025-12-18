import { getWeekDates } from '@/lib/dateCalculator'
import { getDataForDate } from '@/lib/logic'
import { createContext, useEffect, useMemo, useState } from 'react'

export const CalenderContext = createContext()

export function CalenderDataProvider({  children }) {
    const [weekOffset, setWeekOffset] = useState(0)
    const weekData = useMemo(() => getWeekDates(weekOffset), [weekOffset])
    const [openDialog, setOpenDialog] = useState(false);


    return (
        <CalenderContext.Provider value={{  weekOffset, setWeekOffset, weekData, openDialog, setOpenDialog }}>
            {children}
        </CalenderContext.Provider>
    )
}

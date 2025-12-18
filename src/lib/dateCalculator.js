export function getWeekDates(weekOffset = 0) {
    // Get current time in IST
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    const dayOfWeek = nowIST.getDay(); // 0 = Sunday, 1 = Monday...
    const diffToMonday = (dayOfWeek + 6) % 7;

    // Calculate IST-based Monday
    const monday = new Date(nowIST);
    monday.setDate(nowIST.getDate() - diffToMonday + (weekOffset * 7));

    const dates = [];

    for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        // Make sure each date stays in IST
        const istDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        dates.push(istDate);
    }

    const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', {
            month: 'long',
            day: 'numeric'
        });
    };

    const title = `${formatDate(dates[0])} - ${formatDate(dates[4])}`;

    return {
        title,
        dates,
        weekOffset
    };
}



export const isDateToday = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return today.getTime() === checkDate.getTime();
};

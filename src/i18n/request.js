import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

async function getLocale() {
    const cookieLocale = (await cookies()).get('locale')?.value;

    const locale = cookieLocale || 'en';

    return {
        locale,
        messages: (await import(`../dictionaries/${locale}.json`)).default
    };
}

export default getRequestConfig(getLocale);
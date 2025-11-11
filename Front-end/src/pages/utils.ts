export function shortString(str: string | null | undefined, length: number): string {
    if (!str) return '';
    if (str.length <= length) {
        return str;
    }
    return str.substring(0, length) + '...';
}

export function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}
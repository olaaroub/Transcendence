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

export function formatMessageTime(dateString: string): string {
    let date = new Date(dateString);
    if (dateString && !dateString.includes('Z') && !dateString.includes('+') && !/\d{2}:\d{2}:\d{2}-\d{2}/.test(dateString)) {
        date = new Date(dateString + 'Z');
    }
    return date.toLocaleTimeString(navigator.language || 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
export function shortString(str: string | null | undefined, length: number): string {
    if (!str) return '';
    if (str.length <= length) {
        return str;
    }
    return str.substring(0, length) + '...';
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

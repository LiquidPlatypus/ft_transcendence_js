

export function isValidString(str: string): boolean {
    return /^[a-zA-Z0-9_-]{1,15}$/.test(str);
}
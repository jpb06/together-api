export function isDateValid(
    date: Date
): boolean {
    return (date.toString() !== 'Invalid Date');
}

export function containsHex(
    data: string,
    expectedLength: number
) {
    return data.match('^[0-9A-Fa-f]{' + expectedLength + '}$');
}
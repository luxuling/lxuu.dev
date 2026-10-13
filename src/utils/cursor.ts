export const encodeCursor = (date: Date) => btoa(date.toISOString());

export const decodeCursor = (cursor: string) => new Date(atob(cursor));

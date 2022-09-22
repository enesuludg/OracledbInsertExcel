import dotenv from 'dotenv';
dotenv.config();

export const user =process.env.USER || 'Admin';
export const password =process.env.PASSWORD || 'i^pI';
export const connectionString=process.env.CONNECTION_STRING   || '';


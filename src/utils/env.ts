type Env = 'development' | 'production' | 'test'
export const ENV = process.env.NODE_ENV as Env ?? 'production';

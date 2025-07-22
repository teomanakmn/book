import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Node.js global tanımlamaları
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      PORT: string;
      DATABASE_URL: string;
      GOOGLE_BOOKS_API_KEY?: string;
      NODE_ENV?: string;
    }
  }
  
  var process: {
    env: NodeJS.ProcessEnv;
    exit: (code?: number) => never;
  };
}
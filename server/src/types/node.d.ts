// Node.js global tanımlamaları
declare global {
  var process: {
    env: {
      [key: string]: string | undefined;
      JWT_SECRET: string;
      PORT: string;
      DATABASE_URL: string;
      GOOGLE_BOOKS_API_KEY?: string;
      NODE_ENV?: string;
    };
    exit: (code?: number) => never;
    on: (event: string, listener: (...args: any[]) => void) => any;
  };
  
  var require: (id: string) => any;
  var __dirname: string;
  var __filename: string;
}

export {};
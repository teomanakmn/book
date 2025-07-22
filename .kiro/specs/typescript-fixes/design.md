# Design Document

## Overview

Bu tasarım belgesi, Kitap Kayıt uygulamasının Render platformunda yaşanan TypeScript derleme hatalarını çözmek için gerekli değişiklikleri detaylandırmaktadır. Hatalar, TypeScript yapılandırması, tip tanımlamaları ve Express.js entegrasyonu ile ilgili sorunlardan kaynaklanmaktadır.

## Sorun Analizi

Render platformunda alınan TypeScript derleme hataları şunlardır:

1. `Parameter 'res' implicitly has an 'any' type` - Express yanıt nesnesi için tip tanımlaması eksik
2. `Cannot find name 'console'` - DOM kütüphanesi eksik
3. `Property 'body' does not exist on type 'AuthRequest'` - AuthRequest interface'i Express.Request özelliklerini genişletmiyor
4. `Property 'params' does not exist on type 'AuthRequest'` - AuthRequest interface'i Express.Request özelliklerini genişletmiyor

## Çözüm Yaklaşımı

### 1. TypeScript Yapılandırması Güncellemesi

`tsconfig.json` dosyasında aşağıdaki değişiklikler yapılacaktır:

1. `lib` dizisine `"DOM"` eklenecek, böylece `console` gibi DOM API'leri kullanılabilir olacak
2. `noImplicitAny` ayarı `false` olarak değiştirilebilir veya Express tip tanımlamaları düzgün şekilde kullanılacak

### 2. AuthRequest Interface Güncellemesi

`AuthRequest` interface'i, Express.js `Request` tipini doğru şekilde genişletecek şekilde güncellenecektir:

```typescript
export interface AuthRequest extends Request {
  userId?: string;
  // Express.Request'in tüm özelliklerini içerir (body, params, query, etc.)
}
```

### 3. Tip Tanımlamalarının Yüklenmesi

Express.js için tip tanımlamaları yüklenecek ve doğru şekilde yapılandırılacaktır:

```bash
npm i --save-dev @types/express
```

### 4. Build ve Deploy Scriptlerinin Güncellenmesi

`package.json` dosyasındaki build ve start scriptleri, Render platformunda sorunsuz çalışacak şekilde güncellenecektir.

## Teknik Detaylar

### tsconfig.json Güncellemesi

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": false,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": false,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": false
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts"
  ]
}
```

### AuthRequest Interface Güncellemesi

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Mevcut kod
};
```

### package.json Güncellemesi

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc && npx prisma generate",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:deploy": "prisma migrate deploy"
  }
}
```

## Alternatif Çözümler

1. **Tip Tanımlaması Oluşturma**: Eğer `@types/express` paketi sorun çıkarırsa, özel bir tip tanımlaması dosyası oluşturulabilir:

```typescript
// src/types/express.d.ts
declare module 'express' {
  export interface Request {
    userId?: string;
  }
}
```

2. **TypeScript Yapılandırmasını Gevşetme**: Daha az katı TypeScript kuralları kullanılabilir, ancak bu tip güvenliğini azaltır ve önerilmez.

## Test Stratejisi

1. Yerel ortamda TypeScript derleme işlemini test et:
   ```bash
   npm run build
   ```

2. Render platformunda dağıtım öncesi test et:
   ```bash
   npm run build && npm start
   ```

3. API endpoint'lerini test et ve hataların çözüldüğünü doğrula.
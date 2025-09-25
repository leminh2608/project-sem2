# Chuẩn Lập Trình Next.js - Hướng Dẫn Toàn Diện

## 📋 Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Cấu trúc Dự án](#2-cấu-trúc-dự-án)
3. [Quy tắc Đặt tên](#3-quy-tắc-đặt-tên)
4. [Nguyên tắc Clean Code](#4-nguyên-tắc-clean-code)
5. [Backend Standards](#5-backend-standards)
6. [Frontend Standards](#6-frontend-standards)
7. [Best Practices](#7-best-practices)
8. [Bảo mật](#8-bảo-mật)
9. [Performance](#9-performance)

---

## 1. Giới thiệu

Tài liệu này định nghĩa các quy tắc và chuẩn lập trình cho dự án Next.js, áp dụng cho cả Backend và Frontend. Việc tuân thủ các quy tắc này đảm bảo:

- **Nhất quán**: Mã nguồn có phong cách thống nhất
- **Dễ đọc**: Code dễ hiểu và bảo trì
- **Tái sử dụng**: Components và functions có thể sử dụng lại
- **Mở rộng**: Dễ dàng thêm tính năng mới
- **Chất lượng**: Giảm thiểu bugs và lỗi

---

## 2. Cấu trúc Dự án

### 2.1 Cấu trúc Thư mục Chi tiết

Dự án tuân theo cấu trúc tiêu chuẩn của Next.js App Router, được mở rộng để tối ưu cho việc quản lý và bảo trì. Dưới đây là cấu trúc chi tiết và giải thích chức năng của từng thư mục:

```plaintext
src/
├── app/                    # Next.js App Router - Quản lý routing và pages
│   ├── (dashboard)/        # Route Group cho các trang cần layout dashboard
│   │   ├── inventory/      # Trang quản lý kho
│   │   │   └── page.tsx
│   │   └── page.tsx        # Trang dashboard chính
│   ├── api/                # API Routes (Backend)
│   │   └── auth/           # API liên quan đến authentication
│   │       ├── login/
│   │       │   └── route.ts
│   │       └── register/
│   │           └── route.ts
│   ├── login/              # Trang đăng nhập
│   │   └── page.tsx
│   ├── layout.tsx          # Layout gốc của ứng dụng
│   └── page.tsx            # Trang chủ
│
├── components/             # React Components (Frontend)
│   ├── features/           # Components phức tạp, theo tính năng nghiệp vụ
│   │   ├── dashboard/
│   │   │   └── stat-card.tsx
│   │   └── inventory/
│   │       └── add-item-form.tsx
│   ├── layout/             # Components cấu trúc layout (Sidebar, Navbar)
│   │   └── dashboard/
│   │       └── dashboard-side-panel.tsx
│   ├── shared/             # Components dùng chung, không thuộc UI kit
│   │   └── theme-switcher.tsx
│   └── ui/                 # UI primitives, "dumb" components (tái sử dụng cao)
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
│
├── contexts/               # React Contexts - Quản lý global state
│   ├── auth-context.tsx
│   └── theme-context.tsx
│
├── hooks/                  # Custom React Hooks
│   ├── use-accessibility.ts
│   └── use-media-query.ts
│
├── lib/                    # Utilities, helpers và configurations
│   ├── mongodb.ts          # Cấu hình kết nối MongoDB
│   ├── utils.ts            # Các hàm tiện ích chung (ví dụ: cn())
│   └── themes.ts           # Cấu hình themes
│
├── models/                 # Mongoose Models (Backend)
│   ├── User.ts
│   └── Role.ts
│
├── services/               # Business logic (Backend)
│   └── auth.service.ts
│
├── types/                  # TypeScript type definitions
│   ├── components.ts
│   ├── hooks.ts
│   └── index.ts
│
└── middleware.ts           # Next.js middleware (ví dụ: authentication)
```

### 2.2 Giải thích Chi tiết

- **`app/`**: Chứa tất cả các routes của ứng dụng. Mỗi thư mục con tương ứng với một URL segment.
    - **`(dashboard)/`**: Route group, dùng để áp dụng một layout chung (`layout.tsx`) cho tất cả các trang bên trong mà không ảnh hưởng đến URL.
    - **`api/`**: Chứa tất cả các API endpoints của backend. Mỗi `route.ts` định nghĩa một endpoint.
    - **`page.tsx`**: File chính để render UI cho một route.
    - **`layout.tsx`**: File định nghĩa layout chung cho một route và các route con của nó.

- **`components/`**: Chứa tất cả các React components, được phân loại như sau:
    - **`ui/`**: Các components UI cơ bản, tái sử dụng cao, không chứa business logic (ví dụ: `button`, `card`, `input`).
    - **`shared/`**: Các components dùng chung trong dự án, có thể chứa một ít logic (ví dụ: `theme-switcher`).
    - **`layout/`**: Các components cấu thành layout chính của trang (ví dụ: `sidebar`, `navbar`, `dashboard-layout`).
    - **`features/`**: Các components phức tạp, gắn liền với một tính năng nghiệp vụ cụ thể (ví dụ: `add-item-form`, `stat-card`).

- **`contexts/`**: Chứa các React Contexts để quản lý global state, ví dụ như `auth-context` để quản lý trạng thái đăng nhập của người dùng.

- **`hooks/`**: Chứa các custom React Hooks để tái sử dụng logic stateful, ví dụ `use-media-query` để xử lý responsive.

- **`lib/`**: Chứa các hàm tiện ích, cấu hình và các module không phải là React components. Ví dụ: `utils.ts` chứa hàm `cn` để merge class, `mongodb.ts` để quản lý kết nối database.

- **`models/`**: (Backend) Chứa các Mongoose models, định nghĩa schema cho các collections trong MongoDB.

- **`services/`**: (Backend) Chứa business logic của ứng dụng. Các API routes sẽ gọi đến các services này để xử lý nghiệp vụ.

- **`types/`**: Chứa các định nghĩa TypeScript (interfaces, types) dùng chung cho toàn bộ dự án.

- **`middleware.ts`**: File middleware của Next.js, dùng để xử lý request trước khi nó đến được page hoặc API route (ví dụ: kiểm tra authentication).

### 2.2 Nguyên tắc Tổ chức

#### **Separation of Concerns (Tách biệt Trách nhiệm)**
- **`/app/api/`**: Chỉ chứa API routes (Controllers)
- **`/services/`**: Chứa toàn bộ business logic
- **`/models/`**: Định nghĩa database schemas
- **`/components/`**: UI components được phân loại rõ ràng

#### **Feature-based Organization**
```
components/
├── features/
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── inventory/        # Inventory management components
```

#### **Atomic Design cho UI Components**
```
components/ui/
├── atoms/               # Basic elements (Button, Input)
├── molecules/           # Simple combinations (FormField)
└── organisms/           # Complex components (DataTable)
```

---

## 3. Quy tắc Đặt tên

### 3.1 Files và Folders

| Loại | Convention | Ví dụ thực tế trong dự án |
|------|------------|-------|
| **UI Components** | kebab-case | `button.tsx`, `data-table.tsx`, `form-field.tsx` |
| **Feature Components** | kebab-case | `stat-card.tsx`, `add-item-form.tsx` |
| **Pages** | page.tsx | `(dashboard)/page.tsx`, `login/page.tsx` |
| **API Routes** | route.ts | `auth/login/route.ts` |
| **Services** | kebab-case + .service | `auth.service.ts` |
| **Models** | PascalCase | `User.ts`, `Role.ts` |
| **Hooks** | kebab-case + use- | `use-accessibility.ts`, `use-media-query.ts` |
| **Contexts** | kebab-case + -context | `auth-context.tsx`, `theme-context.tsx` |
| **Utils/Lib** | kebab-case | `mongodb.ts`, `utils.ts`, `themes.ts` |
| **Types** | kebab-case | `components.ts`, `hooks.ts`, `theme.ts` |

### 3.2 Variables và Functions

- **Variables**: camelCase - `userName`, `isAuthenticated`, `currentUser`
- **Functions**: camelCase - `fetchUserData()`, `validateEmail()`, `handleSubmit()`
- **Boolean variables**: Prefix với is/has/can - `isLoading`, `hasPermission`, `canEdit`

### 3.3 Constants

- **Global constants**: UPPER_SNAKE_CASE - `API_BASE_URL`, `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE`
- **Local constants**: camelCase - `defaultOptions`, `initialState`

### 3.4 Interfaces, Types & Module Exports

#### **TypeScript Naming**
- **Interfaces**: PascalCase với prefix I - `IUser`, `IProduct`, `IApiResponse`
- **Types**: PascalCase - `UserRole`, `ComponentState`, `ApiResponse<T>`
- **Props interfaces**: ComponentName + Props - `StatCardProps`, `AddItemFormProps`

#### **Export/Import Patterns**
**✅ ĐÚNG - Consistent export patterns**:
```typescript
// models/User.ts
export interface IUser extends Document { ... }
export const User = mongoose.model<IUser>('User', UserSchema)

// services/user.service.ts
export const userService = {
  async createUser(data: CreateUserData): Promise<IUser> { ... }
}

// components/ui/button.tsx
export function Button(props: ButtonProps) { ... }
export type { ButtonProps }

// types/index.ts - Central type exports
export type { IUser, IProduct } from '@/models'
export type { UserFormData, ProductFormData } from './forms'
```

**❌ SAI - Inconsistent patterns**:
```typescript
// Tránh mixed default/named exports
export default function Button() { ... }
export const ButtonVariants = { ... } // Confusing!

// Tránh export * without re-export
export * from './user' // Không rõ ràng
```

### 3.5 Component Naming

- **UI Components**: Descriptive, PascalCase - `button`, `data-table`, `form-field`
- **Feature Components**: Feature + Purpose - `stat-card`, `add-item-form`, `user-profile`
---

## 4. Nguyên tắc Clean Code

### 4.1 Formatting và Indentation

#### **Formatting Standards**

- **Indentation**: 2 spaces (không dùng tabs)
- **Quotes**: Single quotes cho strings, template literals cho interpolation
- **Trailing commas**: Luôn sử dụng trong objects và arrays
- **Semicolons**: Luôn sử dụng để kết thúc statements

#### **Import Organization & TypeScript Module Resolution**

**Thứ tự imports theo quy tắc nghiêm ngặt**:
1. **React & Next.js** - Core framework imports
2. **Third-party libraries** - External dependencies
3. **Internal modules** - Components, services, utils với absolute paths (@/)
4. **Type-only imports** - Sử dụng `import type` keyword
5. **Relative imports** - Chỉ cho files trong cùng thư mục
6. **CSS imports** - Luôn đặt cuối cùng

**✅ ĐÚNG - Proper import order**:
```typescript
// 1. React & Next.js
import React, { useState, useEffect } from 'react'
import { NextRequest, NextResponse } from 'next/server'

// 2. Third-party libraries
import mongoose from 'mongoose'
import { z } from 'zod'
import { clsx } from 'clsx'

// 3. Internal modules with @ alias
import { Button } from '@/components/ui/button'
import { connectDB } from '@/lib/mongodb'
import { userService } from '@/services/user.service'

// 4. Type-only imports
import type { IUser } from '@/models/User'
import type { ComponentProps } from 'react'

// 5. Relative imports (same folder only)
import { validateForm } from './utils'

// 6. CSS imports
import './component.css'
```

**❌ SAI - Problematic import patterns**:
```typescript
// Tránh relative imports cho cross-folder
import { Button } from '../../../components/ui/button'

// Tránh mixed import styles
import Button, { ButtonProps } from './button' // Confusing!

// Tránh import không cần thiết
import * as React from 'react' // Chỉ import những gì cần
```

### 4.2 Function Guidelines

#### **Function Size & Responsibility**
- **Tối đa 20-30 dòng** cho một function
- **Single Responsibility**: Một function chỉ làm một việc duy nhất
- **Descriptive naming**: Tên function phải mô tả rõ chức năng và kết quả

#### **Parameter Guidelines & TypeScript Strict Typing**
- **Tối đa 3-4 parameters** cho một function
- **Sử dụng object** khi có nhiều hơn 4 parameters
- **Optional parameters** đặt cuối cùng hoặc sử dụng object với optional properties
- **Type safety**: Luôn định nghĩa types cho parameters và return values
- **Avoid `any` type**: Sử dụng specific types hoặc generic types

**✅ ĐÚNG - Strict TypeScript function**:
```typescript
interface CreateUserOptions {
  name: string
  email: string
  role?: 'admin' | 'user'
  sendWelcomeEmail?: boolean
}

async function createUser(options: CreateUserOptions): Promise<IUser> {
  const { name, email, role = 'user', sendWelcomeEmail = true } = options

  // Implementation with proper error handling
  if (!name || !email) {
    throw new ValidationError('Name and email are required')
  }

  // Return typed result
  return await userService.create({ name, email, role })
}
```

**❌ SAI - Loose typing**:
```typescript
// Tránh any type
function createUser(data: any): any { ... }

// Tránh quá nhiều parameters
function createUser(name: string, email: string, role: string, active: boolean, department: string, manager: string) { ... }
```

### 4.3 Comment Guidelines

#### **Nguyên tắc Comment**
- **Giải thích WHY, không phải WHAT**: Comment nên giải thích lý do, không phải mô tả code làm gì
- **Business logic phức tạp**: Comment cho các tính toán, thuật toán phức tạp
- **Tránh comment rõ ràng**: Không comment những gì code đã thể hiện rõ ràng
- **Cập nhật comment**: Luôn cập nhật comment khi thay đổi code

#### **JSDoc cho Public Functions**
Sử dụng JSDoc cho:
- Public APIs và exported functions
- Complex business logic functions
- Functions với nhiều parameters
- Functions có thể throw errors

Format: `@param`, `@returns`, `@throws`, `@example`

### 4.4 Error Handling Patterns

#### **Custom Error Classes & TypeScript Error Handling**
Tạo các custom error classes để xử lý lỗi một cách nhất quán:

**✅ ĐÚNG - Typed error classes**:
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}
```

#### **Error Handling Strategy**
- **Services**: Throw specific typed errors với thông tin chi tiết
- **API Routes**: Catch errors và trả về consistent response format
- **Frontend**: Handle errors với user-friendly messages và proper types
- **Logging**: Log errors với structured data để debug và monitoring

**✅ ĐÚNG - API error handling**:
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/services/user.service'
import { ValidationError, NotFoundError } from '@/lib/errors'

export async function GET(req: NextRequest) {
  try {
    const users = await userService.getAllUsers()
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      )
    }

    // Log unexpected errors
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 4.5. TypeScript Compilation & Common Issues

### 4.5.1 Module Resolution Problems

#### **Cannot find module '@/...' errors**

**Nguyên nhân phổ biến**:
1. File không tồn tại tại đường dẫn được import
2. Export/import pattern không khớp
3. TypeScript path mapping không đúng
4. Circular dependencies

**✅ Solutions**:

**1. Kiểm tra file existence và exports**:
```typescript
// ❌ File src/models/User.ts không tồn tại
import { User } from '@/models/User'

// ✅ Tạo file và export đúng
// src/models/User.ts
export const User = mongoose.model<IUser>('User', UserSchema)
export type { IUser }
```

**2. Consistent export patterns**:
```typescript
// ❌ Mixed export patterns
export default User
export const UserSchema = ...

// ✅ Consistent named exports
export const User = ...
export const UserSchema = ...
export type { IUser }
```

**3. Check tsconfig.json paths**:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/models/*": ["./src/models/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### 4.5.2 Circular Dependencies

**❌ Problematic pattern**:
```
services/user.service.ts → models/User.ts → services/user.service.ts
```

**✅ Solution - Extract shared types**:
```typescript
// types/user.ts
export interface IUser {
  _id: string
  email: string
  name: string
}

export interface CreateUserData {
  email: string
  name: string
  password: string
}

// models/User.ts
import type { IUser } from '@/types/user'
export const User = mongoose.model<IUser>('User', UserSchema)

// services/user.service.ts
import type { IUser, CreateUserData } from '@/types/user'
import { User } from '@/models/User'
```

### 4.5.3 Type-only Imports

**✅ Use `import type` for type-only imports**:
```typescript
// For types and interfaces
import type { IUser } from '@/models/User'
import type { ComponentProps } from 'react'

// For runtime values
import { User } from '@/models/User'
import { useState } from 'react'
```

---

## 5. Backend Standards

### 5.1 Cấu trúc API Routes

#### **Luồng xử lý Request**
```
Client Request → Middleware → API Route → Service → Model → Database
                                ↓
Client Response ← API Route ← Service ← Model ← Database
```

#### **API Route Structure**
API Routes tuân theo pattern:
1. **Validation**: Kiểm tra dữ liệu đầu vào
2. **Service Call**: Gọi business logic từ service layer
3. **Response**: Trả về dữ liệu với status code phù hợp
4. **Error Handling**: Xử lý lỗi và trả về error response

```typescript
// Ví dụ đơn giản: src/app/api/users/[id]/route.ts
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Kiểm tra tham số đầu vào
    if (!params.id) {
      return NextResponse.json({ message: 'ID người dùng là bắt buộc' }, { status: 400 });
    }

    // Gọi service để xử lý logic
    const user = await userService.getUserById(params.id);

    // Trả về kết quả
    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    // Xử lý lỗi thống nhất
    return handleApiError(error);
  }
}
```

### 5.2 Service Layer Standards

#### **Service Function Structure**
Service functions chứa business logic chính và tuân theo pattern:
1.  **Kết nối Database**: `await connectDB()` ở đầu mỗi function.
2.  **Validation**: Kiểm tra dữ liệu đầu vào và throw `ValidationError` nếu không hợp lệ.
3.  **Business Logic**: Thực hiện các thao tác nghiệp vụ, tương tác với Models.
4.  **Error Handling**: Throw `NotFoundError`, `AppError` khi có lỗi nghiệp vụ.
5.  **Return Data**: Trả về dữ liệu đã được xử lý.

```typescript
// Ví dụ: src/services/user.service.ts
/**
 * Lấy thông tin người dùng theo ID
 * @param id - ID của người dùng
 * @returns Thông tin người dùng
 * @throws {ValidationError} Nếu ID không hợp lệ
 * @throws {NotFoundError} Nếu không tìm thấy người dùng
 */
export const getUserById = async (id: string): Promise<IUser> => {
  await connectDB();

  if (!id) {
    throw new ValidationError('ID người dùng là bắt buộc');
  }

  const user = await User.findById(id).populate('role', 'name');

  if (!user) {
    throw new NotFoundError('Người dùng');
  }

  return user;
};
```

### 5.3 Model Standards

#### **Mongoose Model Structure**
Models định nghĩa cấu trúc dữ liệu và business rules cho database:

**Interface Definition**: Định nghĩa TypeScript interface cho type safety
**Schema Definition**: Tạo Mongoose schema với validation rules
**Indexes**: Thêm indexes cho các trường thường xuyên query
**Virtuals**: Tạo computed fields không lưu trong database
**Middleware**: Pre/post hooks cho validation và data transformation
**Model Export**: Export model với fallback cho Next.js hot reload

```typescript
// ✅ ĐÚNG - Proper TypeScript model with interface
// src/models/Product.ts
import mongoose, { Document, Schema } from 'mongoose'

// Define interface first
export interface IProduct extends Document {
  name: string
  sku: string
  price: number
  quantity: number
  category: 'electronics' | 'clothing' | 'food' | 'books' | 'other'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Create typed schema
const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    maxlength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU là bắt buộc'],
    unique: true,
    uppercase: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Giá là bắt buộc'],
    min: [0, 'Giá không được âm']
  },
  quantity: {
    type: Number,
    required: [true, 'Số lượng là bắt buộc'],
    min: [0, 'Số lượng không được âm'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    enum: {
      values: ['electronics', 'clothing', 'food', 'books', 'other'],
      message: 'Danh mục không hợp lệ'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v
      return ret
    }
  }
})

// Indexes for performance
ProductSchema.index({ sku: 1 })
ProductSchema.index({ category: 1, isActive: 1 })
ProductSchema.index({ name: 'text', sku: 'text' })

// Middleware with proper typing
ProductSchema.pre<IProduct>('save', function(next) {
  if (this.isModified('sku')) {
    this.sku = this.sku.toUpperCase()
  }
  next()
})

// Export with Next.js hot reload support
export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
```

### 5.4 Database Connection

#### **MongoDB Connection Strategy**
Sử dụng connection pooling và caching để tối ưu performance:
- **Global cache**: Tránh tạo multiple connections trong development
- **Connection pooling**: Cấu hình maxPoolSize phù hợp
- **Error handling**: Xử lý connection errors và retry logic
- **Environment variables**: Sử dụng MONGODB_URI từ environment

Tham khảo implementation trong `src/lib/mongodb.ts` hiện tại của dự án.

---

## 6. Frontend Standards

### 6.1 Component Architecture

#### **Component Types và Organization**
Dự án sử dụng 3 loại components chính:

1. **UI Primitives** (`src/components/ui/`): Các components cơ bản như `Button`, `Input`, `Card`
2. **Shared Components** (`src/components/shared/`): Components dùng chung như `theme-switcher`
3. **Feature Components** (`src/components/features/`): Components theo tính năng như `stat-card`, `add-item-form`

#### **Component Props Interface**
Luôn định nghĩa TypeScript interface cho props:

```typescript
// Ví dụ: StatCard component
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'warning' | 'destructive';
}

export function StatCard({ title, value, change, icon: Icon, variant = 'default' }: StatCardProps) {
  // Component implementation
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${colorClasses[variant]}`}>
          {change} so với tháng trước
        </p>
      </CardContent>
    </Card>
  );
}
```

### 6.2 State Management

#### **Local State với useState**
Sử dụng cho component-level state:
- **Form data**: Dữ liệu form, validation errors, submission state
- **UI state**: Loading states, modal visibility, selected items
- **Component state**: Expanded/collapsed, active tabs, filters

#### **Global State với Context**
Dự án sử dụng React Context cho global state:
- **AuthContext** (`src/contexts/auth-context.tsx`): Quản lý authentication state
- **ThemeContext** (`src/contexts/theme-context.tsx`): Quản lý theme và appearance

```typescript
// Ví dụ sử dụng AuthContext
const LoginPage = () => {
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      // Redirect sau khi login thành công
    } catch (error) {
      // Hiển thị lỗi cho người dùng
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form implementation */}
    </form>
  );
};
```

### 6.3 Custom Hooks

#### **Hooks hiện có trong dự án**
Dự án đã có các custom hooks:
- **`use-accessibility.ts`**: Quản lý focus, keyboard navigation, screen reader
- **`use-media-query.ts`**: Responsive breakpoints và media queries

#### **Pattern cho Custom Hooks**
- **Prefix với `use`**: Tất cả hooks phải bắt đầu với `use`
- **Return object**: Return object thay vì array để dễ destructure
- **Error handling**: Luôn handle errors và return error state
- **Loading states**: Provide loading indicators cho async operations
- **Cleanup**: Sử dụng useEffect cleanup để tránh memory leaks

```typescript
// Ví dụ: Custom hook cho data fetching
export const useApiData = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, isLoading, error };
};
```

---

## 7. Best Practices

### 7.1 Component Composition

#### **Compound Components Pattern**
```typescript
// ✅ Đúng - Flexible và reusable
const DataTable = ({ children, ...props }) => {
  return <div className="data-table" {...props}>{children}</div>;
};

const DataTableHeader = ({ children }) => {
  return <thead className="data-table-header">{children}</thead>;
};

const DataTableBody = ({ children }) => {
  return <tbody className="data-table-body">{children}</tbody>;
};

const DataTableRow = ({ children, ...props }) => {
  return <tr className="data-table-row" {...props}>{children}</tr>;
};

// Usage
<DataTable>
  <DataTableHeader>
    <DataTableRow>
      <th>Tên</th>
      <th>Email</th>
      <th>Hành động</th>
    </DataTableRow>
  </DataTableHeader>
  <DataTableBody>
    {users.map(user => (
      <DataTableRow key={user.id}>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td><Button>Sửa</Button></td>
      </DataTableRow>
    ))}
  </DataTableBody>
</DataTable>
```

#### **Render Props Pattern**
```typescript
// ✅ Đúng - Flexible data fetching component
interface DataFetcherProps<T> {
  url: string;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
}

const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <>{children({ data, loading, error, refetch: fetchData })}</>;
};

// Usage
<DataFetcher<IUser[]> url="/api/users">
  {({ data: users, loading, error, refetch }) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!users) return <EmptyState />;

    return (
      <div>
        <Button onClick={refetch}>Làm mới</Button>
        <UserList users={users} />
      </div>
    );
  }}
</DataFetcher>
```

### 7.2 API Design Principles

#### **RESTful API Standards**
```typescript
// ✅ Đúng - RESTful endpoints
GET    /api/users              // Lấy danh sách users
GET    /api/users/123          // Lấy user theo ID
POST   /api/users              // Tạo user mới
PUT    /api/users/123          // Cập nhật toàn bộ user
PATCH  /api/users/123          // Cập nhật một phần user
DELETE /api/users/123          // Xóa user

// Nested resources
GET    /api/users/123/orders   // Lấy orders của user
POST   /api/users/123/orders   // Tạo order cho user
```

#### **Consistent Response Format**
```typescript
// ✅ Đúng - Consistent response structure
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Success response
{
  "success": true,
  "data": {
    "id": "123",
    "username": "john_doe",
    "email": "john@example.com"
  }
}

// Error response
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required", "Email format is invalid"],
    "password": ["Password must be at least 8 characters"]
  }
}

// Paginated response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 7.3 Performance Optimization

#### **React Performance**
```typescript
// ✅ Đúng - Memoization
const UserCard = React.memo(({ user, onEdit, onDelete }) => {
  return (
    <Card>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <Button onClick={() => onEdit(user)}>Sửa</Button>
      <Button onClick={() => onDelete(user.id)}>Xóa</Button>
    </Card>
  );
});

// ✅ Đúng - useMemo cho expensive calculations
const UserList = ({ users, searchTerm }) => {
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div>
      {filteredUsers.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};

// ✅ Đúng - useCallback cho event handlers
const UserManagement = () => {
  const [users, setUsers] = useState([]);

  const handleEditUser = useCallback((user: IUser) => {
    // Edit logic
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  return (
    <UserList
      users={users}
      onEdit={handleEditUser}
      onDelete={handleDeleteUser}
    />
  );
};
```

#### **Database Performance**
```typescript
// ✅ Đúng - Efficient queries với select và populate
export const getUsersWithPagination = async (options: {
  page: number;
  limit: number;
  search?: string;
}) => {
  const { page, limit, search } = options;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = {};
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute queries in parallel
  const [users, total] = await Promise.all([
    User.find(query)
      .select('username email role createdAt') // Only select needed fields
      .populate('role', 'name') // Only populate needed fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(), // Return plain objects instead of Mongoose documents

    User.countDocuments(query)
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
```

### 7.4 Code Reusability

#### **Utility Functions**
```typescript
// src/lib/utils/date-utils.ts
export const formatDate = (date: Date | string, format: 'short' | 'long' = 'short') => {
  const d = new Date(date);

  if (format === 'long') {
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return d.toLocaleDateString('vi-VN');
};

export const getRelativeTime = (date: Date | string) => {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;

  return formatDate(date);
};

// src/lib/utils/validation-utils.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  }

  if (!/\d/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

---

## 8. Bảo mật

### 8.1 Authentication & Authorization

#### **JWT Implementation**
```typescript
// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface TokenPayload {
  id: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'wms-app',
    audience: 'wms-users'
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const extractTokenFromRequest = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};
```

#### **Middleware Protection**
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

// Protected routes
const protectedRoutes = ['/dashboard', '/api/users', '/api/products'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const payload = verifyToken(token);

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.id);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute) {
    const token = extractTokenFromRequest(request);

    if (token) {
      try {
        verifyToken(token);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        // Token invalid, continue to auth page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 8.2 Input Validation & Sanitization

#### **Request Validation**
```typescript
// src/lib/validation.ts
import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Username phải có ít nhất 3 ký tự')
    .max(50, 'Username không được quá 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ được chứa chữ, số và dấu gạch dưới'),

  email: z.string()
    .email('Email không hợp lệ')
    .max(100, 'Email không được quá 100 ký tự'),

  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'),

  role: z.enum(['admin', 'staff', 'customer'])
});

export const updateUserSchema = createUserSchema.partial();

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string()
    .min(1, 'Tên sản phẩm là bắt buộc')
    .max(100, 'Tên sản phẩm không được quá 100 ký tự'),

  sku: z.string()
    .min(1, 'SKU là bắt buộc')
    .max(50, 'SKU không được quá 50 ký tự')
    .regex(/^[A-Z0-9-_]+$/, 'SKU chỉ được chứa chữ hoa, số, dấu gạch ngang và gạch dưới'),

  price: z.number()
    .min(0, 'Giá không được âm')
    .max(999999999, 'Giá quá lớn'),

  quantity: z.number()
    .int('Số lượng phải là số nguyên')
    .min(0, 'Số lượng không được âm'),

  category: z.enum(['electronics', 'clothing', 'food', 'books', 'other']),

  description: z.string()
    .max(500, 'Mô tả không được quá 500 ký tự')
    .optional()
});

// Validation middleware
export const validateRequest = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        }, {} as Record<string, string>);

        throw new ValidationError('Dữ liệu không hợp lệ', formattedErrors);
      }
      throw error;
    }
  };
};
```

#### **SQL Injection Prevention**
```typescript
// ✅ Đúng - Sử dụng Mongoose (tự động escape)
const getUsersByRole = async (role: string) => {
  // Mongoose tự động escape các giá trị
  return User.find({ role: role });
};

// ✅ Đúng - Validation trước khi query
const getUserById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid user ID format');
  }

  return User.findById(id);
};

// ❌ Sai - Raw query không an toàn (nếu sử dụng raw MongoDB)
const getUsersByRoleUnsafe = async (role: string) => {
  // KHÔNG BAO GIỜ làm như này
  return db.collection('users').find({ $where: `this.role == '${role}'` });
};
```

### 8.3 Data Protection

#### **Password Hashing**
```typescript
// src/lib/password.ts
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // Cao hơn = an toàn hơn nhưng chậm hơn
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

// Trong User model
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error as Error);
  }
});
```

#### **Sensitive Data Handling**
```typescript
// ✅ Đúng - Loại bỏ sensitive data khi trả về
export const getUserProfile = async (userId: string): Promise<Partial<IUser>> => {
  const user = await User.findById(userId).select('-password -__v');

  if (!user) {
    throw new NotFoundError('User');
  }

  // Transform data trước khi trả về
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// ✅ Đúng - Sử dụng toJSON transform trong schema
UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});
```

---

## 9. Performance

### 9.1 Database Optimization

#### **Indexing Strategy**
```typescript
// src/models/User.ts
// Indexes cho các truy vấn thường xuyên
UserSchema.index({ email: 1 }); // Unique login
UserSchema.index({ username: 1 }); // Unique username
UserSchema.index({ role: 1, isActive: 1 }); // Filter by role and status
UserSchema.index({ createdAt: -1 }); // Sort by creation date

// Compound index cho complex queries
UserSchema.index({
  role: 1,
  'profile.department': 1,
  isActive: 1
});

// Text index cho search
UserSchema.index({
  username: 'text',
  email: 'text',
  'profile.fullName': 'text'
});
```

#### **Query Optimization**
```typescript
// ✅ Đúng - Efficient pagination
export const getUsersPaginated = async (options: PaginationOptions) => {
  const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  // Build aggregation pipeline
  const pipeline = [];

  // Match stage
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    });
  }

  // Lookup stage (populate)
  pipeline.push({
    $lookup: {
      from: 'roles',
      localField: 'role',
      foreignField: '_id',
      as: 'roleInfo'
    }
  });

  // Project stage (select fields)
  pipeline.push({
    $project: {
      username: 1,
      email: 1,
      'roleInfo.name': 1,
      createdAt: 1,
      isActive: 1
    }
  });

  // Sort stage
  pipeline.push({
    $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
  });

  // Facet stage for pagination and count
  pipeline.push({
    $facet: {
      data: [
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ],
      count: [
        { $count: 'total' }
      ]
    }
  });

  const [result] = await User.aggregate(pipeline);
  const total = result.count[0]?.total || 0;

  return {
    data: result.data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
```

### 9.2 Frontend Performance

#### **Code Splitting & Lazy Loading**
```typescript
// ✅ Đúng - Dynamic imports cho route-based splitting
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load components
const UserManagement = lazy(() => import('@/components/features/users/user-management'));
const ProductManagement = lazy(() => import('@/components/features/products/product-management'));
const Dashboard = lazy(() => import('@/components/features/dashboard/dashboard'));

// Route component với Suspense
const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route
        path="/users"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <UserManagement />
          </Suspense>
        }
      />
    </Routes>
  );
};

// ✅ Đúng - Component-level lazy loading
const HeavyChart = lazy(() =>
  import('@/components/charts/HeavyChart').then(module => ({
    default: module.HeavyChart
  }))
);

const Dashboard = () => {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <h1>Dashboard</h1>
      <Button onClick={() => setShowChart(true)}>
        Hiển thị biểu đồ
      </Button>

      {showChart && (
        <Suspense fallback={<div>Đang tải biểu đồ...</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
};
```

#### **Image Optimization**
```typescript
// ✅ Đúng - Next.js Image component
import Image from 'next/image';

const ProductCard = ({ product }) => {
  return (
    <Card>
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={300}
        height={200}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={product.featured} // Chỉ dùng cho above-the-fold images
      />
      <CardContent>
        <h3>{product.name}</h3>
        <p>{formatCurrency(product.price)}</p>
      </CardContent>
    </Card>
  );
};

// ✅ Đúng - Avatar với fallback
const UserAvatar = ({ user, size = 40 }) => {
  return (
    <Image
      src={user.avatarUrl || '/default-avatar.png'}
      alt={`${user.username} avatar`}
      width={size}
      height={size}
      className="rounded-full"
      onError={(e) => {
        e.currentTarget.src = '/default-avatar.png';
      }}
    />
  );
};
```

#### **Bundle Optimization**
```typescript
// next.config.ts
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
      return config;
    },
  }),

  // Experimental features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;
```

### 9.3 Caching Strategies

#### **API Response Caching**
```typescript
// src/lib/cache.ts
interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key: string;
}

class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, data: any, ttl: number = 300) {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expires });
  }

  get(key: string) {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const cache = new MemoryCache();

// Usage in API routes
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const cacheKey = `users:${url.searchParams.toString()}`;

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    const users = await userService.getUsers({
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 10,
    });

    // Cache for 5 minutes
    cache.set(cacheKey, users, 300);

    return NextResponse.json(users);
  } catch (error) {
    // Handle error
  }
}
```

#### **Client-side Caching**
```typescript
// src/hooks/use-cached-fetch.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ClientCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const clientCache = new ClientCache();

export const useCachedFetch = <T>(
  url: string,
  options: { ttl?: number; enabled?: boolean } = {}
) => {
  const { ttl = 300000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (bypassCache = false) => {
    if (!enabled) return;

    // Check cache first
    if (!bypassCache) {
      const cachedData = clientCache.get<T>(url);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();

      // Cache the result
      clientCache.set(url, result, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url, enabled, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidateCache: () => clientCache.invalidate(url)
  };
};
```

---

## 10. Kết luận

### 10.1 Checklist Tuân thủ

#### **Trước khi Commit Code**
- [ ] **Naming Conventions**: Tất cả files, functions, variables tuân thủ quy tắc đặt tên
- [ ] **Code Structure**: Components được tổ chức đúng thư mục (ui/shared/features)
- [ ] **Type Safety**: Tất cả TypeScript interfaces và types được định nghĩa rõ ràng
- [ ] **Error Handling**: Có xử lý lỗi phù hợp cho tất cả async operations
- [ ] **Performance**: Sử dụng React.memo, useMemo, useCallback khi cần thiết
- [ ] **Security**: Input validation, authentication checks được thực hiện
- [ ] **Testing**: Unit tests được viết cho business logic quan trọng
- [ ] **Documentation**: JSDoc comments cho public APIs và complex functions

#### **Code Review Checklist**
- [ ] **Readability**: Code dễ đọc và hiểu
- [ ] **Reusability**: Components và functions có thể tái sử dụng
- [ ] **Maintainability**: Code dễ bảo trì và mở rộng
- [ ] **Performance**: Không có performance bottlenecks rõ ràng
- [ ] **Security**: Không có security vulnerabilities
- [ ] **Best Practices**: Tuân thủ React và Next.js best practices

### 10.2 Tài liệu Tham khảo

#### **Official Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Mongoose Documentation](https://mongoosejs.com/docs)

#### **Style Guides**
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

#### **Tools & Libraries**
- [ESLint](https://eslint.org) - Code linting
- [Prettier](https://prettier.io) - Code formatting
- [Zod](https://zod.dev) - Schema validation
- [React Hook Form](https://react-hook-form.com) - Form handling

---

**📝 Lưu ý**: Tài liệu này là living document và sẽ được cập nhật thường xuyên dựa trên feedback và best practices mới. Mọi thành viên team đều có trách nhiệm tuân thủ và đóng góp cải thiện các chuẩn này.

---

## 11. TypeScript Troubleshooting Guide

### 11.1 Common Import/Export Issues

#### **Problem**: `Cannot find module '@/models/User'`
**Solutions**:
1. Check file exists: `src/models/User.ts`
2. Check export pattern:
   ```typescript
   // ✅ ĐÚNG
   export const User = mongoose.model<IUser>('User', UserSchema)
   export type { IUser }
   ```
3. Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

#### **Problem**: `Module has no exported member 'IUser'`
**Solutions**:
1. Check export in source file:
   ```typescript
   // models/User.ts
   export interface IUser extends Document { ... }
   ```
2. Use type-only import:
   ```typescript
   import type { IUser } from '@/models/User'
   ```

#### **Problem**: Circular dependency warnings
**Solutions**:
1. Extract shared types to `types/` folder
2. Use `import type` for type-only imports
3. Restructure dependencies to be unidirectional

### 11.2 Development Workflow

#### **Before Starting Development**:
1. Run `npm run build` to check for TypeScript errors
2. Check `tsconfig.json` paths are correct
3. Ensure all required files exist

#### **During Development**:
1. Use TypeScript strict mode
2. Fix TypeScript errors immediately
3. Use proper import patterns with `@/` alias
4. Add types for all function parameters and return values

#### **Before Committing**:
1. Run `npm run build` successfully
2. No TypeScript errors or warnings
3. All imports use consistent patterns
4. No `any` types without justification

### 11.3 IDE Configuration

#### **VS Code Settings** (`.vscode/settings.json`):
```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  }
}
```

---

**🔄 Cập nhật cuối**: 2025-09-15
**👥 Áp dụng cho**: Tất cả thành viên development team
**📋 Review**: Hàng tháng hoặc khi có thay đổi lớn trong tech stack
**🔧 Focus**: TypeScript compilation, import/export consistency, error reduction


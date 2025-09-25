// Utility types for enhanced type safety

// Polymorphic component types
export type AsProp<C extends React.ElementType> = {
  as?: C
}

export type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P)

export type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = Record<string, unknown>
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>

export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref']

export type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = Record<string, unknown>
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> }

// Conditional types for component variants
export type VariantProps<T> = T extends (...args: unknown[]) => unknown
  ? Parameters<T>[0]
  : never

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Strict omit type
export type StrictOmit<T, K extends keyof T> = Omit<T, K>

// Pick by value type
export type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>

// Exclude by value type
export type ExcludeByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? never : Key }[keyof T]
>

// Non-empty array type
export type NonEmptyArray<T> = [T, ...T[]]

// Exact type (prevents excess properties)
export type Exact<T, U extends T> = T & Record<Exclude<keyof U, keyof T>, never>

// Optional keys type
export type OptionalKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? K : never
}[keyof T]

// Required keys type
export type RequiredKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? never : K
}[keyof T]

// Make specific keys optional
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Make specific keys required
export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

// Union to intersection type
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

// Tuple to union type
export type TupleToUnion<T extends readonly unknown[]> = T[number]

// String literal utilities
export type Capitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${R}`
  : S

export type Uncapitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Lowercase<F>}${R}`
  : S

// Object key paths (simplified to avoid infinite recursion)
export type KeyPaths<T> = keyof T

// Get value by path (simplified)
export type GetByPath<T, P extends keyof T> = T[P]

// Function parameter types
export type FirstParameter<T extends (...args: unknown[]) => unknown> = T extends (
  first: infer P,
  ...args: unknown[]
) => unknown
  ? P
  : never

export type LastParameter<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: [...unknown[], infer L]
) => unknown
  ? L
  : never

// Promise utilities
export type PromiseValue<T> = T extends Promise<infer U> ? U : T

export type MaybePromise<T> = T | Promise<T>

// Array utilities
export type Head<T extends readonly unknown[]> = T extends readonly [
  infer H,
  ...unknown[]
]
  ? H
  : never

export type Tail<T extends readonly unknown[]> = T extends readonly [
  unknown,
  ...infer Rest
]
  ? Rest
  : []

export type Last<T extends readonly unknown[]> = T extends readonly [
  ...unknown[],
  infer L
]
  ? L
  : never

// Object utilities
export type ValueOf<T> = T[keyof T]

export type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

export type FromEntries<T extends readonly [PropertyKey, unknown][]> = {
  [K in T[number] as K[0]]: K[1]
}

// Branded types for type safety
export type Brand<T, B> = T & { __brand: B }

export type Nominal<T, N extends string> = T & { readonly [Symbol.species]: N }

// Event handler types with better inference
export type EventHandler<T extends React.SyntheticEvent = React.SyntheticEvent> = (event: T) => void

export type ChangeEventHandler<T extends HTMLElement = HTMLElement> = EventHandler<
  React.ChangeEvent<T>
>

export type ClickEventHandler<T extends HTMLElement = HTMLElement> = EventHandler<
  React.MouseEvent<T>
>

export type KeyboardEventHandler<T extends HTMLElement = HTMLElement> = EventHandler<
  React.KeyboardEvent<T>
>

export type FocusEventHandler<T extends HTMLElement = HTMLElement> = EventHandler<
  React.FocusEvent<T>
>

// Component prop extraction
export type ComponentProps<T extends React.ComponentType<unknown>> = T extends React.ComponentType<
  infer P
>
  ? P
  : never

export type ComponentRef<T extends React.ComponentType<unknown>> = T extends React.ComponentType<{
  ref?: infer R
}>
  ? R
  : never

// Conditional rendering types
export type ConditionalProps<T, Condition extends boolean> = Condition extends true
  ? T
  : Partial<T>

// Theme-aware types
export type ThemeValue<T> = T | ((theme: Record<string, unknown>) => T)

export type ResponsiveValue<T> = T | { [breakpoint: string]: T }

// Validation types
export type ValidationRule<T> = (value: T) => string | undefined | Promise<string | undefined>

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]> | ValidationRule<T[K]>[]
}

// Form types
export type FormValues = Record<string, unknown>

export type FormErrors<T extends FormValues> = Partial<Record<keyof T, string>>

export type FormTouched<T extends FormValues> = Partial<Record<keyof T, boolean>>

// API types
export type ApiResponse<T> = {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

export type ApiError = {
  message: string
  code?: string | number
  details?: Record<string, unknown>
}

// State management types
export type Action<T extends string = string, P = unknown> = {
  type: T
  payload?: P
}

export type Reducer<S, A extends Action> = (state: S, action: A) => S

// Async state types
export type AsyncState<T, E = Error> = {
  data: T | null
  loading: boolean
  error: E | null
}

// Collection types
export type Collection<T> = {
  items: T[]
  total: number
  page?: number
  pageSize?: number
  hasMore?: boolean
}

// Filter and sort types
export type SortDirection = 'asc' | 'desc'

export type SortConfig<T> = {
  key: keyof T
  direction: SortDirection
}

export type FilterConfig<T> = Partial<{
  [K in keyof T]: T[K] | T[K][] | ((value: T[K]) => boolean)
}>

// Component composition types
export type WithChildren<T = Record<string, unknown>> = T & { children?: React.ReactNode }

export type WithClassName<T = Record<string, unknown>> = T & { className?: string }

export type WithTestId<T = Record<string, unknown>> = T & { 'data-testid'?: string }

export type WithAriaLabel<T = Record<string, unknown>> = T & { 'aria-label'?: string }

// Utility type for extracting component variants
export type ExtractVariants<T> = T extends { variants: infer V } ? V : never

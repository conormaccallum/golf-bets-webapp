
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Week
 * 
 */
export type Week = $Result.DefaultSelection<Prisma.$WeekPayload>
/**
 * Model Bet
 * 
 */
export type Bet = $Result.DefaultSelection<Prisma.$BetPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Weeks
 * const weeks = await prisma.week.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Weeks
   * const weeks = await prisma.week.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.week`: Exposes CRUD operations for the **Week** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Weeks
    * const weeks = await prisma.week.findMany()
    * ```
    */
  get week(): Prisma.WeekDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bet`: Exposes CRUD operations for the **Bet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bets
    * const bets = await prisma.bet.findMany()
    * ```
    */
  get bet(): Prisma.BetDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.3.0
   * Query Engine version: 9d6ad21cbbceab97458517b147a6a09ff43aa735
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Week: 'Week',
    Bet: 'Bet'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "week" | "bet"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Week: {
        payload: Prisma.$WeekPayload<ExtArgs>
        fields: Prisma.WeekFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WeekFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WeekFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload>
          }
          findFirst: {
            args: Prisma.WeekFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WeekFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload>
          }
          findMany: {
            args: Prisma.WeekFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload>[]
          }
          create: {
            args: Prisma.WeekCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload>
          }
          createMany: {
            args: Prisma.WeekCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WeekCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload>[]
          }
          delete: {
            args: Prisma.WeekDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload>
          }
          update: {
            args: Prisma.WeekUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload>
          }
          deleteMany: {
            args: Prisma.WeekDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WeekUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WeekUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload>[]
          }
          upsert: {
            args: Prisma.WeekUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeekPayload>
          }
          aggregate: {
            args: Prisma.WeekAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWeek>
          }
          groupBy: {
            args: Prisma.WeekGroupByArgs<ExtArgs>
            result: $Utils.Optional<WeekGroupByOutputType>[]
          }
          count: {
            args: Prisma.WeekCountArgs<ExtArgs>
            result: $Utils.Optional<WeekCountAggregateOutputType> | number
          }
        }
      }
      Bet: {
        payload: Prisma.$BetPayload<ExtArgs>
        fields: Prisma.BetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          findFirst: {
            args: Prisma.BetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          findMany: {
            args: Prisma.BetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>[]
          }
          create: {
            args: Prisma.BetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          createMany: {
            args: Prisma.BetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>[]
          }
          delete: {
            args: Prisma.BetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          update: {
            args: Prisma.BetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          deleteMany: {
            args: Prisma.BetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>[]
          }
          upsert: {
            args: Prisma.BetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          aggregate: {
            args: Prisma.BetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBet>
          }
          groupBy: {
            args: Prisma.BetGroupByArgs<ExtArgs>
            result: $Utils.Optional<BetGroupByOutputType>[]
          }
          count: {
            args: Prisma.BetCountArgs<ExtArgs>
            result: $Utils.Optional<BetCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    week?: WeekOmit
    bet?: BetOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type WeekCountOutputType
   */

  export type WeekCountOutputType = {
    bets: number
  }

  export type WeekCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bets?: boolean | WeekCountOutputTypeCountBetsArgs
  }

  // Custom InputTypes
  /**
   * WeekCountOutputType without action
   */
  export type WeekCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeekCountOutputType
     */
    select?: WeekCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WeekCountOutputType without action
   */
  export type WeekCountOutputTypeCountBetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BetWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Week
   */

  export type AggregateWeek = {
    _count: WeekCountAggregateOutputType | null
    _avg: WeekAvgAggregateOutputType | null
    _sum: WeekSumAggregateOutputType | null
    _min: WeekMinAggregateOutputType | null
    _max: WeekMaxAggregateOutputType | null
  }

  export type WeekAvgAggregateOutputType = {
    id: number | null
    eventYear: number | null
  }

  export type WeekSumAggregateOutputType = {
    id: number | null
    eventYear: number | null
  }

  export type WeekMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    label: string | null
    eventName: string | null
    eventYear: number | null
    eventId: string | null
  }

  export type WeekMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    label: string | null
    eventName: string | null
    eventYear: number | null
    eventId: string | null
  }

  export type WeekCountAggregateOutputType = {
    id: number
    createdAt: number
    label: number
    eventName: number
    eventYear: number
    eventId: number
    _all: number
  }


  export type WeekAvgAggregateInputType = {
    id?: true
    eventYear?: true
  }

  export type WeekSumAggregateInputType = {
    id?: true
    eventYear?: true
  }

  export type WeekMinAggregateInputType = {
    id?: true
    createdAt?: true
    label?: true
    eventName?: true
    eventYear?: true
    eventId?: true
  }

  export type WeekMaxAggregateInputType = {
    id?: true
    createdAt?: true
    label?: true
    eventName?: true
    eventYear?: true
    eventId?: true
  }

  export type WeekCountAggregateInputType = {
    id?: true
    createdAt?: true
    label?: true
    eventName?: true
    eventYear?: true
    eventId?: true
    _all?: true
  }

  export type WeekAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Week to aggregate.
     */
    where?: WeekWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Weeks to fetch.
     */
    orderBy?: WeekOrderByWithRelationInput | WeekOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WeekWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Weeks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Weeks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Weeks
    **/
    _count?: true | WeekCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WeekAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WeekSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WeekMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WeekMaxAggregateInputType
  }

  export type GetWeekAggregateType<T extends WeekAggregateArgs> = {
        [P in keyof T & keyof AggregateWeek]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWeek[P]>
      : GetScalarType<T[P], AggregateWeek[P]>
  }




  export type WeekGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeekWhereInput
    orderBy?: WeekOrderByWithAggregationInput | WeekOrderByWithAggregationInput[]
    by: WeekScalarFieldEnum[] | WeekScalarFieldEnum
    having?: WeekScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WeekCountAggregateInputType | true
    _avg?: WeekAvgAggregateInputType
    _sum?: WeekSumAggregateInputType
    _min?: WeekMinAggregateInputType
    _max?: WeekMaxAggregateInputType
  }

  export type WeekGroupByOutputType = {
    id: number
    createdAt: Date
    label: string
    eventName: string
    eventYear: number
    eventId: string
    _count: WeekCountAggregateOutputType | null
    _avg: WeekAvgAggregateOutputType | null
    _sum: WeekSumAggregateOutputType | null
    _min: WeekMinAggregateOutputType | null
    _max: WeekMaxAggregateOutputType | null
  }

  type GetWeekGroupByPayload<T extends WeekGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WeekGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WeekGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WeekGroupByOutputType[P]>
            : GetScalarType<T[P], WeekGroupByOutputType[P]>
        }
      >
    >


  export type WeekSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    label?: boolean
    eventName?: boolean
    eventYear?: boolean
    eventId?: boolean
    bets?: boolean | Week$betsArgs<ExtArgs>
    _count?: boolean | WeekCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["week"]>

  export type WeekSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    label?: boolean
    eventName?: boolean
    eventYear?: boolean
    eventId?: boolean
  }, ExtArgs["result"]["week"]>

  export type WeekSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    label?: boolean
    eventName?: boolean
    eventYear?: boolean
    eventId?: boolean
  }, ExtArgs["result"]["week"]>

  export type WeekSelectScalar = {
    id?: boolean
    createdAt?: boolean
    label?: boolean
    eventName?: boolean
    eventYear?: boolean
    eventId?: boolean
  }

  export type WeekOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "label" | "eventName" | "eventYear" | "eventId", ExtArgs["result"]["week"]>
  export type WeekInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bets?: boolean | Week$betsArgs<ExtArgs>
    _count?: boolean | WeekCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WeekIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type WeekIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $WeekPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Week"
    objects: {
      bets: Prisma.$BetPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      label: string
      eventName: string
      eventYear: number
      eventId: string
    }, ExtArgs["result"]["week"]>
    composites: {}
  }

  type WeekGetPayload<S extends boolean | null | undefined | WeekDefaultArgs> = $Result.GetResult<Prisma.$WeekPayload, S>

  type WeekCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WeekFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WeekCountAggregateInputType | true
    }

  export interface WeekDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Week'], meta: { name: 'Week' } }
    /**
     * Find zero or one Week that matches the filter.
     * @param {WeekFindUniqueArgs} args - Arguments to find a Week
     * @example
     * // Get one Week
     * const week = await prisma.week.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WeekFindUniqueArgs>(args: SelectSubset<T, WeekFindUniqueArgs<ExtArgs>>): Prisma__WeekClient<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Week that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WeekFindUniqueOrThrowArgs} args - Arguments to find a Week
     * @example
     * // Get one Week
     * const week = await prisma.week.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WeekFindUniqueOrThrowArgs>(args: SelectSubset<T, WeekFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WeekClient<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Week that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekFindFirstArgs} args - Arguments to find a Week
     * @example
     * // Get one Week
     * const week = await prisma.week.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WeekFindFirstArgs>(args?: SelectSubset<T, WeekFindFirstArgs<ExtArgs>>): Prisma__WeekClient<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Week that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekFindFirstOrThrowArgs} args - Arguments to find a Week
     * @example
     * // Get one Week
     * const week = await prisma.week.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WeekFindFirstOrThrowArgs>(args?: SelectSubset<T, WeekFindFirstOrThrowArgs<ExtArgs>>): Prisma__WeekClient<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Weeks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Weeks
     * const weeks = await prisma.week.findMany()
     * 
     * // Get first 10 Weeks
     * const weeks = await prisma.week.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const weekWithIdOnly = await prisma.week.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WeekFindManyArgs>(args?: SelectSubset<T, WeekFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Week.
     * @param {WeekCreateArgs} args - Arguments to create a Week.
     * @example
     * // Create one Week
     * const Week = await prisma.week.create({
     *   data: {
     *     // ... data to create a Week
     *   }
     * })
     * 
     */
    create<T extends WeekCreateArgs>(args: SelectSubset<T, WeekCreateArgs<ExtArgs>>): Prisma__WeekClient<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Weeks.
     * @param {WeekCreateManyArgs} args - Arguments to create many Weeks.
     * @example
     * // Create many Weeks
     * const week = await prisma.week.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WeekCreateManyArgs>(args?: SelectSubset<T, WeekCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Weeks and returns the data saved in the database.
     * @param {WeekCreateManyAndReturnArgs} args - Arguments to create many Weeks.
     * @example
     * // Create many Weeks
     * const week = await prisma.week.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Weeks and only return the `id`
     * const weekWithIdOnly = await prisma.week.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WeekCreateManyAndReturnArgs>(args?: SelectSubset<T, WeekCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Week.
     * @param {WeekDeleteArgs} args - Arguments to delete one Week.
     * @example
     * // Delete one Week
     * const Week = await prisma.week.delete({
     *   where: {
     *     // ... filter to delete one Week
     *   }
     * })
     * 
     */
    delete<T extends WeekDeleteArgs>(args: SelectSubset<T, WeekDeleteArgs<ExtArgs>>): Prisma__WeekClient<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Week.
     * @param {WeekUpdateArgs} args - Arguments to update one Week.
     * @example
     * // Update one Week
     * const week = await prisma.week.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WeekUpdateArgs>(args: SelectSubset<T, WeekUpdateArgs<ExtArgs>>): Prisma__WeekClient<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Weeks.
     * @param {WeekDeleteManyArgs} args - Arguments to filter Weeks to delete.
     * @example
     * // Delete a few Weeks
     * const { count } = await prisma.week.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WeekDeleteManyArgs>(args?: SelectSubset<T, WeekDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Weeks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Weeks
     * const week = await prisma.week.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WeekUpdateManyArgs>(args: SelectSubset<T, WeekUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Weeks and returns the data updated in the database.
     * @param {WeekUpdateManyAndReturnArgs} args - Arguments to update many Weeks.
     * @example
     * // Update many Weeks
     * const week = await prisma.week.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Weeks and only return the `id`
     * const weekWithIdOnly = await prisma.week.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WeekUpdateManyAndReturnArgs>(args: SelectSubset<T, WeekUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Week.
     * @param {WeekUpsertArgs} args - Arguments to update or create a Week.
     * @example
     * // Update or create a Week
     * const week = await prisma.week.upsert({
     *   create: {
     *     // ... data to create a Week
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Week we want to update
     *   }
     * })
     */
    upsert<T extends WeekUpsertArgs>(args: SelectSubset<T, WeekUpsertArgs<ExtArgs>>): Prisma__WeekClient<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Weeks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekCountArgs} args - Arguments to filter Weeks to count.
     * @example
     * // Count the number of Weeks
     * const count = await prisma.week.count({
     *   where: {
     *     // ... the filter for the Weeks we want to count
     *   }
     * })
    **/
    count<T extends WeekCountArgs>(
      args?: Subset<T, WeekCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WeekCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Week.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WeekAggregateArgs>(args: Subset<T, WeekAggregateArgs>): Prisma.PrismaPromise<GetWeekAggregateType<T>>

    /**
     * Group by Week.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeekGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WeekGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WeekGroupByArgs['orderBy'] }
        : { orderBy?: WeekGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WeekGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWeekGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Week model
   */
  readonly fields: WeekFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Week.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WeekClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bets<T extends Week$betsArgs<ExtArgs> = {}>(args?: Subset<T, Week$betsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Week model
   */
  interface WeekFieldRefs {
    readonly id: FieldRef<"Week", 'Int'>
    readonly createdAt: FieldRef<"Week", 'DateTime'>
    readonly label: FieldRef<"Week", 'String'>
    readonly eventName: FieldRef<"Week", 'String'>
    readonly eventYear: FieldRef<"Week", 'Int'>
    readonly eventId: FieldRef<"Week", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Week findUnique
   */
  export type WeekFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekInclude<ExtArgs> | null
    /**
     * Filter, which Week to fetch.
     */
    where: WeekWhereUniqueInput
  }

  /**
   * Week findUniqueOrThrow
   */
  export type WeekFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekInclude<ExtArgs> | null
    /**
     * Filter, which Week to fetch.
     */
    where: WeekWhereUniqueInput
  }

  /**
   * Week findFirst
   */
  export type WeekFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekInclude<ExtArgs> | null
    /**
     * Filter, which Week to fetch.
     */
    where?: WeekWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Weeks to fetch.
     */
    orderBy?: WeekOrderByWithRelationInput | WeekOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Weeks.
     */
    cursor?: WeekWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Weeks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Weeks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Weeks.
     */
    distinct?: WeekScalarFieldEnum | WeekScalarFieldEnum[]
  }

  /**
   * Week findFirstOrThrow
   */
  export type WeekFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekInclude<ExtArgs> | null
    /**
     * Filter, which Week to fetch.
     */
    where?: WeekWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Weeks to fetch.
     */
    orderBy?: WeekOrderByWithRelationInput | WeekOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Weeks.
     */
    cursor?: WeekWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Weeks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Weeks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Weeks.
     */
    distinct?: WeekScalarFieldEnum | WeekScalarFieldEnum[]
  }

  /**
   * Week findMany
   */
  export type WeekFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekInclude<ExtArgs> | null
    /**
     * Filter, which Weeks to fetch.
     */
    where?: WeekWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Weeks to fetch.
     */
    orderBy?: WeekOrderByWithRelationInput | WeekOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Weeks.
     */
    cursor?: WeekWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Weeks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Weeks.
     */
    skip?: number
    distinct?: WeekScalarFieldEnum | WeekScalarFieldEnum[]
  }

  /**
   * Week create
   */
  export type WeekCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekInclude<ExtArgs> | null
    /**
     * The data needed to create a Week.
     */
    data: XOR<WeekCreateInput, WeekUncheckedCreateInput>
  }

  /**
   * Week createMany
   */
  export type WeekCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Weeks.
     */
    data: WeekCreateManyInput | WeekCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Week createManyAndReturn
   */
  export type WeekCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * The data used to create many Weeks.
     */
    data: WeekCreateManyInput | WeekCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Week update
   */
  export type WeekUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekInclude<ExtArgs> | null
    /**
     * The data needed to update a Week.
     */
    data: XOR<WeekUpdateInput, WeekUncheckedUpdateInput>
    /**
     * Choose, which Week to update.
     */
    where: WeekWhereUniqueInput
  }

  /**
   * Week updateMany
   */
  export type WeekUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Weeks.
     */
    data: XOR<WeekUpdateManyMutationInput, WeekUncheckedUpdateManyInput>
    /**
     * Filter which Weeks to update
     */
    where?: WeekWhereInput
    /**
     * Limit how many Weeks to update.
     */
    limit?: number
  }

  /**
   * Week updateManyAndReturn
   */
  export type WeekUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * The data used to update Weeks.
     */
    data: XOR<WeekUpdateManyMutationInput, WeekUncheckedUpdateManyInput>
    /**
     * Filter which Weeks to update
     */
    where?: WeekWhereInput
    /**
     * Limit how many Weeks to update.
     */
    limit?: number
  }

  /**
   * Week upsert
   */
  export type WeekUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekInclude<ExtArgs> | null
    /**
     * The filter to search for the Week to update in case it exists.
     */
    where: WeekWhereUniqueInput
    /**
     * In case the Week found by the `where` argument doesn't exist, create a new Week with this data.
     */
    create: XOR<WeekCreateInput, WeekUncheckedCreateInput>
    /**
     * In case the Week was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WeekUpdateInput, WeekUncheckedUpdateInput>
  }

  /**
   * Week delete
   */
  export type WeekDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekInclude<ExtArgs> | null
    /**
     * Filter which Week to delete.
     */
    where: WeekWhereUniqueInput
  }

  /**
   * Week deleteMany
   */
  export type WeekDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Weeks to delete
     */
    where?: WeekWhereInput
    /**
     * Limit how many Weeks to delete.
     */
    limit?: number
  }

  /**
   * Week.bets
   */
  export type Week$betsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    where?: BetWhereInput
    orderBy?: BetOrderByWithRelationInput | BetOrderByWithRelationInput[]
    cursor?: BetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BetScalarFieldEnum | BetScalarFieldEnum[]
  }

  /**
   * Week without action
   */
  export type WeekDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Week
     */
    select?: WeekSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Week
     */
    omit?: WeekOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WeekInclude<ExtArgs> | null
  }


  /**
   * Model Bet
   */

  export type AggregateBet = {
    _count: BetCountAggregateOutputType | null
    _avg: BetAvgAggregateOutputType | null
    _sum: BetSumAggregateOutputType | null
    _min: BetMinAggregateOutputType | null
    _max: BetMaxAggregateOutputType | null
  }

  export type BetAvgAggregateOutputType = {
    id: number | null
    weekId: number | null
    dgId: number | null
    marketOddsBestDec: number | null
    stakeUnits: number | null
    pModel: number | null
    edgeProb: number | null
    evPerUnit: number | null
    kellyFull: number | null
    kellyFrac: number | null
    resultWinFlag: number | null
    returnUnits: number | null
  }

  export type BetSumAggregateOutputType = {
    id: number | null
    weekId: number | null
    dgId: number | null
    marketOddsBestDec: number | null
    stakeUnits: number | null
    pModel: number | null
    edgeProb: number | null
    evPerUnit: number | null
    kellyFull: number | null
    kellyFrac: number | null
    resultWinFlag: number | null
    returnUnits: number | null
  }

  export type BetMinAggregateOutputType = {
    id: number | null
    weekId: number | null
    placedAtUtc: string | null
    betType: string | null
    playerName: string | null
    dgId: number | null
    marketBookBest: string | null
    marketOddsBestDec: number | null
    stakeUnits: number | null
    pModel: number | null
    edgeProb: number | null
    evPerUnit: number | null
    kellyFull: number | null
    kellyFrac: number | null
    resultWinFlag: number | null
    returnUnits: number | null
  }

  export type BetMaxAggregateOutputType = {
    id: number | null
    weekId: number | null
    placedAtUtc: string | null
    betType: string | null
    playerName: string | null
    dgId: number | null
    marketBookBest: string | null
    marketOddsBestDec: number | null
    stakeUnits: number | null
    pModel: number | null
    edgeProb: number | null
    evPerUnit: number | null
    kellyFull: number | null
    kellyFrac: number | null
    resultWinFlag: number | null
    returnUnits: number | null
  }

  export type BetCountAggregateOutputType = {
    id: number
    weekId: number
    placedAtUtc: number
    betType: number
    playerName: number
    dgId: number
    marketBookBest: number
    marketOddsBestDec: number
    stakeUnits: number
    pModel: number
    edgeProb: number
    evPerUnit: number
    kellyFull: number
    kellyFrac: number
    resultWinFlag: number
    returnUnits: number
    _all: number
  }


  export type BetAvgAggregateInputType = {
    id?: true
    weekId?: true
    dgId?: true
    marketOddsBestDec?: true
    stakeUnits?: true
    pModel?: true
    edgeProb?: true
    evPerUnit?: true
    kellyFull?: true
    kellyFrac?: true
    resultWinFlag?: true
    returnUnits?: true
  }

  export type BetSumAggregateInputType = {
    id?: true
    weekId?: true
    dgId?: true
    marketOddsBestDec?: true
    stakeUnits?: true
    pModel?: true
    edgeProb?: true
    evPerUnit?: true
    kellyFull?: true
    kellyFrac?: true
    resultWinFlag?: true
    returnUnits?: true
  }

  export type BetMinAggregateInputType = {
    id?: true
    weekId?: true
    placedAtUtc?: true
    betType?: true
    playerName?: true
    dgId?: true
    marketBookBest?: true
    marketOddsBestDec?: true
    stakeUnits?: true
    pModel?: true
    edgeProb?: true
    evPerUnit?: true
    kellyFull?: true
    kellyFrac?: true
    resultWinFlag?: true
    returnUnits?: true
  }

  export type BetMaxAggregateInputType = {
    id?: true
    weekId?: true
    placedAtUtc?: true
    betType?: true
    playerName?: true
    dgId?: true
    marketBookBest?: true
    marketOddsBestDec?: true
    stakeUnits?: true
    pModel?: true
    edgeProb?: true
    evPerUnit?: true
    kellyFull?: true
    kellyFrac?: true
    resultWinFlag?: true
    returnUnits?: true
  }

  export type BetCountAggregateInputType = {
    id?: true
    weekId?: true
    placedAtUtc?: true
    betType?: true
    playerName?: true
    dgId?: true
    marketBookBest?: true
    marketOddsBestDec?: true
    stakeUnits?: true
    pModel?: true
    edgeProb?: true
    evPerUnit?: true
    kellyFull?: true
    kellyFrac?: true
    resultWinFlag?: true
    returnUnits?: true
    _all?: true
  }

  export type BetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bet to aggregate.
     */
    where?: BetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bets to fetch.
     */
    orderBy?: BetOrderByWithRelationInput | BetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bets
    **/
    _count?: true | BetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BetMaxAggregateInputType
  }

  export type GetBetAggregateType<T extends BetAggregateArgs> = {
        [P in keyof T & keyof AggregateBet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBet[P]>
      : GetScalarType<T[P], AggregateBet[P]>
  }




  export type BetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BetWhereInput
    orderBy?: BetOrderByWithAggregationInput | BetOrderByWithAggregationInput[]
    by: BetScalarFieldEnum[] | BetScalarFieldEnum
    having?: BetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BetCountAggregateInputType | true
    _avg?: BetAvgAggregateInputType
    _sum?: BetSumAggregateInputType
    _min?: BetMinAggregateInputType
    _max?: BetMaxAggregateInputType
  }

  export type BetGroupByOutputType = {
    id: number
    weekId: number
    placedAtUtc: string | null
    betType: string
    playerName: string
    dgId: number | null
    marketBookBest: string | null
    marketOddsBestDec: number | null
    stakeUnits: number | null
    pModel: number | null
    edgeProb: number | null
    evPerUnit: number | null
    kellyFull: number | null
    kellyFrac: number | null
    resultWinFlag: number | null
    returnUnits: number | null
    _count: BetCountAggregateOutputType | null
    _avg: BetAvgAggregateOutputType | null
    _sum: BetSumAggregateOutputType | null
    _min: BetMinAggregateOutputType | null
    _max: BetMaxAggregateOutputType | null
  }

  type GetBetGroupByPayload<T extends BetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BetGroupByOutputType[P]>
            : GetScalarType<T[P], BetGroupByOutputType[P]>
        }
      >
    >


  export type BetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    weekId?: boolean
    placedAtUtc?: boolean
    betType?: boolean
    playerName?: boolean
    dgId?: boolean
    marketBookBest?: boolean
    marketOddsBestDec?: boolean
    stakeUnits?: boolean
    pModel?: boolean
    edgeProb?: boolean
    evPerUnit?: boolean
    kellyFull?: boolean
    kellyFrac?: boolean
    resultWinFlag?: boolean
    returnUnits?: boolean
    week?: boolean | WeekDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bet"]>

  export type BetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    weekId?: boolean
    placedAtUtc?: boolean
    betType?: boolean
    playerName?: boolean
    dgId?: boolean
    marketBookBest?: boolean
    marketOddsBestDec?: boolean
    stakeUnits?: boolean
    pModel?: boolean
    edgeProb?: boolean
    evPerUnit?: boolean
    kellyFull?: boolean
    kellyFrac?: boolean
    resultWinFlag?: boolean
    returnUnits?: boolean
    week?: boolean | WeekDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bet"]>

  export type BetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    weekId?: boolean
    placedAtUtc?: boolean
    betType?: boolean
    playerName?: boolean
    dgId?: boolean
    marketBookBest?: boolean
    marketOddsBestDec?: boolean
    stakeUnits?: boolean
    pModel?: boolean
    edgeProb?: boolean
    evPerUnit?: boolean
    kellyFull?: boolean
    kellyFrac?: boolean
    resultWinFlag?: boolean
    returnUnits?: boolean
    week?: boolean | WeekDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bet"]>

  export type BetSelectScalar = {
    id?: boolean
    weekId?: boolean
    placedAtUtc?: boolean
    betType?: boolean
    playerName?: boolean
    dgId?: boolean
    marketBookBest?: boolean
    marketOddsBestDec?: boolean
    stakeUnits?: boolean
    pModel?: boolean
    edgeProb?: boolean
    evPerUnit?: boolean
    kellyFull?: boolean
    kellyFrac?: boolean
    resultWinFlag?: boolean
    returnUnits?: boolean
  }

  export type BetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "weekId" | "placedAtUtc" | "betType" | "playerName" | "dgId" | "marketBookBest" | "marketOddsBestDec" | "stakeUnits" | "pModel" | "edgeProb" | "evPerUnit" | "kellyFull" | "kellyFrac" | "resultWinFlag" | "returnUnits", ExtArgs["result"]["bet"]>
  export type BetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    week?: boolean | WeekDefaultArgs<ExtArgs>
  }
  export type BetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    week?: boolean | WeekDefaultArgs<ExtArgs>
  }
  export type BetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    week?: boolean | WeekDefaultArgs<ExtArgs>
  }

  export type $BetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Bet"
    objects: {
      week: Prisma.$WeekPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      weekId: number
      placedAtUtc: string | null
      betType: string
      playerName: string
      dgId: number | null
      marketBookBest: string | null
      marketOddsBestDec: number | null
      stakeUnits: number | null
      pModel: number | null
      edgeProb: number | null
      evPerUnit: number | null
      kellyFull: number | null
      kellyFrac: number | null
      resultWinFlag: number | null
      returnUnits: number | null
    }, ExtArgs["result"]["bet"]>
    composites: {}
  }

  type BetGetPayload<S extends boolean | null | undefined | BetDefaultArgs> = $Result.GetResult<Prisma.$BetPayload, S>

  type BetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BetCountAggregateInputType | true
    }

  export interface BetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Bet'], meta: { name: 'Bet' } }
    /**
     * Find zero or one Bet that matches the filter.
     * @param {BetFindUniqueArgs} args - Arguments to find a Bet
     * @example
     * // Get one Bet
     * const bet = await prisma.bet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BetFindUniqueArgs>(args: SelectSubset<T, BetFindUniqueArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Bet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BetFindUniqueOrThrowArgs} args - Arguments to find a Bet
     * @example
     * // Get one Bet
     * const bet = await prisma.bet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BetFindUniqueOrThrowArgs>(args: SelectSubset<T, BetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetFindFirstArgs} args - Arguments to find a Bet
     * @example
     * // Get one Bet
     * const bet = await prisma.bet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BetFindFirstArgs>(args?: SelectSubset<T, BetFindFirstArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetFindFirstOrThrowArgs} args - Arguments to find a Bet
     * @example
     * // Get one Bet
     * const bet = await prisma.bet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BetFindFirstOrThrowArgs>(args?: SelectSubset<T, BetFindFirstOrThrowArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Bets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bets
     * const bets = await prisma.bet.findMany()
     * 
     * // Get first 10 Bets
     * const bets = await prisma.bet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const betWithIdOnly = await prisma.bet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BetFindManyArgs>(args?: SelectSubset<T, BetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Bet.
     * @param {BetCreateArgs} args - Arguments to create a Bet.
     * @example
     * // Create one Bet
     * const Bet = await prisma.bet.create({
     *   data: {
     *     // ... data to create a Bet
     *   }
     * })
     * 
     */
    create<T extends BetCreateArgs>(args: SelectSubset<T, BetCreateArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Bets.
     * @param {BetCreateManyArgs} args - Arguments to create many Bets.
     * @example
     * // Create many Bets
     * const bet = await prisma.bet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BetCreateManyArgs>(args?: SelectSubset<T, BetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Bets and returns the data saved in the database.
     * @param {BetCreateManyAndReturnArgs} args - Arguments to create many Bets.
     * @example
     * // Create many Bets
     * const bet = await prisma.bet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Bets and only return the `id`
     * const betWithIdOnly = await prisma.bet.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BetCreateManyAndReturnArgs>(args?: SelectSubset<T, BetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Bet.
     * @param {BetDeleteArgs} args - Arguments to delete one Bet.
     * @example
     * // Delete one Bet
     * const Bet = await prisma.bet.delete({
     *   where: {
     *     // ... filter to delete one Bet
     *   }
     * })
     * 
     */
    delete<T extends BetDeleteArgs>(args: SelectSubset<T, BetDeleteArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Bet.
     * @param {BetUpdateArgs} args - Arguments to update one Bet.
     * @example
     * // Update one Bet
     * const bet = await prisma.bet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BetUpdateArgs>(args: SelectSubset<T, BetUpdateArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Bets.
     * @param {BetDeleteManyArgs} args - Arguments to filter Bets to delete.
     * @example
     * // Delete a few Bets
     * const { count } = await prisma.bet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BetDeleteManyArgs>(args?: SelectSubset<T, BetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bets
     * const bet = await prisma.bet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BetUpdateManyArgs>(args: SelectSubset<T, BetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bets and returns the data updated in the database.
     * @param {BetUpdateManyAndReturnArgs} args - Arguments to update many Bets.
     * @example
     * // Update many Bets
     * const bet = await prisma.bet.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Bets and only return the `id`
     * const betWithIdOnly = await prisma.bet.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BetUpdateManyAndReturnArgs>(args: SelectSubset<T, BetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Bet.
     * @param {BetUpsertArgs} args - Arguments to update or create a Bet.
     * @example
     * // Update or create a Bet
     * const bet = await prisma.bet.upsert({
     *   create: {
     *     // ... data to create a Bet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bet we want to update
     *   }
     * })
     */
    upsert<T extends BetUpsertArgs>(args: SelectSubset<T, BetUpsertArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Bets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetCountArgs} args - Arguments to filter Bets to count.
     * @example
     * // Count the number of Bets
     * const count = await prisma.bet.count({
     *   where: {
     *     // ... the filter for the Bets we want to count
     *   }
     * })
    **/
    count<T extends BetCountArgs>(
      args?: Subset<T, BetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BetAggregateArgs>(args: Subset<T, BetAggregateArgs>): Prisma.PrismaPromise<GetBetAggregateType<T>>

    /**
     * Group by Bet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BetGroupByArgs['orderBy'] }
        : { orderBy?: BetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Bet model
   */
  readonly fields: BetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Bet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    week<T extends WeekDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WeekDefaultArgs<ExtArgs>>): Prisma__WeekClient<$Result.GetResult<Prisma.$WeekPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Bet model
   */
  interface BetFieldRefs {
    readonly id: FieldRef<"Bet", 'Int'>
    readonly weekId: FieldRef<"Bet", 'Int'>
    readonly placedAtUtc: FieldRef<"Bet", 'String'>
    readonly betType: FieldRef<"Bet", 'String'>
    readonly playerName: FieldRef<"Bet", 'String'>
    readonly dgId: FieldRef<"Bet", 'Int'>
    readonly marketBookBest: FieldRef<"Bet", 'String'>
    readonly marketOddsBestDec: FieldRef<"Bet", 'Float'>
    readonly stakeUnits: FieldRef<"Bet", 'Float'>
    readonly pModel: FieldRef<"Bet", 'Float'>
    readonly edgeProb: FieldRef<"Bet", 'Float'>
    readonly evPerUnit: FieldRef<"Bet", 'Float'>
    readonly kellyFull: FieldRef<"Bet", 'Float'>
    readonly kellyFrac: FieldRef<"Bet", 'Float'>
    readonly resultWinFlag: FieldRef<"Bet", 'Int'>
    readonly returnUnits: FieldRef<"Bet", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * Bet findUnique
   */
  export type BetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter, which Bet to fetch.
     */
    where: BetWhereUniqueInput
  }

  /**
   * Bet findUniqueOrThrow
   */
  export type BetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter, which Bet to fetch.
     */
    where: BetWhereUniqueInput
  }

  /**
   * Bet findFirst
   */
  export type BetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter, which Bet to fetch.
     */
    where?: BetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bets to fetch.
     */
    orderBy?: BetOrderByWithRelationInput | BetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bets.
     */
    cursor?: BetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bets.
     */
    distinct?: BetScalarFieldEnum | BetScalarFieldEnum[]
  }

  /**
   * Bet findFirstOrThrow
   */
  export type BetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter, which Bet to fetch.
     */
    where?: BetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bets to fetch.
     */
    orderBy?: BetOrderByWithRelationInput | BetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bets.
     */
    cursor?: BetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bets.
     */
    distinct?: BetScalarFieldEnum | BetScalarFieldEnum[]
  }

  /**
   * Bet findMany
   */
  export type BetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter, which Bets to fetch.
     */
    where?: BetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bets to fetch.
     */
    orderBy?: BetOrderByWithRelationInput | BetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bets.
     */
    cursor?: BetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bets.
     */
    skip?: number
    distinct?: BetScalarFieldEnum | BetScalarFieldEnum[]
  }

  /**
   * Bet create
   */
  export type BetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * The data needed to create a Bet.
     */
    data: XOR<BetCreateInput, BetUncheckedCreateInput>
  }

  /**
   * Bet createMany
   */
  export type BetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bets.
     */
    data: BetCreateManyInput | BetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bet createManyAndReturn
   */
  export type BetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * The data used to create many Bets.
     */
    data: BetCreateManyInput | BetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Bet update
   */
  export type BetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * The data needed to update a Bet.
     */
    data: XOR<BetUpdateInput, BetUncheckedUpdateInput>
    /**
     * Choose, which Bet to update.
     */
    where: BetWhereUniqueInput
  }

  /**
   * Bet updateMany
   */
  export type BetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bets.
     */
    data: XOR<BetUpdateManyMutationInput, BetUncheckedUpdateManyInput>
    /**
     * Filter which Bets to update
     */
    where?: BetWhereInput
    /**
     * Limit how many Bets to update.
     */
    limit?: number
  }

  /**
   * Bet updateManyAndReturn
   */
  export type BetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * The data used to update Bets.
     */
    data: XOR<BetUpdateManyMutationInput, BetUncheckedUpdateManyInput>
    /**
     * Filter which Bets to update
     */
    where?: BetWhereInput
    /**
     * Limit how many Bets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Bet upsert
   */
  export type BetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * The filter to search for the Bet to update in case it exists.
     */
    where: BetWhereUniqueInput
    /**
     * In case the Bet found by the `where` argument doesn't exist, create a new Bet with this data.
     */
    create: XOR<BetCreateInput, BetUncheckedCreateInput>
    /**
     * In case the Bet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BetUpdateInput, BetUncheckedUpdateInput>
  }

  /**
   * Bet delete
   */
  export type BetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter which Bet to delete.
     */
    where: BetWhereUniqueInput
  }

  /**
   * Bet deleteMany
   */
  export type BetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bets to delete
     */
    where?: BetWhereInput
    /**
     * Limit how many Bets to delete.
     */
    limit?: number
  }

  /**
   * Bet without action
   */
  export type BetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const WeekScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    label: 'label',
    eventName: 'eventName',
    eventYear: 'eventYear',
    eventId: 'eventId'
  };

  export type WeekScalarFieldEnum = (typeof WeekScalarFieldEnum)[keyof typeof WeekScalarFieldEnum]


  export const BetScalarFieldEnum: {
    id: 'id',
    weekId: 'weekId',
    placedAtUtc: 'placedAtUtc',
    betType: 'betType',
    playerName: 'playerName',
    dgId: 'dgId',
    marketBookBest: 'marketBookBest',
    marketOddsBestDec: 'marketOddsBestDec',
    stakeUnits: 'stakeUnits',
    pModel: 'pModel',
    edgeProb: 'edgeProb',
    evPerUnit: 'evPerUnit',
    kellyFull: 'kellyFull',
    kellyFrac: 'kellyFrac',
    resultWinFlag: 'resultWinFlag',
    returnUnits: 'returnUnits'
  };

  export type BetScalarFieldEnum = (typeof BetScalarFieldEnum)[keyof typeof BetScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type WeekWhereInput = {
    AND?: WeekWhereInput | WeekWhereInput[]
    OR?: WeekWhereInput[]
    NOT?: WeekWhereInput | WeekWhereInput[]
    id?: IntFilter<"Week"> | number
    createdAt?: DateTimeFilter<"Week"> | Date | string
    label?: StringFilter<"Week"> | string
    eventName?: StringFilter<"Week"> | string
    eventYear?: IntFilter<"Week"> | number
    eventId?: StringFilter<"Week"> | string
    bets?: BetListRelationFilter
  }

  export type WeekOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    label?: SortOrder
    eventName?: SortOrder
    eventYear?: SortOrder
    eventId?: SortOrder
    bets?: BetOrderByRelationAggregateInput
  }

  export type WeekWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    eventId?: string
    AND?: WeekWhereInput | WeekWhereInput[]
    OR?: WeekWhereInput[]
    NOT?: WeekWhereInput | WeekWhereInput[]
    createdAt?: DateTimeFilter<"Week"> | Date | string
    label?: StringFilter<"Week"> | string
    eventName?: StringFilter<"Week"> | string
    eventYear?: IntFilter<"Week"> | number
    bets?: BetListRelationFilter
  }, "id" | "eventId">

  export type WeekOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    label?: SortOrder
    eventName?: SortOrder
    eventYear?: SortOrder
    eventId?: SortOrder
    _count?: WeekCountOrderByAggregateInput
    _avg?: WeekAvgOrderByAggregateInput
    _max?: WeekMaxOrderByAggregateInput
    _min?: WeekMinOrderByAggregateInput
    _sum?: WeekSumOrderByAggregateInput
  }

  export type WeekScalarWhereWithAggregatesInput = {
    AND?: WeekScalarWhereWithAggregatesInput | WeekScalarWhereWithAggregatesInput[]
    OR?: WeekScalarWhereWithAggregatesInput[]
    NOT?: WeekScalarWhereWithAggregatesInput | WeekScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Week"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Week"> | Date | string
    label?: StringWithAggregatesFilter<"Week"> | string
    eventName?: StringWithAggregatesFilter<"Week"> | string
    eventYear?: IntWithAggregatesFilter<"Week"> | number
    eventId?: StringWithAggregatesFilter<"Week"> | string
  }

  export type BetWhereInput = {
    AND?: BetWhereInput | BetWhereInput[]
    OR?: BetWhereInput[]
    NOT?: BetWhereInput | BetWhereInput[]
    id?: IntFilter<"Bet"> | number
    weekId?: IntFilter<"Bet"> | number
    placedAtUtc?: StringNullableFilter<"Bet"> | string | null
    betType?: StringFilter<"Bet"> | string
    playerName?: StringFilter<"Bet"> | string
    dgId?: IntNullableFilter<"Bet"> | number | null
    marketBookBest?: StringNullableFilter<"Bet"> | string | null
    marketOddsBestDec?: FloatNullableFilter<"Bet"> | number | null
    stakeUnits?: FloatNullableFilter<"Bet"> | number | null
    pModel?: FloatNullableFilter<"Bet"> | number | null
    edgeProb?: FloatNullableFilter<"Bet"> | number | null
    evPerUnit?: FloatNullableFilter<"Bet"> | number | null
    kellyFull?: FloatNullableFilter<"Bet"> | number | null
    kellyFrac?: FloatNullableFilter<"Bet"> | number | null
    resultWinFlag?: IntNullableFilter<"Bet"> | number | null
    returnUnits?: FloatNullableFilter<"Bet"> | number | null
    week?: XOR<WeekScalarRelationFilter, WeekWhereInput>
  }

  export type BetOrderByWithRelationInput = {
    id?: SortOrder
    weekId?: SortOrder
    placedAtUtc?: SortOrderInput | SortOrder
    betType?: SortOrder
    playerName?: SortOrder
    dgId?: SortOrderInput | SortOrder
    marketBookBest?: SortOrderInput | SortOrder
    marketOddsBestDec?: SortOrderInput | SortOrder
    stakeUnits?: SortOrderInput | SortOrder
    pModel?: SortOrderInput | SortOrder
    edgeProb?: SortOrderInput | SortOrder
    evPerUnit?: SortOrderInput | SortOrder
    kellyFull?: SortOrderInput | SortOrder
    kellyFrac?: SortOrderInput | SortOrder
    resultWinFlag?: SortOrderInput | SortOrder
    returnUnits?: SortOrderInput | SortOrder
    week?: WeekOrderByWithRelationInput
  }

  export type BetWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: BetWhereInput | BetWhereInput[]
    OR?: BetWhereInput[]
    NOT?: BetWhereInput | BetWhereInput[]
    weekId?: IntFilter<"Bet"> | number
    placedAtUtc?: StringNullableFilter<"Bet"> | string | null
    betType?: StringFilter<"Bet"> | string
    playerName?: StringFilter<"Bet"> | string
    dgId?: IntNullableFilter<"Bet"> | number | null
    marketBookBest?: StringNullableFilter<"Bet"> | string | null
    marketOddsBestDec?: FloatNullableFilter<"Bet"> | number | null
    stakeUnits?: FloatNullableFilter<"Bet"> | number | null
    pModel?: FloatNullableFilter<"Bet"> | number | null
    edgeProb?: FloatNullableFilter<"Bet"> | number | null
    evPerUnit?: FloatNullableFilter<"Bet"> | number | null
    kellyFull?: FloatNullableFilter<"Bet"> | number | null
    kellyFrac?: FloatNullableFilter<"Bet"> | number | null
    resultWinFlag?: IntNullableFilter<"Bet"> | number | null
    returnUnits?: FloatNullableFilter<"Bet"> | number | null
    week?: XOR<WeekScalarRelationFilter, WeekWhereInput>
  }, "id">

  export type BetOrderByWithAggregationInput = {
    id?: SortOrder
    weekId?: SortOrder
    placedAtUtc?: SortOrderInput | SortOrder
    betType?: SortOrder
    playerName?: SortOrder
    dgId?: SortOrderInput | SortOrder
    marketBookBest?: SortOrderInput | SortOrder
    marketOddsBestDec?: SortOrderInput | SortOrder
    stakeUnits?: SortOrderInput | SortOrder
    pModel?: SortOrderInput | SortOrder
    edgeProb?: SortOrderInput | SortOrder
    evPerUnit?: SortOrderInput | SortOrder
    kellyFull?: SortOrderInput | SortOrder
    kellyFrac?: SortOrderInput | SortOrder
    resultWinFlag?: SortOrderInput | SortOrder
    returnUnits?: SortOrderInput | SortOrder
    _count?: BetCountOrderByAggregateInput
    _avg?: BetAvgOrderByAggregateInput
    _max?: BetMaxOrderByAggregateInput
    _min?: BetMinOrderByAggregateInput
    _sum?: BetSumOrderByAggregateInput
  }

  export type BetScalarWhereWithAggregatesInput = {
    AND?: BetScalarWhereWithAggregatesInput | BetScalarWhereWithAggregatesInput[]
    OR?: BetScalarWhereWithAggregatesInput[]
    NOT?: BetScalarWhereWithAggregatesInput | BetScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Bet"> | number
    weekId?: IntWithAggregatesFilter<"Bet"> | number
    placedAtUtc?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    betType?: StringWithAggregatesFilter<"Bet"> | string
    playerName?: StringWithAggregatesFilter<"Bet"> | string
    dgId?: IntNullableWithAggregatesFilter<"Bet"> | number | null
    marketBookBest?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    marketOddsBestDec?: FloatNullableWithAggregatesFilter<"Bet"> | number | null
    stakeUnits?: FloatNullableWithAggregatesFilter<"Bet"> | number | null
    pModel?: FloatNullableWithAggregatesFilter<"Bet"> | number | null
    edgeProb?: FloatNullableWithAggregatesFilter<"Bet"> | number | null
    evPerUnit?: FloatNullableWithAggregatesFilter<"Bet"> | number | null
    kellyFull?: FloatNullableWithAggregatesFilter<"Bet"> | number | null
    kellyFrac?: FloatNullableWithAggregatesFilter<"Bet"> | number | null
    resultWinFlag?: IntNullableWithAggregatesFilter<"Bet"> | number | null
    returnUnits?: FloatNullableWithAggregatesFilter<"Bet"> | number | null
  }

  export type WeekCreateInput = {
    createdAt?: Date | string
    label: string
    eventName: string
    eventYear: number
    eventId: string
    bets?: BetCreateNestedManyWithoutWeekInput
  }

  export type WeekUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    label: string
    eventName: string
    eventYear: number
    eventId: string
    bets?: BetUncheckedCreateNestedManyWithoutWeekInput
  }

  export type WeekUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    label?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    eventYear?: IntFieldUpdateOperationsInput | number
    eventId?: StringFieldUpdateOperationsInput | string
    bets?: BetUpdateManyWithoutWeekNestedInput
  }

  export type WeekUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    label?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    eventYear?: IntFieldUpdateOperationsInput | number
    eventId?: StringFieldUpdateOperationsInput | string
    bets?: BetUncheckedUpdateManyWithoutWeekNestedInput
  }

  export type WeekCreateManyInput = {
    id?: number
    createdAt?: Date | string
    label: string
    eventName: string
    eventYear: number
    eventId: string
  }

  export type WeekUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    label?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    eventYear?: IntFieldUpdateOperationsInput | number
    eventId?: StringFieldUpdateOperationsInput | string
  }

  export type WeekUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    label?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    eventYear?: IntFieldUpdateOperationsInput | number
    eventId?: StringFieldUpdateOperationsInput | string
  }

  export type BetCreateInput = {
    placedAtUtc?: string | null
    betType: string
    playerName: string
    dgId?: number | null
    marketBookBest?: string | null
    marketOddsBestDec?: number | null
    stakeUnits?: number | null
    pModel?: number | null
    edgeProb?: number | null
    evPerUnit?: number | null
    kellyFull?: number | null
    kellyFrac?: number | null
    resultWinFlag?: number | null
    returnUnits?: number | null
    week: WeekCreateNestedOneWithoutBetsInput
  }

  export type BetUncheckedCreateInput = {
    id?: number
    weekId: number
    placedAtUtc?: string | null
    betType: string
    playerName: string
    dgId?: number | null
    marketBookBest?: string | null
    marketOddsBestDec?: number | null
    stakeUnits?: number | null
    pModel?: number | null
    edgeProb?: number | null
    evPerUnit?: number | null
    kellyFull?: number | null
    kellyFrac?: number | null
    resultWinFlag?: number | null
    returnUnits?: number | null
  }

  export type BetUpdateInput = {
    placedAtUtc?: NullableStringFieldUpdateOperationsInput | string | null
    betType?: StringFieldUpdateOperationsInput | string
    playerName?: StringFieldUpdateOperationsInput | string
    dgId?: NullableIntFieldUpdateOperationsInput | number | null
    marketBookBest?: NullableStringFieldUpdateOperationsInput | string | null
    marketOddsBestDec?: NullableFloatFieldUpdateOperationsInput | number | null
    stakeUnits?: NullableFloatFieldUpdateOperationsInput | number | null
    pModel?: NullableFloatFieldUpdateOperationsInput | number | null
    edgeProb?: NullableFloatFieldUpdateOperationsInput | number | null
    evPerUnit?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFull?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFrac?: NullableFloatFieldUpdateOperationsInput | number | null
    resultWinFlag?: NullableIntFieldUpdateOperationsInput | number | null
    returnUnits?: NullableFloatFieldUpdateOperationsInput | number | null
    week?: WeekUpdateOneRequiredWithoutBetsNestedInput
  }

  export type BetUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    weekId?: IntFieldUpdateOperationsInput | number
    placedAtUtc?: NullableStringFieldUpdateOperationsInput | string | null
    betType?: StringFieldUpdateOperationsInput | string
    playerName?: StringFieldUpdateOperationsInput | string
    dgId?: NullableIntFieldUpdateOperationsInput | number | null
    marketBookBest?: NullableStringFieldUpdateOperationsInput | string | null
    marketOddsBestDec?: NullableFloatFieldUpdateOperationsInput | number | null
    stakeUnits?: NullableFloatFieldUpdateOperationsInput | number | null
    pModel?: NullableFloatFieldUpdateOperationsInput | number | null
    edgeProb?: NullableFloatFieldUpdateOperationsInput | number | null
    evPerUnit?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFull?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFrac?: NullableFloatFieldUpdateOperationsInput | number | null
    resultWinFlag?: NullableIntFieldUpdateOperationsInput | number | null
    returnUnits?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type BetCreateManyInput = {
    id?: number
    weekId: number
    placedAtUtc?: string | null
    betType: string
    playerName: string
    dgId?: number | null
    marketBookBest?: string | null
    marketOddsBestDec?: number | null
    stakeUnits?: number | null
    pModel?: number | null
    edgeProb?: number | null
    evPerUnit?: number | null
    kellyFull?: number | null
    kellyFrac?: number | null
    resultWinFlag?: number | null
    returnUnits?: number | null
  }

  export type BetUpdateManyMutationInput = {
    placedAtUtc?: NullableStringFieldUpdateOperationsInput | string | null
    betType?: StringFieldUpdateOperationsInput | string
    playerName?: StringFieldUpdateOperationsInput | string
    dgId?: NullableIntFieldUpdateOperationsInput | number | null
    marketBookBest?: NullableStringFieldUpdateOperationsInput | string | null
    marketOddsBestDec?: NullableFloatFieldUpdateOperationsInput | number | null
    stakeUnits?: NullableFloatFieldUpdateOperationsInput | number | null
    pModel?: NullableFloatFieldUpdateOperationsInput | number | null
    edgeProb?: NullableFloatFieldUpdateOperationsInput | number | null
    evPerUnit?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFull?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFrac?: NullableFloatFieldUpdateOperationsInput | number | null
    resultWinFlag?: NullableIntFieldUpdateOperationsInput | number | null
    returnUnits?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type BetUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    weekId?: IntFieldUpdateOperationsInput | number
    placedAtUtc?: NullableStringFieldUpdateOperationsInput | string | null
    betType?: StringFieldUpdateOperationsInput | string
    playerName?: StringFieldUpdateOperationsInput | string
    dgId?: NullableIntFieldUpdateOperationsInput | number | null
    marketBookBest?: NullableStringFieldUpdateOperationsInput | string | null
    marketOddsBestDec?: NullableFloatFieldUpdateOperationsInput | number | null
    stakeUnits?: NullableFloatFieldUpdateOperationsInput | number | null
    pModel?: NullableFloatFieldUpdateOperationsInput | number | null
    edgeProb?: NullableFloatFieldUpdateOperationsInput | number | null
    evPerUnit?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFull?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFrac?: NullableFloatFieldUpdateOperationsInput | number | null
    resultWinFlag?: NullableIntFieldUpdateOperationsInput | number | null
    returnUnits?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BetListRelationFilter = {
    every?: BetWhereInput
    some?: BetWhereInput
    none?: BetWhereInput
  }

  export type BetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WeekCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    label?: SortOrder
    eventName?: SortOrder
    eventYear?: SortOrder
    eventId?: SortOrder
  }

  export type WeekAvgOrderByAggregateInput = {
    id?: SortOrder
    eventYear?: SortOrder
  }

  export type WeekMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    label?: SortOrder
    eventName?: SortOrder
    eventYear?: SortOrder
    eventId?: SortOrder
  }

  export type WeekMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    label?: SortOrder
    eventName?: SortOrder
    eventYear?: SortOrder
    eventId?: SortOrder
  }

  export type WeekSumOrderByAggregateInput = {
    id?: SortOrder
    eventYear?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type WeekScalarRelationFilter = {
    is?: WeekWhereInput
    isNot?: WeekWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BetCountOrderByAggregateInput = {
    id?: SortOrder
    weekId?: SortOrder
    placedAtUtc?: SortOrder
    betType?: SortOrder
    playerName?: SortOrder
    dgId?: SortOrder
    marketBookBest?: SortOrder
    marketOddsBestDec?: SortOrder
    stakeUnits?: SortOrder
    pModel?: SortOrder
    edgeProb?: SortOrder
    evPerUnit?: SortOrder
    kellyFull?: SortOrder
    kellyFrac?: SortOrder
    resultWinFlag?: SortOrder
    returnUnits?: SortOrder
  }

  export type BetAvgOrderByAggregateInput = {
    id?: SortOrder
    weekId?: SortOrder
    dgId?: SortOrder
    marketOddsBestDec?: SortOrder
    stakeUnits?: SortOrder
    pModel?: SortOrder
    edgeProb?: SortOrder
    evPerUnit?: SortOrder
    kellyFull?: SortOrder
    kellyFrac?: SortOrder
    resultWinFlag?: SortOrder
    returnUnits?: SortOrder
  }

  export type BetMaxOrderByAggregateInput = {
    id?: SortOrder
    weekId?: SortOrder
    placedAtUtc?: SortOrder
    betType?: SortOrder
    playerName?: SortOrder
    dgId?: SortOrder
    marketBookBest?: SortOrder
    marketOddsBestDec?: SortOrder
    stakeUnits?: SortOrder
    pModel?: SortOrder
    edgeProb?: SortOrder
    evPerUnit?: SortOrder
    kellyFull?: SortOrder
    kellyFrac?: SortOrder
    resultWinFlag?: SortOrder
    returnUnits?: SortOrder
  }

  export type BetMinOrderByAggregateInput = {
    id?: SortOrder
    weekId?: SortOrder
    placedAtUtc?: SortOrder
    betType?: SortOrder
    playerName?: SortOrder
    dgId?: SortOrder
    marketBookBest?: SortOrder
    marketOddsBestDec?: SortOrder
    stakeUnits?: SortOrder
    pModel?: SortOrder
    edgeProb?: SortOrder
    evPerUnit?: SortOrder
    kellyFull?: SortOrder
    kellyFrac?: SortOrder
    resultWinFlag?: SortOrder
    returnUnits?: SortOrder
  }

  export type BetSumOrderByAggregateInput = {
    id?: SortOrder
    weekId?: SortOrder
    dgId?: SortOrder
    marketOddsBestDec?: SortOrder
    stakeUnits?: SortOrder
    pModel?: SortOrder
    edgeProb?: SortOrder
    evPerUnit?: SortOrder
    kellyFull?: SortOrder
    kellyFrac?: SortOrder
    resultWinFlag?: SortOrder
    returnUnits?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type BetCreateNestedManyWithoutWeekInput = {
    create?: XOR<BetCreateWithoutWeekInput, BetUncheckedCreateWithoutWeekInput> | BetCreateWithoutWeekInput[] | BetUncheckedCreateWithoutWeekInput[]
    connectOrCreate?: BetCreateOrConnectWithoutWeekInput | BetCreateOrConnectWithoutWeekInput[]
    createMany?: BetCreateManyWeekInputEnvelope
    connect?: BetWhereUniqueInput | BetWhereUniqueInput[]
  }

  export type BetUncheckedCreateNestedManyWithoutWeekInput = {
    create?: XOR<BetCreateWithoutWeekInput, BetUncheckedCreateWithoutWeekInput> | BetCreateWithoutWeekInput[] | BetUncheckedCreateWithoutWeekInput[]
    connectOrCreate?: BetCreateOrConnectWithoutWeekInput | BetCreateOrConnectWithoutWeekInput[]
    createMany?: BetCreateManyWeekInputEnvelope
    connect?: BetWhereUniqueInput | BetWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BetUpdateManyWithoutWeekNestedInput = {
    create?: XOR<BetCreateWithoutWeekInput, BetUncheckedCreateWithoutWeekInput> | BetCreateWithoutWeekInput[] | BetUncheckedCreateWithoutWeekInput[]
    connectOrCreate?: BetCreateOrConnectWithoutWeekInput | BetCreateOrConnectWithoutWeekInput[]
    upsert?: BetUpsertWithWhereUniqueWithoutWeekInput | BetUpsertWithWhereUniqueWithoutWeekInput[]
    createMany?: BetCreateManyWeekInputEnvelope
    set?: BetWhereUniqueInput | BetWhereUniqueInput[]
    disconnect?: BetWhereUniqueInput | BetWhereUniqueInput[]
    delete?: BetWhereUniqueInput | BetWhereUniqueInput[]
    connect?: BetWhereUniqueInput | BetWhereUniqueInput[]
    update?: BetUpdateWithWhereUniqueWithoutWeekInput | BetUpdateWithWhereUniqueWithoutWeekInput[]
    updateMany?: BetUpdateManyWithWhereWithoutWeekInput | BetUpdateManyWithWhereWithoutWeekInput[]
    deleteMany?: BetScalarWhereInput | BetScalarWhereInput[]
  }

  export type BetUncheckedUpdateManyWithoutWeekNestedInput = {
    create?: XOR<BetCreateWithoutWeekInput, BetUncheckedCreateWithoutWeekInput> | BetCreateWithoutWeekInput[] | BetUncheckedCreateWithoutWeekInput[]
    connectOrCreate?: BetCreateOrConnectWithoutWeekInput | BetCreateOrConnectWithoutWeekInput[]
    upsert?: BetUpsertWithWhereUniqueWithoutWeekInput | BetUpsertWithWhereUniqueWithoutWeekInput[]
    createMany?: BetCreateManyWeekInputEnvelope
    set?: BetWhereUniqueInput | BetWhereUniqueInput[]
    disconnect?: BetWhereUniqueInput | BetWhereUniqueInput[]
    delete?: BetWhereUniqueInput | BetWhereUniqueInput[]
    connect?: BetWhereUniqueInput | BetWhereUniqueInput[]
    update?: BetUpdateWithWhereUniqueWithoutWeekInput | BetUpdateWithWhereUniqueWithoutWeekInput[]
    updateMany?: BetUpdateManyWithWhereWithoutWeekInput | BetUpdateManyWithWhereWithoutWeekInput[]
    deleteMany?: BetScalarWhereInput | BetScalarWhereInput[]
  }

  export type WeekCreateNestedOneWithoutBetsInput = {
    create?: XOR<WeekCreateWithoutBetsInput, WeekUncheckedCreateWithoutBetsInput>
    connectOrCreate?: WeekCreateOrConnectWithoutBetsInput
    connect?: WeekWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type WeekUpdateOneRequiredWithoutBetsNestedInput = {
    create?: XOR<WeekCreateWithoutBetsInput, WeekUncheckedCreateWithoutBetsInput>
    connectOrCreate?: WeekCreateOrConnectWithoutBetsInput
    upsert?: WeekUpsertWithoutBetsInput
    connect?: WeekWhereUniqueInput
    update?: XOR<XOR<WeekUpdateToOneWithWhereWithoutBetsInput, WeekUpdateWithoutBetsInput>, WeekUncheckedUpdateWithoutBetsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type BetCreateWithoutWeekInput = {
    placedAtUtc?: string | null
    betType: string
    playerName: string
    dgId?: number | null
    marketBookBest?: string | null
    marketOddsBestDec?: number | null
    stakeUnits?: number | null
    pModel?: number | null
    edgeProb?: number | null
    evPerUnit?: number | null
    kellyFull?: number | null
    kellyFrac?: number | null
    resultWinFlag?: number | null
    returnUnits?: number | null
  }

  export type BetUncheckedCreateWithoutWeekInput = {
    id?: number
    placedAtUtc?: string | null
    betType: string
    playerName: string
    dgId?: number | null
    marketBookBest?: string | null
    marketOddsBestDec?: number | null
    stakeUnits?: number | null
    pModel?: number | null
    edgeProb?: number | null
    evPerUnit?: number | null
    kellyFull?: number | null
    kellyFrac?: number | null
    resultWinFlag?: number | null
    returnUnits?: number | null
  }

  export type BetCreateOrConnectWithoutWeekInput = {
    where: BetWhereUniqueInput
    create: XOR<BetCreateWithoutWeekInput, BetUncheckedCreateWithoutWeekInput>
  }

  export type BetCreateManyWeekInputEnvelope = {
    data: BetCreateManyWeekInput | BetCreateManyWeekInput[]
    skipDuplicates?: boolean
  }

  export type BetUpsertWithWhereUniqueWithoutWeekInput = {
    where: BetWhereUniqueInput
    update: XOR<BetUpdateWithoutWeekInput, BetUncheckedUpdateWithoutWeekInput>
    create: XOR<BetCreateWithoutWeekInput, BetUncheckedCreateWithoutWeekInput>
  }

  export type BetUpdateWithWhereUniqueWithoutWeekInput = {
    where: BetWhereUniqueInput
    data: XOR<BetUpdateWithoutWeekInput, BetUncheckedUpdateWithoutWeekInput>
  }

  export type BetUpdateManyWithWhereWithoutWeekInput = {
    where: BetScalarWhereInput
    data: XOR<BetUpdateManyMutationInput, BetUncheckedUpdateManyWithoutWeekInput>
  }

  export type BetScalarWhereInput = {
    AND?: BetScalarWhereInput | BetScalarWhereInput[]
    OR?: BetScalarWhereInput[]
    NOT?: BetScalarWhereInput | BetScalarWhereInput[]
    id?: IntFilter<"Bet"> | number
    weekId?: IntFilter<"Bet"> | number
    placedAtUtc?: StringNullableFilter<"Bet"> | string | null
    betType?: StringFilter<"Bet"> | string
    playerName?: StringFilter<"Bet"> | string
    dgId?: IntNullableFilter<"Bet"> | number | null
    marketBookBest?: StringNullableFilter<"Bet"> | string | null
    marketOddsBestDec?: FloatNullableFilter<"Bet"> | number | null
    stakeUnits?: FloatNullableFilter<"Bet"> | number | null
    pModel?: FloatNullableFilter<"Bet"> | number | null
    edgeProb?: FloatNullableFilter<"Bet"> | number | null
    evPerUnit?: FloatNullableFilter<"Bet"> | number | null
    kellyFull?: FloatNullableFilter<"Bet"> | number | null
    kellyFrac?: FloatNullableFilter<"Bet"> | number | null
    resultWinFlag?: IntNullableFilter<"Bet"> | number | null
    returnUnits?: FloatNullableFilter<"Bet"> | number | null
  }

  export type WeekCreateWithoutBetsInput = {
    createdAt?: Date | string
    label: string
    eventName: string
    eventYear: number
    eventId: string
  }

  export type WeekUncheckedCreateWithoutBetsInput = {
    id?: number
    createdAt?: Date | string
    label: string
    eventName: string
    eventYear: number
    eventId: string
  }

  export type WeekCreateOrConnectWithoutBetsInput = {
    where: WeekWhereUniqueInput
    create: XOR<WeekCreateWithoutBetsInput, WeekUncheckedCreateWithoutBetsInput>
  }

  export type WeekUpsertWithoutBetsInput = {
    update: XOR<WeekUpdateWithoutBetsInput, WeekUncheckedUpdateWithoutBetsInput>
    create: XOR<WeekCreateWithoutBetsInput, WeekUncheckedCreateWithoutBetsInput>
    where?: WeekWhereInput
  }

  export type WeekUpdateToOneWithWhereWithoutBetsInput = {
    where?: WeekWhereInput
    data: XOR<WeekUpdateWithoutBetsInput, WeekUncheckedUpdateWithoutBetsInput>
  }

  export type WeekUpdateWithoutBetsInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    label?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    eventYear?: IntFieldUpdateOperationsInput | number
    eventId?: StringFieldUpdateOperationsInput | string
  }

  export type WeekUncheckedUpdateWithoutBetsInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    label?: StringFieldUpdateOperationsInput | string
    eventName?: StringFieldUpdateOperationsInput | string
    eventYear?: IntFieldUpdateOperationsInput | number
    eventId?: StringFieldUpdateOperationsInput | string
  }

  export type BetCreateManyWeekInput = {
    id?: number
    placedAtUtc?: string | null
    betType: string
    playerName: string
    dgId?: number | null
    marketBookBest?: string | null
    marketOddsBestDec?: number | null
    stakeUnits?: number | null
    pModel?: number | null
    edgeProb?: number | null
    evPerUnit?: number | null
    kellyFull?: number | null
    kellyFrac?: number | null
    resultWinFlag?: number | null
    returnUnits?: number | null
  }

  export type BetUpdateWithoutWeekInput = {
    placedAtUtc?: NullableStringFieldUpdateOperationsInput | string | null
    betType?: StringFieldUpdateOperationsInput | string
    playerName?: StringFieldUpdateOperationsInput | string
    dgId?: NullableIntFieldUpdateOperationsInput | number | null
    marketBookBest?: NullableStringFieldUpdateOperationsInput | string | null
    marketOddsBestDec?: NullableFloatFieldUpdateOperationsInput | number | null
    stakeUnits?: NullableFloatFieldUpdateOperationsInput | number | null
    pModel?: NullableFloatFieldUpdateOperationsInput | number | null
    edgeProb?: NullableFloatFieldUpdateOperationsInput | number | null
    evPerUnit?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFull?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFrac?: NullableFloatFieldUpdateOperationsInput | number | null
    resultWinFlag?: NullableIntFieldUpdateOperationsInput | number | null
    returnUnits?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type BetUncheckedUpdateWithoutWeekInput = {
    id?: IntFieldUpdateOperationsInput | number
    placedAtUtc?: NullableStringFieldUpdateOperationsInput | string | null
    betType?: StringFieldUpdateOperationsInput | string
    playerName?: StringFieldUpdateOperationsInput | string
    dgId?: NullableIntFieldUpdateOperationsInput | number | null
    marketBookBest?: NullableStringFieldUpdateOperationsInput | string | null
    marketOddsBestDec?: NullableFloatFieldUpdateOperationsInput | number | null
    stakeUnits?: NullableFloatFieldUpdateOperationsInput | number | null
    pModel?: NullableFloatFieldUpdateOperationsInput | number | null
    edgeProb?: NullableFloatFieldUpdateOperationsInput | number | null
    evPerUnit?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFull?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFrac?: NullableFloatFieldUpdateOperationsInput | number | null
    resultWinFlag?: NullableIntFieldUpdateOperationsInput | number | null
    returnUnits?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type BetUncheckedUpdateManyWithoutWeekInput = {
    id?: IntFieldUpdateOperationsInput | number
    placedAtUtc?: NullableStringFieldUpdateOperationsInput | string | null
    betType?: StringFieldUpdateOperationsInput | string
    playerName?: StringFieldUpdateOperationsInput | string
    dgId?: NullableIntFieldUpdateOperationsInput | number | null
    marketBookBest?: NullableStringFieldUpdateOperationsInput | string | null
    marketOddsBestDec?: NullableFloatFieldUpdateOperationsInput | number | null
    stakeUnits?: NullableFloatFieldUpdateOperationsInput | number | null
    pModel?: NullableFloatFieldUpdateOperationsInput | number | null
    edgeProb?: NullableFloatFieldUpdateOperationsInput | number | null
    evPerUnit?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFull?: NullableFloatFieldUpdateOperationsInput | number | null
    kellyFrac?: NullableFloatFieldUpdateOperationsInput | number | null
    resultWinFlag?: NullableIntFieldUpdateOperationsInput | number | null
    returnUnits?: NullableFloatFieldUpdateOperationsInput | number | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
import { Column, FinalColumn } from "@/types/column";
import { Table } from "@/types/table";
import { Pool, RowDataPacket } from "mysql2/promise";

type sqlToTsTypes<T extends string> = T extends "int"
  ? number
  : T extends "varchar"
    ? string
    : T extends "text"
      ? string
      : T extends "boolean"
        ? boolean
        : T extends "timestamp"
          ? Date
          : any;

type InferSelection<S extends Record<string, FinalColumn>> = {
  [K in keyof S]: sqlToTsTypes<S[K]["type"]>;
};

export class SelectBuilder<
  S extends Record<string, FinalColumn> = Record<string, FinalColumn>,
> {
  private _tableName: string = "";
  private limitNo?: number;

  constructor(
    private pool: Pool,
    private selection?: S,
  ) {}

  from<U extends Record<string, FinalColumn>>(table: Table<U>): this {
    this._tableName = table.name;
    return this;
  }

  limit(no: number): this {
    this.limitNo = no;
    return this;
  }

  async execute(): Promise<InferSelection<S>[]> {
    let cols;
    if (this.selection) {
      cols = Object.entries(this.selection)
        .map(([alias, col]) => {
          return `${col.table}.${col.name} AS ${alias}`;
        })
        .join(", ");
    }

    let sql = `SELECT ${cols ? cols : "*"} FROM ${this._tableName}`;

    if (this.limitNo !== undefined) sql += ` limit ${this.limitNo}`;

    const [rows] =
      await this.pool.query<(InferSelection<S> & RowDataPacket)[]>(sql);

    return rows;
  }
}

export class StarBuilder {
  constructor(private pool: Pool) {}

  from<U extends Record<string, Column>>(
    table: Table<U>,
  ): StarSelectBuilder<U> {
    return new StarSelectBuilder(this.pool, table);
  }
}

type InferRow<U extends Record<string, Column>> = {
  [K in keyof U]: sqlToTsTypes<U[K]["type"]>;
};

export class StarSelectBuilder<U extends Record<string, Column>> {
  private _limitNo?: number;
  constructor(
    private pool: Pool,
    private table: Table<U>,
  ) {}

  limit(no: number): this {
    this._limitNo = no;
    return this;
  }

  async execute(): Promise<InferRow<U>[]> {
    let sql = `SELECT * FROM ${this.table.name}`;

    if (this._limitNo !== undefined) {
      sql += ` limit ${this._limitNo} `;
    }

    const [rows] = await this.pool.query<(InferRow<U> & RowDataPacket)[]>(sql);

    return rows;
  }
}

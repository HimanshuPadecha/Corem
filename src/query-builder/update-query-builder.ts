import { Column } from "@/types/column.js";
import { InferRow, whereClause } from "@/types/query-parser.js";
import { Table } from "@/types/table.js";
import { Pool, RowDataPacket } from "mysql2/promise";
import { Returning } from "./delete-query-builder.js";
import { CoremError } from "@/core/corem-error.js";

export class UpdateBuilder<
  T extends Record<string, Column>,
  R extends Returning = "no",
> {
  setObj?: Partial<InferRow<T>>;
  condition?: whereClause;
  isReturning: boolean = false;

  constructor(
    private poolPromise: Promise<Pool>,
    private table: Table<T>,
  ) {}

  set(setObj: Partial<InferRow<T>>): this {
    this.setObj = setObj;
    return this;
  }

  where(condition: whereClause): this {
    this.condition = condition;
    return this;
  }

  protected whereParser(): string {
    if (!this.condition) return "";

    return `WHERE ${this.parseClause(this.condition)}`;
  }

  private parseClause(clause: whereClause): string {
    if ("type" in clause) {
      const inner = clause.conditions
        .map((condition) => `${this.parseClause(condition)}`)
        .join(` ${clause.type} `);
      return inner;
    }

    const { column, operator, arg, columnTwo } = clause;

    const left = `${column.table}.${column.name}`;

    if (columnTwo) {
      return `${left} ${operator} ${columnTwo.table}.${columnTwo.name}`;
    }

    if (Array.isArray(arg)) {
      const vals = arg
        .map((v) => (typeof v === "string" ? `'${v}'` : v))
        .join(", ");
      return `${left} IN (${vals})`;
    }

    const val = typeof arg === "string" ? `'${arg}'` : arg;

    return `${left} ${operator} ${val}`;
  }

  returning(): UpdateBuilder<T, "yes"> {
    const updated = this as unknown as UpdateBuilder<T, "yes">;
    updated.isReturning = true;
    return updated;
  }

  async execute(): Promise<R extends "yes" ? InferRow<T>[] : null> {
    if (!this.setObj) {
      throw new CoremError({
        code: "NOT_FOUND",
        message: "Cannot update without setobject !!",
      });
    }

    const pool = await this.poolPromise

    const entries = Object.entries(this.setObj);
    const cols = entries.map(([key]) => `${key} = ?`).join(", ");
    const params = entries.map(([, value]) => value);

    const sql = `UPDATE ${this.table.name} SET ${cols} ${this.whereParser()}`;

    await pool.query(sql,params);

    let rows: InferRow<T>[] = [];

    if (this.isReturning) {
      let sql = `SELECT * FROM ${this.table.name} ${this.whereParser()};`;

      let [updatedRows] =
        await pool.query<(InferRow<T> & RowDataPacket)[]>(sql);

      rows = updatedRows;
    }

    // this.pool.end()

    return (this.isReturning ? rows : null) as any;
  }
}

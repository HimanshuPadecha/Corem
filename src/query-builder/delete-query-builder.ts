import { Column } from "@/types/column.js";
import { InferRow, whereClause } from "@/types/query-parser.js";
import { Table } from "@/types/table.js";
import { Pool, RowDataPacket } from "mysql2/promise";

export type Returning = "yes" | "no";

export class DeleteBuilder<
  T extends Record<string, Column>,
  R extends Returning = "no",
> {
  private _tableName: string = "";
  private condition?: whereClause;
  private isReturning: boolean = false;

  constructor(private poolPromise: Promise<Pool>) {}

  from<U extends Record<string, Column>>(
    table: Table<U>,
  ): DeleteBuilder<U> {
    const next = new DeleteBuilder<U>(this.poolPromise);
    next._tableName = table.name;
    return next;
  }

  where(condition: whereClause): this {
    this.condition = condition;
    return this;
  }

  protected whereParser(): string {
    if (!this.condition) return "";

    return ` WHERE ${this.parseClause(this.condition)} `;
  }

  private parseClause(clause: whereClause): string {
    if ("type" in clause) {
      const inner = clause.conditions
        .map((condition) => ` ${this.parseClause(condition)} `)
        .join(`${clause.type}`);
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

  returning(): DeleteBuilder<T, "yes"> {
    const next = this as unknown as DeleteBuilder<T, "yes">;
    next.isReturning = true;
    return next;
  }

  async execute(): Promise<R extends "yes" ? InferRow<T>[] : null> {
    let deletedRows: InferRow<T>[] = [];

    const pool = await this.poolPromise

    if (this.isReturning) {
      const selectsql = `SELECT * FROM ${this._tableName} ${this.whereParser()};`;

      const [rows] =
        await pool.query<(InferRow<T> & RowDataPacket)[]>(selectsql);

      deletedRows = rows;
    }
    let sql = `DELETE FROM ${this._tableName} ${this.whereParser()};`;

    await pool.query(sql);

    // this.pool.end()

    return (this.isReturning ? deletedRows : null) as any;
  }
}

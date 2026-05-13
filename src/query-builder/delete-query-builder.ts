import { FinalColumn } from "@/types/column";
import { InferRow, whereClause } from "@/types/query-parser";
import { Table } from "@/types/table";
import { Pool, RowDataPacket } from "mysql2/promise";

export class DeleteBuilder<T extends Record<string, FinalColumn>> {
  private _tableName: string = "";
  private condition?: whereClause;
  private isReturning: boolean = false;

  constructor(private pool: Pool) {}

  from<U extends Record<string, FinalColumn>>(table: Table<U>): this {
    this._tableName = table.name;
    return this;
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
        .map((condition) => `${this.parseClause(condition)}`)
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

  returning(): this {
    this.isReturning = true;
    return this;
  }

  async execute(): Promise<InferRow<T>[] | null> {
    let deletedRows: InferRow<T>[] = [];

    if (this.isReturning) {
      const selectsql = `SELECT * FROM ${this._tableName} ${this.whereParser()};`;

      const [rows] =
        await this.pool.query<(InferRow<T> & RowDataPacket)[]>(selectsql);

      deletedRows = rows;
    }
    let sql = `DELETE FROM ${this._tableName} ${this.whereParser()};`;

    await this.pool.query(sql);

    return deletedRows ?? null;
  }
}

import { CoremError } from "@/core/corem-error";
import { FinalColumn } from "@/types/column";
import { sqlToTsTypes } from "@/types/query-parser";
import { Table } from "@/types/table";
import { Pool } from "mysql2/promise";

type InferInsertValues<U extends Record<string, FinalColumn>> = {
  [K in keyof U]: sqlToTsTypes<U[K]["type"]>;
};

export class InsertBuilder<T extends Record<string, FinalColumn>> {
  private _values?: InferInsertValues<T>;

  constructor(
    private pool: Pool,
    private table: Table<T>,
  ) {}

  values(data: InferInsertValues<T>): this {
    this._values = data;
    return this;
  }

  async execute(): Promise<void> {
    if (!this._values) {
      throw new CoremError({
        code: "NOT_FOUND",
        message: "No values provided !",
      });
    }

    const columns = Object.keys(this._values).join(", ");
    const placeholders = Object.keys(this._values).fill("?").join(", ");
    const params = Object.values(this._values).join(", ");

    let sql = `INSERT INTO ${this.table.name} (${columns}) VALUES (${placeholders})`;

    await this.pool.query(sql, params);
  }
}

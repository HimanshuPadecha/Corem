import { Column, FinalColumn } from "@/types/column";
import { InferRow, InferSelection, Order, whereClause } from "@/types/query-parser";
import { Table } from "@/types/table";
import { Pool, RowDataPacket } from "mysql2/promise";

export abstract class BaseSelectionBuilder<TResult> {
  protected _tableName: string = "";
  protected limitNo?: number;
  protected orders?: Order[];
  protected condition?: whereClause;

  constructor(protected pool: Pool) {}

  limit(no: number): this {
    this.limitNo = no;
    return this;
  }

  orderBy(...orders: Order[]): this {
    this.orders = orders;
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

  protected limitParser(): string {
    if (this.limit !== undefined) {
      return ` LIMIT ${this.limitNo} `;
    }

    return "";
  }

  protected orderParser(): string {
    if (this.orders !== undefined) {
      let sql = " ORDER BY ";

      sql += this.orders
        .map(
          ({ column, orderType }) =>
            ` ${column.table}.${column.name} ${orderType} `,
        )
        .join(",");

      return sql;
    }

    return "";
  }

  abstract execute(): Promise<TResult[]>;
}

export class SelectBuilder<
  S extends Record<string, FinalColumn> = Record<string, FinalColumn>,
> extends BaseSelectionBuilder<InferSelection<S>> {
  constructor(
    pool: Pool,
    private selection: S,
  ) {
    super(pool);
  }

  from<U extends Record<string, FinalColumn>>(table: Table<U>): this {
    this._tableName = table.name;
    return this;
  }

  async execute(): Promise<InferSelection<S>[]> {
    const cols = Object.entries(this.selection)
      .map(([alias, col]) => {
        return `${col.table}.${col.name} AS ${alias}`;
      })
      .join(", ");

    let sql = `SELECT ${cols} FROM ${this._tableName} ${this.whereParser()} ${this.orderParser()} ${this.limitParser()};`;

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

export class StarSelectBuilder<
  U extends Record<string, Column>,
> extends BaseSelectionBuilder<InferRow<U>> {
  constructor(
    pool: Pool,
    private table: Table<U>,
  ) {
    super(pool);
  }

  async execute(): Promise<InferRow<U>[]> {
    let sql = `SELECT * FROM ${this.table.name} ${this.whereParser()} ${this.orderParser()} ${this.limitParser()};`;

    const [rows] = await this.pool.query<(InferRow<U> & RowDataPacket)[]>(sql);

    return rows;
  }
}

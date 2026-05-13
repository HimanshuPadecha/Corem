import { CoremError } from "@/core/corem-error.js";
import { Column, FinalColumn } from "@/types/column.js";
import {
  Condition,
  InferRow,
  InferSelection,
  Join,
  Order,
  whereClause,
} from "@/types/query-parser.js";
import { Table } from "@/types/table.js";
import { Pool, RowDataPacket } from "mysql2/promise";

export abstract class BaseSelectionBuilder<TResult> {
  protected _tableName: string = "";
  protected limitNo?: number;
  protected orders?: Order[];
  protected condition?: whereClause;
  protected joins: Join<Record<string, FinalColumn>>[] = [];
  protected groupByColumn?: FinalColumn;
  protected havingCondition?: whereClause;

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

  groupBy(column: FinalColumn): this {
    this.groupByColumn = column;
    return this;
  }

  having(condition: whereClause): this {
    if (this.groupBy === undefined) {
      throw new CoremError({
        code: "INVALID_REQUEST",
        message: "Cannot use haivng without groupby !",
      });
    }
    this.havingCondition = condition;
    return this;
  }

  protected havingParser(): string {
    if (this.havingCondition === undefined) return "";

    return ` HAVING ${this.parseClause(this.havingCondition)} `;
  }

  protected groupByParser(): string {
    if (this.groupByColumn === undefined) return "";

    return ` GROUP BY ${this.groupByColumn.table}.${this.groupByColumn.name} `;
  }

  private addJoin<
    U extends Record<string, FinalColumn> = Record<string, FinalColumn>,
  >(
    type: "INNER JOIN" | "RIGHT JOIN" | "LEFT JOIN",
    table: Table<U>,
    condition: Condition,
  ): this {
    const duplicate = this.joins.some((join) => join.table.name === table.name);
    if (duplicate) {
      throw new CoremError({
        code: "INVALID_REQUEST",
        message: "Already joined, use alias to join further",
      });
    }
    const join: Join<U> = {
      type,
      condition,
      table,
    };

    this.joins.push(join);
    return this;
  }

  innerJoin<
    U extends Record<string, FinalColumn> = Record<string, FinalColumn>,
  >(table: Table<U>, condition: Condition): this {
    return this.addJoin("INNER JOIN", table, condition);
  }

  leftJoin<U extends Record<string, FinalColumn> = Record<string, FinalColumn>>(
    table: Table<U>,
    condition: Condition,
  ): this {
    return this.addJoin("LEFT JOIN", table, condition);
  }

  rightJoin<
    U extends Record<string, FinalColumn> = Record<string, FinalColumn>,
  >(table: Table<U>, condition: Condition): this {
    return this.addJoin("RIGHT JOIN", table, condition);
  }

  protected joinsParser(): string {
    return this.joins
      .map(({ condition, type, table }) => {
        const { column, operator, columnTwo } = condition;

        if (!columnTwo) {
          throw new CoremError({
            code: "NOT_FOUND",
            message: "Two columns need to join the tables !!",
          });
        }
        return `${type} ${table.name} ON ${column.table}.${column.name} ${operator} ${columnTwo.table}.${columnTwo.name}`;
      })
      .join(" ");
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
    if (this.limitNo !== undefined) {
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

    let sql = `SELECT ${cols} FROM ${this._tableName} ${this.joinsParser()} ${this.whereParser()} ${this.groupByParser()} ${this.havingParser()} ${this.orderParser()} ${this.limitParser()};`;

    const [rows] =
      await this.pool.query<(InferSelection<S> & RowDataPacket)[]>(sql);

    this.pool.end();

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
    let sql = `SELECT * FROM ${this.table.name} ${this.joinsParser()} ${this.whereParser()} ${this.groupByParser()} ${this.havingParser()} ${this.orderParser()} ${this.limitParser()};`;

    const [rows] = await this.pool.query<(InferRow<U> & RowDataPacket)[]>(sql);

    this.pool.end()

    return rows;
  }
}

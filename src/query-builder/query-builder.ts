import { Pool } from "mysql2/promise";
import { SelectBuilder, StarBuilder } from "./select-query-builder.js";
import { Column, FinalColumn } from "@/types/column.js";
import { DeleteBuilder } from "./delete-query-builder.js";
import { InsertBuilder } from "./insert-query-builder.js";
import { UpdateBuilder } from "./update-query-builder.js";

export class QueryBuilder {
  constructor(private pool: Pool) {}

  select(): StarBuilder;
  select<S extends Record<string, FinalColumn>>(selection: S): SelectBuilder<S>;
  select<S extends Record<string, FinalColumn>>(
    selection?: S,
  ): SelectBuilder<S> | StarBuilder {
    if (selection) {
      return new SelectBuilder(this.pool, selection);
    }

    return new StarBuilder(this.pool);
  }

  delete(): DeleteBuilder<Record<string, FinalColumn>> {
    return new DeleteBuilder(this.pool);
  }

  insert<T extends Record<string, Column>>(table: {
    name: string;
    columns: { [K in keyof T]: FinalColumn<T[K]> };
  }): InsertBuilder<{ [K in keyof T]: FinalColumn<T[K]> }> {
    return new InsertBuilder(this.pool, table);
  }

  update<T extends Record<string, Column>>(table: {
    name: string;
    columns: { [K in keyof T]: FinalColumn<T[K]> };
  }) {
    return new UpdateBuilder(this.pool, table);
  }
}

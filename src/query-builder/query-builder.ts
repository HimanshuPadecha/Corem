import { Pool } from "mysql2/promise";
import { SelectBuilder, StarBuilder } from "./select-query-builder";
import { Column, FinalColumn } from "@/types/column";
import { DeleteBuilder } from "./delete-query-builder";
import { InsertBuilder } from "./insert-query-builder";
import { Table } from "@/types/table";

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

  delete<S extends Record<string, FinalColumn>>(): DeleteBuilder<S> {
    return new DeleteBuilder<S>(this.pool);
  }

  // insert<S extends Record<string, FinalColumn>>(
  //   table: Table<S>,
  // ): InsertBuilder<S> {
  //   return new InsertBuilder<S>(this.pool, table);
  // }

  insert<T extends Record<string, Column>>(
    table: { name: string; columns: { [K in keyof T]: FinalColumn<T[K]> } },
  ): InsertBuilder<{ [K in keyof T]: FinalColumn<T[K]> }> {
    return new InsertBuilder(this.pool, table);
  }
}

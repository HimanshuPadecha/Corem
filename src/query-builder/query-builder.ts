import { Pool } from "mysql2/promise";
import { SelectBuilder, StarBuilder } from "./select-query-builder";
import { FinalColumn } from "@/types/column";
import { DeleteBuilder } from "./delete-query-builder";

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
}

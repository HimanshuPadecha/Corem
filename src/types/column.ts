import { Constraint } from "./constraints.js";

export type Column<T extends string = string> = {
  name: string;
  type: T;
  constraints: Constraint[];
  fkey?: {
    far: FinalColumn;
    onDelete?: FkeyDelete;
  };
};

export type FinalColumn<C extends Column = Column> = C & {
  table: string;
};

export type FkeyDelete = "delete" | "cascade";

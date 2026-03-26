import { Constraint } from "./constraints";

export type Column = {
  name: string;
  type: string;
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

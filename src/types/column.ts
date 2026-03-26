import { Constraint } from "./constraints";

export type Column = {
  name: string;
  type: string;
  constraints: Constraint[];
};

export type FinalColumn = Column & {
  table: string;
  fkey?: {
    far: FinalColumn;
    onDelete?: FkeyDelete;
  };
};

export type FkeyDelete = "delete" | "cascade";

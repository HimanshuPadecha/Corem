import { Column } from "@/types/column.js";

export type BooleanDefault = "TRUE" | "FALSE";

export interface Boolean extends Column<"BOOLEAN"> {
  notNull: () => Boolean;
  default: (state: BooleanDefault) => Boolean;
  unique: () => Boolean;
  primaryKey: () => Boolean;
}

export const boolean = (name: string): Boolean => {
  return {
    name,
    type: "BOOLEAN",
    constraints: [],
    default(state) {
      this.constraints.push(`DEFAULT ${state}`);
      return this;
    },
    notNull() {
      this.constraints.push("NOT NULL");
      return this;
    },
    primaryKey() {
      this.constraints.push("PRIMARY KEY");
      return this;
    },
    unique() {
      this.constraints.push("UNIQUE");
      return this;
    },
  };
};

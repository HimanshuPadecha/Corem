import { sql } from "../core/sql";
import { Column } from "../types/column";

export type Float = Column & {
  primaryKey: () => Float;
  notNull: () => Float;
  unique: () => Float;
  default: (num: number) => Float;
  unsigned: () => Float;
  check: (conditon: string) => Float;
};

export const float = (name: string): Float => {
  return {
    name,
    type: "BIGINT",
    constraints: [],
    primaryKey() {
      this.constraints.push("PRIMARY KEY");
      return this;
    },
    notNull() {
      this.constraints.push("NOT NULL");
      return this;
    },
    unique() {
      this.constraints.push("UNIQUE");
      return this;
    },
    default(num) {
      this.constraints.push(`DEFAULT ${num}`);
      return this;
    },
    unsigned() {
      this.constraints.push("UNSIGNED");
      return this;
    },
    check(condition) {
      this.constraints.push(`CHECK ${sql(condition)}`);
      return this;
    },
  };
};

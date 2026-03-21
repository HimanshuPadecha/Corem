import { Column } from "../types/column";
import { sql } from "../core/sql";

export type Int = Column & {
  primaryKey: () => Int;
  notNull: () => Int;
  autoIncrement: () => Int;
  unique: () => Int;
  default: (num: number) => Int;
  check: (condition: string) => Int;
};

export const int = (name: string): Int => {
  return {
    name,
    type: "INT",
    constraints: [],
    primaryKey() {
      this.constraints.push("PRIMARY KEY");
      return this;
    },
    autoIncrement() {
      this.constraints.push("AUTO_INCREMENT");
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
    check(condition) {
      this.constraints.push(`CHECK ${sql(condition)}`);
      return this;
    },
  };
};

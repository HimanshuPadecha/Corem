import { sql } from "../core/sql";
import { Float } from "./float";

export const double = (name: string): Float => {
  return {
    name,
    type: `DOUBLE`,
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

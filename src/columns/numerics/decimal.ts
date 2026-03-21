import { sql } from "../core/sql";
import { Float } from "./float";

interface decimalPrecesion {
  precesion: number;
  scale: number;
}

export const decimal = (
  name: string,
  { precesion, scale }: decimalPrecesion,
): Float => {
  return {
    name,
    type: `DECIMAL(${precesion},${scale})`,
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

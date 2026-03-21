import { sql } from "../core/sql";
import { Int } from "./int";


export const bigInt = (name: string): Int => {
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
    autoIncrement() {
      this.constraints.push("AUTO_INCREMENT");
      return this;
    },
    unique(){
        this.constraints.push("UNIQUE")
        return this
    },
    default(num){
        this.constraints.push(`DEFAULT ${num}`)
        return this
    },
    check(condition) {
        this.constraints.push(`CHECK ${sql(condition)}`);
        return this;
      },
  };
};

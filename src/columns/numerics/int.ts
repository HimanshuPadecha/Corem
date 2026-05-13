import { Column } from "@/types/column.js";
import { CommonConstraints, ConstraintMethods } from "@/core/common-constrains.js";

export interface Int extends Column<"INT">, ConstraintMethods<Int> {
  autoIncrement: () => Int;
  default: (num: number) => Int;
}

export const int = (name: string): Int => {
  const base: Column = {
    name,
    type: "INT",
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as Int;

  result.default = (num) => {
    result.constraints.push(`DEFAULT ${num}`);
    return result
  };

  result.autoIncrement = () => {
    result.constraints.push("AUTO_INCREMENT");
    return result;
  };

  return result;
};

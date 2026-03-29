import { Column } from "@/types/column";
import { CommonConstraints, ConstraintMethods } from "@/core/common-constrains";

export interface Int extends Column, ConstraintMethods<Int> {
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

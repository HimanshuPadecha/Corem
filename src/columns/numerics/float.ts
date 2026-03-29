import { CommonConstraints, ConstraintMethods } from "@/core/common-constrains";
import { Column } from "@/types/column";

export interface Float extends ConstraintMethods<Float>, Column {
  unsigned: () => Float;
  default: (num: number) => Float;
}

export const float = (name: string): Float => {
  const base: Column = {
    name,
    type: "FLOAT",
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as Float;


  result.default = (num) => {
    result.constraints.push(`DEFAULT ${num}`);
    return result
  };

  result.unsigned = () => {
    result.constraints.push("UNSIGNED");
    return result;
  };

  return result;
};

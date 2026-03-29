import { Float as Double } from "./float";
import { Column } from "@/types/column";
import { CommonConstraints } from "@/core/common-constrains";

export const double = (name: string): Double => {
  const base: Column = {
    name,
    type: "DOUBLE",
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as Double;


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

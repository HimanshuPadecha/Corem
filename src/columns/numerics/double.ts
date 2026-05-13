import { Float as Double } from "./float.js";
import { Column } from "@/types/column.js";
import { CommonConstraints } from "@/core/common-constrains.js";

export const double = (name: string): Double => {
  const base: Column = {
    name,
    type: "DOUBLE" as const,
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

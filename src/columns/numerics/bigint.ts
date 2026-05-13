import { Int as BigInt } from "./int.js";
import { Column } from "@/types/column.js";
import { CommonConstraints } from "@/core/common-constrains.js";

export const bigInt = (name: string): BigInt => {
  const base: Column<"BIGINT"> = {
    name,
    type: "BIGINT" as const,
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as BigInt;

  result.default = (num) => {
    result.constraints.push(`DEFAULT ${num}`);
    return result;
  };

  result.autoIncrement = () => {
    result.constraints.push("AUTO_INCREMENT");
    return result;
  };

  return result;
};

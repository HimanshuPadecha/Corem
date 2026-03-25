import { Int as BigInt } from "./int";
import { Column } from "@/types/column";
import { CommonConstraints } from "@/core/common-constrains";

export const bigInt = (name: string): BigInt => {
  const base: Column = {
    name,
    type: "BIGINT",
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as BigInt;

  result.autoIncrement = () => {
    result.constraints.push("AUTO_INCREMENT");
    return result;
  };

  return result;
};

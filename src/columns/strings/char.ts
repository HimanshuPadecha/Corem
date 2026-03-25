import { CommonConstraints } from "@/core/common-constrains";
import { Column } from "@/types/column";
import { Varchar as Char } from "./varchar";

export const char = (name: string, size: number): Char => {
  const base: Column = {
    name,
    type: `CHAR(${size})`,
    constraints: [],
  };

  return CommonConstraints(base) as Char;
};

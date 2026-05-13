import { CommonConstraints } from "@/core/common-constrains.js";
import { Column } from "@/types/column.js";
import { Varchar as Char } from "./varchar.js";

export const char = (name: string, size: number): Char => {
  const base: Column = {
    name,
    type: `CHAR(${size})` ,
    constraints: [],
  };

  return CommonConstraints(base) as Char;
};

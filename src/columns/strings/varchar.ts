import { CommonConstraints, ConstraintMethods } from "@/core/common-constrains";
import { Column } from "@/types/column";

export interface Varchar
  extends Column<`VARCHAR(${number})`>, ConstraintMethods<Varchar> {
  default: (chars: string) => Varchar;
}

export const varchar = (name: string, size: number): Varchar => {
  const base: Column = {
    name,
    type: `VARCHAR(${size})`,
    constraints: [],
  };

  return CommonConstraints(base) as Varchar;
};

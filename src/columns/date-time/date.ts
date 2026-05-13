import { CommonConstraints, ConstraintMethods } from "@/core/common-constrains";
import { Column } from "@/types/column";

export type DateDefault = {
  day: number;
  month: number;
  year: number;
};

export interface Date extends Column, ConstraintMethods<Date> {
  defaultNow: () => Date;
  default: (date: DateDefault) => Date;
}

export const date = (name: string): Date => {
  const base: Column = {
    name,
    type: "DATE" as const,
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as Date;

  result.defaultNow = () => {
    result.constraints.push("DEFAULT (CURRENT_DATE)");
    return result;
  };

  result.default = ({ day, month, year }) => {
    result.constraints.push(`DEFAULT "${year}-${month}-${day}"`);
    return result;
  };

  return result;
};

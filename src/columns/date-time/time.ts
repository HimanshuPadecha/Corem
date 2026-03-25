import { CommonConstraints, ConstraintMethods } from "@/core/common-constrains";
import { Column } from "@/types/column";
import { Date } from "./date";

export type TimeDefault = {
  hour: number;
  minute: number;
  seconds: number;
};

export interface Time extends Column, ConstraintMethods<Time> {
  defaultNow: () => Time;
  default: (time: TimeDefault) => Time;
}

export const time = (name: string): Time => {
  const base: Column = {
    name,
    type: "TIME",
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as Time;

  result.defaultNow = () => {
    result.constraints.push("DEFAULT (CURRENT_DATE)");
    return result;
  };

  result.default = ({ hour, minute, seconds }) => {
    result.constraints.push(`DEFAULT '${hour}:${minute}:${seconds}'`);
    return result;
  };

  return result;
};

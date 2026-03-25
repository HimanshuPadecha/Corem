import { CommonConstraints, ConstraintMethods } from "@/core/common-constrains";
import { Column } from "@/types/column";

export type OnUpdate = {
  onUpdate: "CURRENT";
};

export interface TimeStamp extends Column, ConstraintMethods<TimeStamp> {
  defaultNow: (onupdate?: OnUpdate) => TimeStamp;
}

export const timestamp = (name: string): TimeStamp => {
  const base: Column = {
    name,
    type: "TIMESTAMP",
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as TimeStamp;

  result.defaultNow = (onUpdate) => {
    result.constraints.push(
      onUpdate?.onUpdate
        ? "DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        : "DEFAULT CURRENT_TIMESTAMP",
    );
    return result;
  };

  return result;
};

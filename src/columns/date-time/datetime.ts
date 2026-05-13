import { CommonConstraints } from "@/core/common-constrains";
import { Column } from "@/types/column";
import { TimeStamp as DateTime } from "./timestamp";

export const datetime = (name: string): DateTime => {
  const base: Column = {
    name,
    type: "DATETIME" as const,
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as DateTime;

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

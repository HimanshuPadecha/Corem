import { Float as Decimal } from "./float";
import { Column } from "@/types/column";
import { CommonConstraints } from "@/core/common-constrains";

interface decimalPrecesion {
  precesion: number;
  scale: number;
}

export const decimal = (
  name: string,
  { precesion, scale }: decimalPrecesion,
): Decimal => {
  const base: Column = {
    name,
    type: `DECIMAL(${precesion},${scale})`,
    constraints: [],
  };

  const result = CommonConstraints(base) as unknown as Decimal;

  result.unsigned = () => {
    result.constraints.push("UNSIGNED");
    return result;
  };

  return result;
};

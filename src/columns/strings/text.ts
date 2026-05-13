import { Column } from "@/types/column";

type Text = Column<"TEXT"> & {
  notNull: () => Text;
};

export const text = (name: string): Text => {
  return {
    name,
    type: "TEXT" as const,
    constraints: [],
    notNull() {
      this.constraints.push("NOT NULL");
      return this;
    },
  };
};

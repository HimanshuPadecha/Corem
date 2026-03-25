import { Column } from "@/types/column";

type Text = Column & {
  notNull: () => Text;
};

export const text = (name: string): Text => {
  return {
    name,
    type: "TEXT",
    constraints: [],
    notNull() {
      this.constraints.push("NOT NULL");
      return this;
    },
  };
};

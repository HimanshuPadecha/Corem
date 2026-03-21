import { Column } from "../types/column";

type Int = Column & {
  primaryKey: () => Int;
  notNull: () => Int;
  autoIncrement: () => Int;
};

export const int = (name: string): Int => {
  return {
    name,
    type: "INT",
    constraints: [],
    primaryKey() {
      this.constraints.push("PRIMARY KEY");
      return this;
    },
    autoIncrement() {
      this.constraints.push("AUTO_INCREMENT");
      return this;
    },
    notNull() {
      this.constraints.push("NOT NULL");
      return this;
    },
  };
};

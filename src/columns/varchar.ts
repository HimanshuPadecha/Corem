import { Column } from "../types/column";

type Varchar = Column & {
  notNull: () => Varchar;
};

export const varchar = (name: string, size: number): Varchar => {
  return {
    name,
    type: `VARCHAR(${size})`,
    constraints: [],
    notNull() {
      this.constraints.push("NOT NULL");
      return this;
    },
  };
};

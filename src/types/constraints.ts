export type Constraint =
  | "AUTO_INCREMENT"
  | "NOT NULL"
  | "PRIMARY KEY"
  | "UNIQUE"
  | `DEFAULT ${number}`
  | "UNSIGNED"
  | `CHECK ${string}`;

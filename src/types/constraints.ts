export type Constraint =
  | "AUTO_INCREMENT"
  | "NOT NULL"
  | "PRIMARY KEY"
  | "UNIQUE"
  | `DEFAULT ${any}`
  | "UNSIGNED"
  | `CHECK ${string}`;

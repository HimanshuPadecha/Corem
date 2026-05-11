import { getPool } from "@/db";
import { Column } from "@/types/column";
import { Constraint } from "@/types/constraints";
import { Table } from "@/types/table";
import {
  dropForeignKeyConstraintIfExists,
  isPrimaryKey,
  isTableExists,
  logger,
  parseDbConstrains,
} from "@/utils/utils";
import { RowDataPacket } from "mysql2";
import { CoremError } from "./corem-error";

export interface DbConstraintsOutput extends RowDataPacket {
  COLUMN_NAME: string;
  COLUMN_TYPE: string;
  IS_NULLABLE: string;
  COLUMN_DEFAULT: string;
  COLUMN_KEY: string;
  EXTRA: string;
  CONSTRAINT_TYPE: string;
  REFERENCED_TABLE_NAME: string;
  REFERENCED_COLUMN_NAME: string;
}

const sqlProvider = (table: string, column: string) => `SELECT
c.COLUMN_NAME,
c.COLUMN_TYPE,
c.IS_NULLABLE,
c.COLUMN_DEFAULT,
c.COLUMN_KEY,
c.EXTRA,

tc.CONSTRAINT_TYPE,

kcu.REFERENCED_TABLE_NAME,
kcu.REFERENCED_COLUMN_NAME

FROM information_schema.COLUMNS c

LEFT JOIN information_schema.KEY_COLUMN_USAGE kcu
ON c.TABLE_SCHEMA = kcu.TABLE_SCHEMA
AND c.TABLE_NAME = kcu.TABLE_NAME
AND c.COLUMN_NAME = kcu.COLUMN_NAME

LEFT JOIN information_schema.TABLE_CONSTRAINTS tc
ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
AND kcu.TABLE_SCHEMA = tc.TABLE_SCHEMA
AND kcu.TABLE_NAME = tc.TABLE_NAME

WHERE c.TABLE_SCHEMA = DATABASE()
AND c.TABLE_NAME = '${table}'
AND c.COLUMN_NAME = '${column}';`;

export const checkConstraintsAndDelete = async (
  configSchema: Table<Record<string, Column>>[],
) => {
  const pool = await getPool();

  for (const table of configSchema) {
    const { columns } = table;

    for (const [_, value] of Object.entries(columns)) {
      const { table, name, fkey } = value;

      const [dbConstraintsOutputArr] = await pool.query<DbConstraintsOutput[]>(
        sqlProvider(table, name),
      );

      const [dbConstraints] = dbConstraintsOutputArr;

      if (!dbConstraints) {
        continue;
      }

      const parsedDbConstraints: Constraint[] =
        parseDbConstrains(dbConstraints);

      const constraintSet = new Set(value.constraints);

      let constarintsToDelete = parsedDbConstraints.filter(
        (constraint) => !constraintSet.has(constraint),
      );

      if (!fkey && dbConstraints.CONSTRAINT_TYPE === "FOREIGN KEY") {
        await dropForeignKeyConstraintIfExists({ table, column: name });
      }

      if (
        constarintsToDelete.length > 1 &&
        constarintsToDelete.some((constraint) => constraint === "PRIMARY KEY")
      ) {
        constarintsToDelete = constarintsToDelete.filter(
          (constraint) => constraint !== "PRIMARY KEY",
        );
        constarintsToDelete = ["PRIMARY KEY", ...constarintsToDelete];
      }

      try {
        for (const constraint of constarintsToDelete) {
          switch (constraint) {
            case "PRIMARY KEY": {
              await pool.query(`ALTER TABLE ${table} DROP PRIMARY KEY`);
              logger.success("Primary key removed !");
              break;
            }

            case "AUTO_INCREMENT": {
              const newConstraints = value.constraints.filter(
                (constraint) =>
                  constraint !== "AUTO_INCREMENT" &&
                  constraint !== "PRIMARY KEY",
              );

              const sql = `ALTER TABLE ${table} MODIFY ${name} ${value.type} ${newConstraints.join(" ")}`;
              console.log(sql);
              await pool.query(sql);
              logger.success(`auto_increment constraint removed on ${name} !!`);
              break;
            }

            case "NOT NULL": {
              await pool.query(
                `ALTER TABLE ${table} MODIFY ${name} ${value.type} NULL`,
              );
              logger.success(`Not null constraint removed on ${name} !!`);
              break;
            }

            case "UNIQUE": {
              await pool.query(`ALTER TABLE ${table} DROP INDEX ${name}`);
              logger.success(`Unique constraint removed on ${name} !`);
              break;
            }

            default: {
              if (constraint.startsWith("DEFAULT")) {
                await pool.query(
                  `ALTER TABLE ${table} ALTER COLUMN ${name} DROP DEFAULT `,
                );
                logger.success(`Default constraint removed on ${name} !`);
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
};

export const checkConstraintsAndAdd = async (
  configSchema: Table<Record<string, Column>>[],
) => {
  const pool = await getPool();

  for (const table of configSchema) {
    const { columns } = table;

    for (const [key, value] of Object.entries(columns)) {
      const { table, name, fkey, type } = value;

      const [dbConstraintsOutputArr] = await pool.query<DbConstraintsOutput[]>(
        sqlProvider(table, name),
      );

      const [dbConstraints] = dbConstraintsOutputArr;

      if (!dbConstraints) {
        continue;
      }

      const parsedDbConstraints = parseDbConstrains(dbConstraints);

      const constraintSet = new Set(parsedDbConstraints);

      let constarintsToAdd = value.constraints.filter(
        (constraint) => !constraintSet.has(constraint),
      );

      if (fkey && dbConstraints.CONSTRAINT_TYPE !== "FOREIGN KEY") {
        const { far, onDelete } = fkey;

        if (!(await isTableExists(far.table))) {
          throw new CoremError({
            code: "NOT_FOUND",
            message: "Table not found !!",
          });
        }

        if (!(await isPrimaryKey(far))) {
          throw new CoremError({
            code: "NOT_PRIMARY_KEY",
            message: "The key is not primary key !!",
          });
        }

        let sql = `ADD CONSTRAINT fk_${far.table} FOREIGN KEY (${name}) REFERENCES ${far.table}(${far.name}) `;

        if (onDelete) {
          sql += `ON DELETE ${onDelete}`;
        }

        await pool.query(sql);
        console.log(`Foreign key added on ${name}!`);
      }

      try {
        for (const constraint of constarintsToAdd) {
          switch (constraint) {
            case "PRIMARY KEY": {
              await pool.query(`ALTER TABLE ${table} ADD PRIMARY KEY (${name})`);
              logger.success(`Primary key constraint added on ${name} !`);
              break;
            }
  
            case "AUTO_INCREMENT": {
              let constraints = value.constraints.filter(constraint => constraint !== "PRIMARY KEY")
              constraints.push("AUTO_INCREMENT");
              await pool.query(
                `ALTER TABLE ${table} MODIFY ${name} ${type} ${constraints.join(" ")}`,
              );
              logger.success(`Auto increment added on ${name} !`);
              break;
            }
  
            case "NOT NULL": {
              let constraints = value.constraints.filter(
                (constraint) => constraint !== "PRIMARY KEY",
              );
              constraints.push("NOT NULL");
              await pool.query(
                `ALTER TABLE ${table} MODIFY ${name} ${type} ${constraints.join(" ")}`,
              );
              logger.success(`Not null constraint added on ${name} !`);
              break;
            }
  
            case "UNIQUE": {
              await pool.query(`ALTER TABLE ${table} ADD UNIQUE (${name})`);
              logger.success(`Unique constraint added on ${name} !`);
            }
  
            default: {
              if (constraint.startsWith("DEFAULT")) {
                let constriants = value.constraints.filter(constriant => constriant !== "PRIMARY KEY")
                constriants.push(constraint)
                await pool.query(
                  `ALTER TABLE ${table} MODIFY COLUMN ${name} ${type} ${constriants.join(" ")}`,
                );
                logger.success(`Default constraint added on ${name} !`)
              }
            }
          }
        } 
      } catch (error) {
        console.log(error);
        
      }
    }
  }
};

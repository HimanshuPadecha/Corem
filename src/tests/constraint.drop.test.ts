import { checkConstraintsAndAdd, DbConstraintsOutput } from "@/core/constraints-updation";
import { getPool } from "@/db";
import { Constraint } from "@/types/constraints";
import {
  dropForeignKeyConstraintIfExists,
  getConfig,
  getUserSchema,
  logger,
} from "@/utils/utils";
import { RowDataPacket } from "mysql2";


test("constarint deletion test", async () => {

  const coremConfig = await getConfig();

  const configSchema = await getUserSchema(coremConfig);

  if (!configSchema) {
    return;
  }

  const pool = await getPool();

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

      const parsedDbConstraints: Constraint[] = [];

      if (dbConstraints.IS_NULLABLE === "NO") {
        parsedDbConstraints.push("NOT NULL");
      }

      if (dbConstraints.COLUMN_DEFAULT !== null) {
        if (dbConstraints.COLUMN_TYPE === "timestamp") {
          if (
            dbConstraints.EXTRA ===
            "DEFAULT_GENERATED on update CURRENT_TIMESTAMP"
          ) {
            parsedDbConstraints.push(
              `DEFAULT ${dbConstraints.COLUMN_DEFAULT} ON UPDATE CURRENT_TIMESTAMP`,
            );
          } else {
            parsedDbConstraints.push(`DEFAULT ${dbConstraints.COLUMN_DEFAULT}`);
          }
        } else {
          parsedDbConstraints.push(`DEFAULT '${dbConstraints.COLUMN_DEFAULT}'`);
        }
      }

      if (dbConstraints.COLUMN_KEY === "PRI") {
        parsedDbConstraints.push("PRIMARY KEY");
      }

      if (dbConstraints.COLUMN_KEY === "UNI") {
        parsedDbConstraints.push("UNIQUE");
      }

      if (dbConstraints.EXTRA === "auto_increment") {
        parsedDbConstraints.push("AUTO_INCREMENT");
      }

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
                logger.success(`Default constraint removed on ${name}`);
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
});

test("constraint add test", async () => {
    const coremConfig = await getConfig()

    const configschema = await getUserSchema(coremConfig)

    if(!configschema){
        return 
    }

    await checkConstraintsAndAdd(configschema)
})

afterAll(async () => {
  const pool = await getPool();
  pool.end();
});

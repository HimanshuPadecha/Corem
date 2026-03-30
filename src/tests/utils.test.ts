import { getConfig, getUserSchema } from "@/utils/utils";

test("get schema", async () => {
  const coremConfig = await getConfig();
  const schema = await getUserSchema(coremConfig);

  console.log(schema);
});



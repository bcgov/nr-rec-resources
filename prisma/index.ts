import * as fs from "fs";
import config from "./schemaConfig.json";

function classifyModelsBySchema(schemaText: any) {
  const modelRegex =
    /((?:\s*\/\/\/[^\n]*\n)*)\s*model\s+(\w+)\s+{([\s\S]*?)}\s*/g;
  const schemaRegex = /@@schema\("([^"]+)"\)/;

  const schemaGroups: any = {};

  let match;
  while ((match = modelRegex.exec(schemaText)) !== null) {
    const [_, commentBlock, modelName, modelBody] = match;

    // Extract schema
    const schemaMatch = schemaRegex.exec(modelBody);
    const schemaName = schemaMatch ? schemaMatch[1] : "default";

    // Clean comments: remove /// and trim
    const comments = commentBlock
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("///"))
      .map((line) => line.trim());

    if (!schemaGroups[schemaName]) {
      schemaGroups[schemaName] = [];
    }

    schemaGroups[schemaName].push({
      name: modelName,
      body: modelBody.trim(),
      comments,
    });
  }

  return schemaGroups;
}

function dataSourceToString(dataSource: any) {
  return `\ndatasource db {\n\tprovider = "${dataSource.provider}"\n\turl = ${dataSource.url}\n\tschemas  = ["${dataSource.schemas.join(`", "`)}"]\n}\n`;
}

const prismaHeader = fs.readFileSync("./header.prisma", "utf-8");

const dataSource: any = {
  provider: "postgresql",
  url: `env("DATABASE_URL")`,
  schemas: [],
};

const prismaSchema = fs.readFileSync("./test.prisma", "utf-8");

const result = classifyModelsBySchema(prismaSchema);

config.apps.forEach((app) => {
  dataSource.schemas = [...app.dbSchemas];
  let schemaStr = prismaHeader + dataSourceToString(dataSource);
  app.dbSchemas.forEach((schema) => {
    result[schema].forEach((model: any) => {
      schemaStr += `${model.comments}\nmodel ${model.name} {\r\n\t${model.body}\n}\n\n`;
    });
  });
  fs.writeFileSync(`${app.appPath}newSchema.prisma`, schemaStr);
});

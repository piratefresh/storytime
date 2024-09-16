import Neo4j, { type Driver, type Neo4jError } from 'neo4j-driver';

export const driver: Driver = Neo4j.driver(
  process.env.NEO4J_URI as string,
  Neo4j.auth.basic('neo4j', process.env.NEO4J_PASSWORD as string),
);

export async function getDriver(): Promise<Driver | void> {
  try {
    const serverInfo = await driver.getServerInfo();
    console.log('Connection established');
    console.log(serverInfo);
    return driver;
  } catch (err) {
    console.error('Error connecting to Neo4j');
    console.log(
      `Connection error\n${err}\nCause: ${(err as Neo4jError).cause}`,
    );
    await driver.close();
    return;
  }
}

export type { Driver };

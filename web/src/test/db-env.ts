import "dotenv/config";

// Los tests de base usan TEST_DATABASE_URL; nunca la base de desarrollo ni la de producción.
const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("Definí TEST_DATABASE_URL para correr npm run test:db");
if (!/_test\b|test/.test(new URL(url).pathname)) throw new Error("TEST_DATABASE_URL debe apuntar a una base de tests");
process.env.DATABASE_URL = url;

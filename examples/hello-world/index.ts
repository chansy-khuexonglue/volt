import { Volt } from 'volt';

const app = new Volt({ port: 3000 });

app.get('/', () => ({
  message: 'Hello, World! ⚡ Built with Volt on Bun',
}));

app.listen(3000, (server) => {
  console.log(`⚡ Hello World running at http://localhost:${server.port}`);
});

export default app;

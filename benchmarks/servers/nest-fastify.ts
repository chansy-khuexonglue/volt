import 'reflect-metadata';
import { Controller, Get, Post, Param, Body, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

@Controller()
class BenchmarkController {
  @Get('ping')
  getPing() {
    return { message: 'pong' };
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return { id, name: `User ${id}` };
  }

  @Post('items')
  postItem(@Body() body: any) {
    return { success: true, data: body };
  }
}

@Module({
  controllers: [BenchmarkController],
})
class BenchmarkModule {}

export async function createNestFastifyServer(port = 4007): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    BenchmarkModule,
    new FastifyAdapter(),
    { logger: false }
  );

  await app.listen(port, '127.0.0.1');
  return app;
}

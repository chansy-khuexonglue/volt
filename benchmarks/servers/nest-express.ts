import 'reflect-metadata';
import { Controller, Get, Post, Param, Body, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';

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

export async function createNestExpressServer(port = 4008): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    BenchmarkModule,
    new ExpressAdapter(),
    { logger: false }
  );

  await app.listen(port);
  return app;
}

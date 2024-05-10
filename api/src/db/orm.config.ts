import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: '192.168.1.73' || '30.4.1.201',
  port: Number(process.env.REFCODE_POSTGRES_DB_PORT) || 5432,
  username: process.env.REFCODE_POSTGRES_DB_USER,
  password: process.env.REFCODE_POSTGRES_DB_PASSWORD,
  database: process.env.REFCODE_POSTGRES_DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};

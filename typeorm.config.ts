import { DataSource, DataSourceOptions } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { config } from 'dotenv';

config();

export const GetTypeOrmDataSourceConfig = (
  config: ConfigService,
): DataSourceOptions => ({
  type: 'postgres',
  host: config.get<string>('DB_HOST'),
  port: config.get<number>('DB_PORT'),
  username: config.get<string>('DB_USERNAME'),
  password: config.get<string>('DB_PASSWORD'),
  database: config.get<string>('DB_DATABASE'),
  entities: [join(__dirname, 'src', '**/entities', '**/*.entity.{ts,js}')],
  schema: config.get<string>('DB_SCHEMA'),
  migrations: [join(__dirname, 'src', 'migrations', '**/*.{ts,js}')],
  synchronize: false,
  logging: true,
  migrationsRun: false,
  ssl:
    config.get<string>('NODE_ENV') === 'production'
      ? { rejectUnauthorized: false } // just to enable self signed certificate
      : false,
});

export const DataSourceConfig = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, 'src', '**/entities', '**/*.entity.{ts,js}')],
  schema: process.env.DB_SCHEMA,
  migrations: [join(__dirname, 'src', 'migrations', '**/*.{ts,js}')],
  synchronize: false,
  logging: true,
  migrationsRun: false,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

const dataSource = new DataSource(DataSourceConfig());

dataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

export default dataSource;

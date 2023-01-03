import * as matchers from 'jest-extended';
import resetDatabase from './src/tools/reset-database';
expect.extend(matchers);

beforeAll(resetDatabase);
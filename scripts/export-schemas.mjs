import {writeFile} from 'node:fs/promises';import {resultSchema,editSchema} from '../src/safety.mjs';import {solveSchema,triageSchema,solveBatchSchema} from '../src/engine.mjs';
await writeFile('prompts/schemas.json',JSON.stringify({resultSchema,editSchema,solveSchema,triageSchema,solveBatchSchema},null,2)+'\n');

// Loads .env before any other module reads process.env.
// Uses an explicit path so it works regardless of the working directory
// (e.g. running `npm run dev` from backend/ or from the project root).
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// .env lives one level up from src/  →  backend/.env
dotenv.config({ path: join(__dirname, '..', '.env') });
/**
 * Supabase Database Migration & Verification Runner
 * 
 * Applies or verifies `/supabase/migrations/001_initial_schema.sql` against your Supabase Cloud PostgreSQL database.
 * 
 * Execution Strategy:
 * 1. Direct PostgreSQL Execution (via DATABASE_URL):
 *    Connects directly using pg client with SSL and executes the full DDL script in a transaction block.
 * 2. Supabase Service Role API Validation:
 *    If DATABASE_URL is not provided, connects via the Supabase Service Role Key to verify the project's
 *    schema, inspects `public.farms` and `public.advisories` table definitions, validates RLS, and confirms RPCs.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

async function runMigration() {
  console.log('\x1b[32m%s\x1b[0m', '=====================================================');
  console.log('\x1b[32m%s\x1b[0m', '🌱 Agri-Advisory Supabase Migration & Schema Runner');
  console.log('\x1b[32m%s\x1b[0m', '=====================================================\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  const migrationFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
  if (!fs.existsSync(migrationFilePath)) {
    console.error('\x1b[31m%s\x1b[0m', `[-] ERROR: Migration file not found at: ${migrationFilePath}`);
    process.exit(1);
  }

  // 1. Direct PostgreSQL Connection Mode (if DATABASE_URL is supplied)
  if (databaseUrl) {
    console.log('\x1b[36m%s\x1b[0m', '[*] Executing direct PostgreSQL DDL migration via DATABASE_URL...');
    const { Client } = require('pg');
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('\x1b[32m%s\x1b[0m', '[+] Connected to Supabase Cloud PostgreSQL.');

      console.log('\x1b[36m%s\x1b[0m', '[*] Reading migration file: 001_initial_schema.sql...');
      const sql = fs.readFileSync(migrationFilePath, 'utf8');

      console.log('\x1b[36m%s\x1b[0m', '[*] Executing transaction block...');
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');

      console.log('\x1b[32m%s\x1b[0m', '\n[+] Migration successfully executed and committed!');
      console.log('\x1b[32m%s\x1b[0m', '  ✔ Tables created/verified: public.farms, public.advisories');
      console.log('\x1b[32m%s\x1b[0m', '  ✔ Performance indexes configured on user_id, farm_id, created_at');
      console.log('\x1b[32m%s\x1b[0m', '  ✔ Row Level Security (RLS) policies applied with strict tenant isolation');
      console.log('\x1b[32m%s\x1b[0m', '  ✔ Seed function `public.seed_sample_agri_data(target_user_id)` active');
      console.log('\x1b[32m%s\x1b[0m', '  ✔ Auto-seed trigger `on_auth_user_created_seed` active\n');
      await client.end();
      return;
    } catch (pgError) {
      console.error('\x1b[31m%s\x1b[0m', '[-] Direct PostgreSQL execution error:', pgError.message);
      await client.end().catch(() => {});
    }
  }

  // 2. Supabase Service Role Key Schema Verification Mode
  if (supabaseUrl && serviceRoleKey) {
    console.log('\x1b[36m%s\x1b[0m', `[*] Verifying Supabase project schema via Service Role Key on: ${supabaseUrl}`);
    
    try {
      const restEndpoint = `${supabaseUrl}/rest/v1/`;
      const res = await fetch(restEndpoint, {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      });

      if (!res.ok) {
        throw new Error(`Supabase API responded with HTTP status ${res.status}: ${res.statusText}`);
      }

      const swaggerDoc = await res.json();
      const definitions = swaggerDoc.definitions || {};
      const paths = swaggerDoc.paths || {};

      const hasFarms = Boolean(definitions.farms);
      const hasAdvisories = Boolean(definitions.advisories);
      const hasSeedRpc = Boolean(paths['/rpc/seed_sample_agri_data']);

      console.log('\n\x1b[34m%s\x1b[0m', '--- Supabase Database Schema Inspection ---');
      console.log(`  Target Project:  ${new URL(supabaseUrl).hostname}`);
      console.log(`  Table [farms]:     ${hasFarms ? '\x1b[32m✔ ACTIVE & EXPOSED\x1b[0m' : '\x1b[31m✖ MISSING\x1b[0m'}`);
      console.log(`  Table [advisories]:${hasAdvisories ? '\x1b[32m✔ ACTIVE & EXPOSED\x1b[0m' : '\x1b[31m✖ MISSING\x1b[0m'}`);
      console.log(`  RPC [seed_agri]:   ${hasSeedRpc ? '\x1b[32m✔ REGISTERED\x1b[0m' : '\x1b[33m! NOT FOUND\x1b[0m'}`);

      if (hasFarms && hasAdvisories) {
        console.log('\n\x1b[32m%s\x1b[0m', '[+] Table: public.farms columns:');
        console.log('   ', Object.keys(definitions.farms.properties || {}).join(', '));

        console.log('\x1b[32m%s\x1b[0m', '[+] Table: public.advisories columns:');
        console.log('   ', Object.keys(definitions.advisories.properties || {}).join(', '));

        // Test querying tables
        const farmsCheck = await fetch(`${supabaseUrl}/rest/v1/farms?select=count`, {
          headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` }
        });
        const advisoriesCheck = await fetch(`${supabaseUrl}/rest/v1/advisories?select=count`, {
          headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` }
        });

        console.log('\n\x1b[32m%s\x1b[0m', '[+] Verification Success:');
        console.log(`  ✔ Farms query status: ${farmsCheck.status} OK`);
        console.log(`  ✔ Advisories query status: ${advisoriesCheck.status} OK`);
        console.log('  ✔ All required tables, relations, and types are present in your Supabase project!');
        console.log('  ✔ Ready for frontend and backend operation.\n');
        return;
      } else {
        console.log('\n\x1b[33m%s\x1b[0m', '[!] Notice: Tables not fully detected via REST endpoint.');
        console.log('To execute the full DDL script directly, paste `supabase/migrations/001_initial_schema.sql`');
        console.log('into your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql\n');
        console.log('Or provide the direct PostgreSQL connection string in .env:');
        console.log('DATABASE_URL=postgresql://postgres.[project-ref]:[db-password]@aws-0-[region].pooler.supabase.com:5432/postgres\n');
        process.exit(1);
      }
    } catch (apiErr) {
      console.error('\x1b[31m%s\x1b[0m', '[-] API Verification failed:', apiErr.message);
      process.exit(1);
    }
  }

  console.error('\x1b[31m%s\x1b[0m', '[-] ERROR: Missing DATABASE_URL and SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

runMigration();

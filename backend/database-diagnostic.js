#!/usr/bin/env node

/**
 * Database Diagnostic Script (JavaScript version)
 * 
 * This script helps diagnose login issues by checking:
 * - Database connectivity
 * - Schema integrity  
 * - Default user existence
 * - Password validation
 * - Environment configuration
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// Database configuration
const dbConfig = {
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: false,
  dialectOptions: {
    timezone: 'local',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  }
};

class DatabaseDiagnostic {
  constructor() {
    this.sequelize = new Sequelize(dbConfig);
  }

  /**
   * Test database connectivity
   */
  async testConnection() {
    try {
      await this.sequelize.authenticate();
      return {
        success: true,
        message: "✅ Database connection successful",
        details: {
          dialect: this.sequelize.getDialect(),
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "❌ Database connection failed",
        details: {
          error: error.message,
          config: {
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            user: process.env.DB_USER
          }
        }
      };
    }
  }

  /**
   * Check if required tables exist
   */
  async checkSchema() {
    try {
      const queryInterface = this.sequelize.getQueryInterface();
      const tables = await queryInterface.showAllTables();
      
      const requiredTables = ['Users', 'Companies', 'Queues'];
      const missingTables = requiredTables.filter(table => !tables.includes(table));
      
      if (missingTables.length > 0) {
        return {
          success: false,
          message: "❌ Missing required database tables",
          details: {
            missingTables,
            existingTables: tables,
            suggestion: "Run database migrations: npm run db:migrate"
          }
        };
      }

      return {
        success: true,
        message: "✅ All required tables exist",
        details: { 
          tableCount: tables.length,
          requiredTables: requiredTables.filter(table => tables.includes(table))
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "❌ Failed to check database schema",
        details: { error: error.message }
      };
    }
  }

  /**
   * Check if default admin user exists
   */
  async checkDefaultUser() {
    try {
      const [results] = await this.sequelize.query(`
        SELECT u.id, u.name, u.email, u.profile, u."super", u."companyId", u."passwordHash"
        FROM "Users" u 
        WHERE u.email = 'admin@admin.com'
        LIMIT 1
      `);

      if (results.length === 0) {
        return {
          success: false,
          message: "❌ Default admin user not found",
          details: {
            expectedEmail: "admin@admin.com",
            suggestion: "Run database seeding: npm run db:seed"
          }
        };
      }

      const user = results[0];
      
      // Test password
      let passwordValid = false;
      try {
        passwordValid = await bcrypt.compare("123456", user.passwordHash);
      } catch (err) {
        // Password hash might be invalid
      }
      
      return {
        success: true,
        message: "✅ Default admin user exists",
        details: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          super: user.super,
          companyId: user.companyId,
          passwordValid,
          hasPasswordHash: !!user.passwordHash
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "❌ Failed to check default user",
        details: { error: error.message }
      };
    }
  }

  /**
   * Check migration status
   */
  async checkMigrations() {
    try {
      const queryInterface = this.sequelize.getQueryInterface();
      
      // Check if SequelizeMeta table exists (tracks migrations)
      const tables = await queryInterface.showAllTables();
      const hasMigrationTable = tables.includes('SequelizeMeta');
      
      if (!hasMigrationTable) {
        return {
          success: false,
          message: "❌ Migration tracking table not found",
          details: {
            suggestion: "Run migrations: npm run db:migrate"
          }
        };
      }

      // Get executed migrations
      const [results] = await this.sequelize.query('SELECT name FROM "SequelizeMeta" ORDER BY name');
      
      return {
        success: true,
        message: "✅ Migration system is working",
        details: {
          executedMigrations: results.length,
          latestMigrations: results.slice(-3).map(r => r.name)
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "❌ Failed to check migration status",
        details: { error: error.message }
      };
    }
  }

  /**
   * Check environment configuration
   */
  checkEnvironment() {
    const requiredVars = [
      'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS',
      'JWT_SECRET', 'JWT_REFRESH_SECRET'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    const present = requiredVars.filter(varName => process.env[varName]);

    if (missing.length > 0) {
      return {
        success: false,
        message: "❌ Missing required environment variables",
        details: {
          missing,
          present,
          suggestion: "Check your .env file"
        }
      };
    }

    return {
      success: true,
      message: "✅ All required environment variables are set",
      details: {
        variableCount: present.length,
        dbConfig: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          user: process.env.DB_USER
        }
      }
    };
  }

  /**
   * Test authentication with default credentials
   */
  async testAuthentication() {
    try {
      const [results] = await this.sequelize.query(`
        SELECT u.id, u.name, u.email, u.profile, u."passwordHash", c.id as company_id
        FROM "Users" u 
        LEFT JOIN "Companies" c ON u."companyId" = c.id
        WHERE u.email = 'admin@admin.com'
        LIMIT 1
      `);

      if (results.length === 0) {
        return {
          success: false,
          message: "❌ Cannot test authentication - user not found"
        };
      }

      const user = results[0];
      const passwordValid = await bcrypt.compare("123456", user.passwordHash);
      
      if (!passwordValid) {
        return {
          success: false,
          message: "❌ Authentication test failed - invalid password",
          details: {
            email: "admin@admin.com",
            expectedPassword: "123456",
            suggestion: "Password may have been changed or corrupted"
          }
        };
      }

      return {
        success: true,
        message: "✅ Authentication test successful",
        details: {
          email: "admin@admin.com",
          password: "123456",
          userId: user.id,
          profile: user.profile,
          hasCompany: !!user.company_id
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "❌ Authentication test failed",
        details: { error: error.message }
      };
    }
  }

  /**
   * Run complete diagnostic
   */
  async runFullDiagnostic() {
    console.log("🔍 Starting Database Diagnostic for Login Issues...\n");

    const results = [];

    // Environment check
    console.log("1. Environment Configuration:");
    const envResult = this.checkEnvironment();
    console.log(`   ${envResult.message}`);
    if (envResult.details) {
      console.log(`   Details:`, JSON.stringify(envResult.details, null, 2));
    }
    console.log();
    results.push(envResult);

    // Connection test
    console.log("2. Database Connection:");
    const connectionResult = await this.testConnection();
    console.log(`   ${connectionResult.message}`);
    if (connectionResult.details) {
      console.log(`   Details:`, JSON.stringify(connectionResult.details, null, 2));
    }
    console.log();
    results.push(connectionResult);

    if (!connectionResult.success) {
      console.log("❌ Cannot proceed without database connection");
      await this.sequelize.close();
      return;
    }

    // Schema check
    console.log("3. Database Schema:");
    const schemaResult = await this.checkSchema();
    console.log(`   ${schemaResult.message}`);
    if (schemaResult.details) {
      console.log(`   Details:`, JSON.stringify(schemaResult.details, null, 2));
    }
    console.log();
    results.push(schemaResult);

    // Migration check
    console.log("4. Migration Status:");
    const migrationResult = await this.checkMigrations();
    console.log(`   ${migrationResult.message}`);
    if (migrationResult.details) {
      console.log(`   Details:`, JSON.stringify(migrationResult.details, null, 2));
    }
    console.log();
    results.push(migrationResult);

    // Default user check
    console.log("5. Default Admin User:");
    const userResult = await this.checkDefaultUser();
    console.log(`   ${userResult.message}`);
    if (userResult.details) {
      console.log(`   Details:`, JSON.stringify(userResult.details, null, 2));
    }
    console.log();
    results.push(userResult);

    // Authentication test
    console.log("6. Authentication Test:");
    const authResult = await this.testAuthentication();
    console.log(`   ${authResult.message}`);
    if (authResult.details) {
      console.log(`   Details:`, JSON.stringify(authResult.details, null, 2));
    }
    console.log();
    results.push(authResult);

    // Summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log("📊 Diagnostic Summary:");
    console.log(`   Passed: ${successCount}/${totalCount} checks`);
    
    if (successCount === totalCount) {
      console.log("   🎉 All checks passed! Login should work with:");
      console.log("   📧 Email: admin@admin.com");
      console.log("   🔑 Password: 123456");
    } else {
      console.log("   ⚠️  Issues found. Recommendations:");
      
      if (!envResult.success) {
        console.log("   • Fix environment variables in .env file");
      }
      if (!connectionResult.success) {
        console.log("   • Check database connection settings");
        console.log("   • Ensure PostgreSQL is running");
      }
      if (!schemaResult.success) {
        console.log("   • Run: npm run db:migrate");
      }
      if (!migrationResult.success) {
        console.log("   • Run: npm run db:migrate");
      }
      if (!userResult.success) {
        console.log("   • Run: npm run db:seed");
      }
      if (!authResult.success && userResult.success) {
        console.log("   • Default password may be corrupted - re-run seeding");
      }
    }

    await this.sequelize.close();
  }
}

// CLI execution
if (require.main === module) {
  const diagnostic = new DatabaseDiagnostic();
  diagnostic.runFullDiagnostic().catch(error => {
    console.error('❌ Diagnostic failed:', error.message);
    process.exit(1);
  });
}

module.exports = DatabaseDiagnostic;
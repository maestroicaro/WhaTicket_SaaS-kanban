import "../bootstrap";
import sequelize from "../database";
import User from "../models/User";
import Company from "../models/Company";
import { hash } from "bcryptjs";

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
}

class DatabaseDiagnostic {
  
  /**
   * Test database connectivity
   */
  async testConnection(): Promise<DiagnosticResult> {
    try {
      await sequelize.authenticate();
      return {
        success: true,
        message: "✅ Database connection successful",
        details: {
          dialect: sequelize.getDialect(),
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
  async checkSchema(): Promise<DiagnosticResult> {
    try {
      const queryInterface = sequelize.getQueryInterface();
      const tables = await queryInterface.showAllTables();
      
      const requiredTables = ['Users', 'Companies', 'Queues', 'Tickets'];
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
        details: { tables }
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
  async checkDefaultUser(): Promise<DiagnosticResult> {
    try {
      const defaultUser = await User.findOne({
        where: { email: "admin@admin.com" },
        include: [{ model: Company }]
      });

      if (!defaultUser) {
        return {
          success: false,
          message: "❌ Default admin user not found",
          details: {
            expectedEmail: "admin@admin.com",
            suggestion: "Run database seeding: npm run db:seed"
          }
        };
      }

      // Test password
      const passwordValid = await defaultUser.checkPassword("123456");
      
      return {
        success: true,
        message: "✅ Default admin user exists",
        details: {
          id: defaultUser.id,
          name: defaultUser.name,
          email: defaultUser.email,
          profile: defaultUser.profile,
          super: defaultUser.super,
          companyId: defaultUser.companyId,
          passwordValid,
          hasCompany: !!defaultUser.company
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
   * Verify password hash for default user
   */
  async verifyDefaultPassword(): Promise<DiagnosticResult> {
    try {
      const defaultUser = await User.findOne({
        where: { email: "admin@admin.com" }
      });

      if (!defaultUser) {
        return {
          success: false,
          message: "❌ Default user not found for password verification"
        };
      }

      const passwordValid = await defaultUser.checkPassword("123456");
      
      if (!passwordValid) {
        // Check if password hash matches expected bcrypt format
        const expectedHash = await hash("123456", 8);
        const hashFormat = defaultUser.passwordHash?.startsWith('$2') ? 'bcrypt' : 'unknown';
        
        return {
          success: false,
          message: "❌ Default password is incorrect",
          details: {
            hashFormat,
            suggestion: "Password may have been changed or hash is corrupted"
          }
        };
      }

      return {
        success: true,
        message: "✅ Default password is correct",
        details: {
          email: "admin@admin.com",
          password: "123456",
          hashFormat: "bcrypt"
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "❌ Failed to verify default password",
        details: { error: error.message }
      };
    }
  }

  /**
   * Check migration status
   */
  async checkMigrations(): Promise<DiagnosticResult> {
    try {
      const queryInterface = sequelize.getQueryInterface();
      
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
      const [results] = await sequelize.query("SELECT name FROM \"SequelizeMeta\" ORDER BY name");
      
      return {
        success: true,
        message: "✅ Migration system is working",
        details: {
          executedMigrations: results.length,
          latestMigrations: results.slice(-3) // Show last 3 migrations
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
  checkEnvironment(): DiagnosticResult {
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
        variables: present,
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
   * Run complete diagnostic
   */
  async runFullDiagnostic(): Promise<void> {
    console.log("🔍 Starting Database Diagnostic...\n");

    // Environment check
    console.log("1. Environment Configuration:");
    const envResult = this.checkEnvironment();
    console.log(`   ${envResult.message}`);
    if (envResult.details) {
      console.log(`   Details:`, JSON.stringify(envResult.details, null, 2));
    }
    console.log();

    // Connection test
    console.log("2. Database Connection:");
    const connectionResult = await this.testConnection();
    console.log(`   ${connectionResult.message}`);
    if (connectionResult.details) {
      console.log(`   Details:`, JSON.stringify(connectionResult.details, null, 2));
    }
    console.log();

    if (!connectionResult.success) {
      console.log("❌ Cannot proceed without database connection");
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

    // Migration check
    console.log("4. Migration Status:");
    const migrationResult = await this.checkMigrations();
    console.log(`   ${migrationResult.message}`);
    if (migrationResult.details) {
      console.log(`   Details:`, JSON.stringify(migrationResult.details, null, 2));
    }
    console.log();

    // Default user check
    console.log("5. Default Admin User:");
    const userResult = await this.checkDefaultUser();
    console.log(`   ${userResult.message}`);
    if (userResult.details) {
      console.log(`   Details:`, JSON.stringify(userResult.details, null, 2));
    }
    console.log();

    // Password verification
    if (userResult.success) {
      console.log("6. Default Password Verification:");
      const passwordResult = await this.verifyDefaultPassword();
      console.log(`   ${passwordResult.message}`);
      if (passwordResult.details) {
        console.log(`   Details:`, JSON.stringify(passwordResult.details, null, 2));
      }
      console.log();
    }

    // Summary
    const allResults = [envResult, connectionResult, schemaResult, migrationResult, userResult];
    const successCount = allResults.filter(r => r.success).length;
    const totalCount = allResults.length;

    console.log("📊 Diagnostic Summary:");
    console.log(`   Passed: ${successCount}/${totalCount} checks`);
    
    if (successCount === totalCount) {
      console.log("   🎉 All checks passed! Login should work with admin@admin.com / 123456");
    } else {
      console.log("   ⚠️  Some issues found. Please address the failed checks above.");
    }

    await sequelize.close();
  }
}

// Export for use in other modules
export default DatabaseDiagnostic;

// CLI execution
if (require.main === module) {
  const diagnostic = new DatabaseDiagnostic();
  diagnostic.runFullDiagnostic().catch(console.error);
}
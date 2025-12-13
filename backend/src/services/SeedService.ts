import Plan from "../models/Plan";
import User from "../models/User";
import Company from "../models/Company";
import { hash } from "bcryptjs";

export const RunSeed = async (): Promise<string> => {
  const logs: string[] = [];
  try {
    logs.push("🔍 Starting manual seed...");

    // 1. Check/Create Plans
    const plans = [
      { id: 1, name: "Plano Individual", users: 1, connections: 1, queues: 3, value: 49.90 },
      { id: 2, name: "Plano Plus", users: 5, connections: 3, queues: 10, value: 99.90 },
      { id: 3, name: "Plano Pro", users: 10, connections: 10, queues: 20, value: 199.90 }
    ];

    for (const plan of plans) {
      const [p, created] = await Plan.findOrCreate({
        where: { id: plan.id },
        defaults: plan
      });
      if (created) {
        logs.push(`✅ Plan '${plan.name}' created.`);
      } else {
        logs.push(`ℹ️ Plan '${plan.name}' exists.`);
      }
    }

    // 2. Check/Create Company
    const [company, companyCreated] = await Company.findOrCreate({
      where: { id: 1 },
      defaults: {
        id: 1,
        name: "Empresa Admin",
        planId: 1,
        dueDate: "2093-03-14 04:00:00+01"
      }
    });

    if (companyCreated) {
      logs.push("✅ Default Company (ID 1) created.");
    } else {
      logs.push("ℹ️ Default Company exists.");
    }

    // 3. Check/Create Admin User
    const adminEmail = "admin@admin.com";
    const adminUser = await User.findOne({ where: { email: adminEmail } });

    if (!adminUser) {
      logs.push("🔍 Admin user missing. Creating...");
      const passwordHash = await hash("123456", 8);
      await User.create({
        name: "Admin",
        email: adminEmail,
        passwordHash,
        profile: "admin",
        super: true,
        companyId: 1
      });
      logs.push("✅ Admin user created.");
    } else {
      logs.push("ℹ️ Admin user exists.");
      // Fix Orphaned Admin
      if (adminUser.companyId !== 1) {
        logs.push("⚠️ Admin user orphaned. Linking to company...");
        await adminUser.update({ companyId: 1 });
        logs.push("✅ Admin user fixed.");
      }
    }
  } catch (error) {
    logs.push(`❌ Error: ${error}`);
  }
    // 4. Dump State
    const allPlans = await Plan.findAll();
    logs.push("\n📊 Current Plans in DB:");
    allPlans.forEach(p => logs.push(` - ID: ${p.id}, Name: ${p.name}`));

    const allUsers = await User.findAll();
    logs.push("\n👥 Current Users in DB:");
    allUsers.forEach(u => logs.push(` - ID: ${u.id}, Email: ${u.email}, Company: ${u.companyId}, Super: ${u.super}`));

  } catch (error) {
    logs.push(`❌ Error: ${error}`);
  }
  return logs.join("\n");
};

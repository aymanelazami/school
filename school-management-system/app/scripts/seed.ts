/**
 * Seed Script - Creates test users and roles for development/testing
 * 
 * Run with: npx tsx app/scripts/seed.ts
 * 
 * Test Credentials:
 * - Admin: admin@schola.com / admin123
 * - Teacher: teacher@schola.com / teacher123
 * - Student: student@schola.com / student123
 */

import { db } from '../database/index.ts';
import { users } from '../database/user.ts';
import { roles } from '../database/role.ts';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seed() {
    console.log('🌱 Starting seed...\n');

    try {
        // 1. Create Roles if they don't exist
        console.log('📋 Creating roles...');

        const roleData = [
            { name: 'Admin' },
            { name: 'Teacher' },
            { name: 'Student' },
        ];

        for (const role of roleData) {
            const existing = await db.select().from(roles).where(eq(roles.name, role.name));
            if (existing.length === 0) {
                await db.insert(roles).values({ name: role.name });
                console.log(`  ✅ Created role: ${role.name}`);
            } else {
                console.log(`  ⏭️  Role already exists: ${role.name}`);
            }
        }

        // 2. Get role IDs
        const allRoles = await db.select().from(roles);
        const adminRole = allRoles.find(r => r.name === 'Admin');
        const teacherRole = allRoles.find(r => r.name === 'Teacher');
        const studentRole = allRoles.find(r => r.name === 'Student');

        // 3. Create Test Users
        console.log('\n👤 Creating test users...');

        const testUsers = [
            {
                firstName: 'Admin',
                lastName: 'SCHOLA',
                email: 'admin@schola.com',
                password: 'admin123',
                roleId: adminRole?.id,
                isActive: true,
                emailVerified: true,
            },
            {
                firstName: 'Jean',
                lastName: 'Dupont',
                email: 'teacher@schola.com',
                password: 'teacher123',
                roleId: teacherRole?.id,
                isActive: true,
                emailVerified: true,
            },
            {
                firstName: 'Marie',
                lastName: 'Martin',
                email: 'student@schola.com',
                password: 'student123',
                roleId: studentRole?.id,
                isActive: true,
                emailVerified: true,
            },
        ];

        for (const userData of testUsers) {
            const existing = await db.select().from(users).where(eq(users.email, userData.email));

            if (existing.length === 0) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);

                await db.insert(users).values({
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    password: hashedPassword,
                    birthDate: '1990-01-01', // Default birth date
                    phoneNumber: '+33600000000', // Default phone
                    address: '123 Rue Example', // Default address
                    zipCode: '75001', // Default zip
                    roleId: userData.roleId,
                    isActive: userData.isActive,
                    emailVerified: userData.emailVerified,
                });

                console.log(`  ✅ Created user: ${userData.email} (password: ${userData.password})`);
            } else {
                console.log(`  ⏭️  User already exists: ${userData.email}`);
            }
        }

        console.log('\n✨ Seed completed successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 TEST CREDENTIALS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  Admin:   admin@schola.com   / admin123');
        console.log('  Teacher: teacher@schola.com / teacher123');
        console.log('  Student: student@schola.com / student123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

seed();

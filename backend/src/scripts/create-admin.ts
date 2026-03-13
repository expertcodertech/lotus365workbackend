import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../modules/users/user.entity';
import { Wallet } from '../modules/wallet/wallet.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

async function createAdminUser() {
  console.log('🪷 Creating admin user...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const walletRepo = app.get<Repository<Wallet>>(getRepositoryToken(Wallet));
  
  try {
    // Check if admin already exists
    const existingAdmin = await userRepo.findOne({ 
      where: { phone: '+919876543210' } 
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      // Update to admin role if not already
      if (existingAdmin.role !== UserRole.ADMIN) {
        await userRepo.update(existingAdmin.id, { role: UserRole.ADMIN });
        console.log('✅ Updated existing user to admin role');
      }
      await app.close();
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const adminUser = userRepo.create({
      phone: '+919876543210',
      fullName: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isPhoneVerified: true,
      referralCode: 'ADMIN1000',
    });
    
    await userRepo.save(adminUser);
    console.log('✅ Admin user created');
    
    // Create wallet for admin
    const wallet = walletRepo.create({ 
      userId: adminUser.id,
      balance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    });
    await walletRepo.save(wallet);
    console.log('✅ Admin wallet created');
    
    console.log('🎉 Admin setup complete!');
    console.log('📱 Phone: +919876543210');
    console.log('🔑 Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await app.close();
  }
}

createAdminUser();
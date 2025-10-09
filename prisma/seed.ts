import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default tenant
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'default-company' },
    update: {},
    create: {
      name: 'Empresa Padrão',
      slug: 'default-company',
      description: 'Empresa padrão do sistema',
      isActive: true
    }
  });

  console.log('✅ Created default tenant:', defaultTenant.name);

  // Create tenant settings
  await prisma.tenantSettings.upsert({
    where: { tenantId: defaultTenant.id },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      siteName: 'Sistema Command-D',
      businessName: 'Empresa Padrão',
      businessEmail: 'contato@empresa.com',
      businessPhone: '(11) 99999-9999',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      enableGPS: true,
      enablePayroll: true,
      enableInventory: true,
      enableReports: true
    }
  });

  console.log('✅ Created tenant settings');

  // Create master admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const masterAdmin = await prisma.user.upsert({
    where: { email: 'admin@command-d.com' },
    update: {},
    create: {
      email: 'admin@command-d.com',
      password: hashedPassword,
      name: 'Administrador Master',
      role: 'MASTER_ADMIN',
      tenantId: defaultTenant.id,
      isActive: true
    }
  });

  console.log('✅ Created master admin user');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      email: 'admin@empresa.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      tenantId: defaultTenant.id,
      isActive: true
    }
  });

  console.log('✅ Created admin user');

  // Create sample client
  const sampleClient = await prisma.client.upsert({
    where: { 
      email_tenantId: {
        email: 'cliente@exemplo.com',
        tenantId: defaultTenant.id
      }
    },
    update: {},
    create: {
      name: 'Cliente Exemplo',
      email: 'cliente@exemplo.com',
      phone: '(11) 88888-8888',
      document: '123.456.789-00',
      type: 'INDIVIDUAL',
      address: 'Rua Exemplo, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      tenantId: defaultTenant.id,
      isActive: true
    }
  });

  console.log('✅ Created sample client');

  // Create sample employee
  const sampleEmployee = await prisma.employee.upsert({
    where: { email: 'funcionario@empresa.com' },
    update: {},
    create: {
      name: 'Funcionário Exemplo',
      email: 'funcionario@empresa.com',
      phone: '(11) 77777-7777',
      position: 'Operador',
      department: 'Produção',
      salary: 3000.00,
      hireDate: new Date('2024-01-01'),
      tenantId: defaultTenant.id,
      isActive: true
    }
  });

  console.log('✅ Created sample employee');

  // Create sample categories
  const categories = [
    { name: 'Câmeras', description: 'Câmeras profissionais', color: '#3B82F6' },
    { name: 'Lentes', description: 'Lentes para câmeras', color: '#10B981' },
    { name: 'Áudio', description: 'Equipamentos de áudio', color: '#F59E0B' },
    { name: 'Iluminação', description: 'Equipamentos de iluminação', color: '#EF4444' },
    { name: 'Suportes', description: 'Suportes e tripés', color: '#8B5CF6' }
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: {
        name_tenantId: {
          name: categoryData.name,
          tenantId: defaultTenant.id
        }
      },
      update: {},
      create: {
        ...categoryData,
        tenantId: defaultTenant.id,
        isActive: true
      }
    });
  }

  console.log('✅ Created sample categories');

  // Create sample products
  const cameraCategory = await prisma.category.findFirst({
    where: { name: 'Câmeras', tenantId: defaultTenant.id }
  });

  if (cameraCategory) {
    const products = [
      {
        name: 'Canon EOS R5',
        description: 'Câmera mirrorless profissional 45MP',
        sku: 'CAM-001',
        brand: 'Canon',
        model: 'EOS R5',
        dailyPrice: 150.00,
        weeklyPrice: 800.00,
        monthlyPrice: 2500.00,
        quantity: 2,
        status: 'AVAILABLE',
        ownerType: 'COMPANY',
        tenantId: defaultTenant.id
      },
      {
        name: 'Sony FX6',
        description: 'Câmera de cinema 4K',
        sku: 'CAM-002',
        brand: 'Sony',
        model: 'FX6',
        dailyPrice: 200.00,
        weeklyPrice: 1000.00,
        monthlyPrice: 3500.00,
        quantity: 1,
        status: 'AVAILABLE',
        ownerType: 'COMPANY',
        tenantId: defaultTenant.id
      }
    ];

    for (const productData of products) {
      await prisma.product.upsert({
        where: {
          sku_tenantId: {
            sku: productData.sku,
            tenantId: defaultTenant.id
          }
        },
        update: {},
        create: {
          ...productData,
          categoryId: cameraCategory.id
        }
      });
    }

    console.log('✅ Created sample products');
  }

  // Create sample order
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-000001',
      clientId: sampleClient.id,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-03'),
      subtotal: 300.00,
      total: 300.00,
      status: 'CONFIRMED',
      notes: 'Pedido de exemplo',
      tenantId: defaultTenant.id
    }
  });

  console.log('✅ Created sample order');

  // Create sample timesheet
  await prisma.timesheet.create({
    data: {
      employeeId: sampleEmployee.id,
      date: new Date(),
      clockIn: new Date(),
      clockOut: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours later
      status: 'APPROVED',
      isApproved: true,
      tenantId: defaultTenant.id
    }
  });

  console.log('✅ Created sample timesheet');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('Master Admin: admin@command-d.com / admin123');
  console.log('Admin: admin@empresa.com / admin123');
  console.log('Employee: funcionario@empresa.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

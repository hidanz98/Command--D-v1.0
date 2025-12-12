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

  // Create admin user (Bil's Cinema)
  const bilsAdmin = await prisma.user.upsert({
    where: { email: 'cabecadeefeitocine@gmail.com' },
    update: {
      password: hashedPassword, // Atualiza senha caso já exista
    },
    create: {
      email: 'cabecadeefeitocine@gmail.com',
      password: hashedPassword,
      name: 'Admin Bil\'s Cinema',
      role: 'ADMIN',
      tenantId: defaultTenant.id,
      isActive: true
    }
  });

  console.log('✅ Created Bil\'s Cinema admin user');

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

  // Create sample client (Client has no unique email; use find/create)
  let sampleClient = await prisma.client.findFirst({
    where: { email: 'cliente@exemplo.com', tenantId: defaultTenant.id }
  });
  if (!sampleClient) {
    sampleClient = await prisma.client.create({
      data: {
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
  }

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

  // Clear existing catalog for this tenant
  await prisma.product.deleteMany({ where: { tenantId: defaultTenant.id } });
  await prisma.category.deleteMany({ where: { tenantId: defaultTenant.id } });

  // Create REFLETORES category
  const reflectorsCategory = await prisma.category.create({
    data: {
      name: 'REFLETORES',
      description: 'Refletores, painéis e tubos LED para cinema e vídeo',
      color: '#F59E0B',
      tenantId: defaultTenant.id,
      isActive: true,
    }
  });

  console.log('✅ Categoria REFLETORES criada');

  // Helper for weekly/monthly pricing
  const weeklyFromDaily = (d: number) => Number((d * 5).toFixed(2));
  const monthlyFromDaily = (d: number) => Number((d * 20).toFixed(2));

  // Products list (quantity 5 each, including kits)
  const products = [
    // AMARAN
    { name: 'AMARAN 60X (BICOLOR) - REFLETOR', brand: 'Amaran', model: '60X', daily: 180 },
    { name: 'AMARAN 100X (BICOLOR) - REFLETOR', brand: 'Amaran', model: '100X', daily: 210 },
    { name: 'AMARAN 200X (BICOLOR) - REFLETOR', brand: 'Amaran', model: '200X', daily: 250 },
    { name: 'AMARAN 300C (RGBW) - REFLETOR', brand: 'Amaran', model: '300C', daily: 350 },
    { name: 'AMARAN P60C (RGB) - PAINEL C/ DIFUSOR E COMEIA', brand: 'Amaran', model: 'P60C', daily: 200, specifications: { accessories: ['Difusor', 'Colmeia (grid)'] } },
    { name: 'AMARAN CARPETE LED F22C (RGBWW)', brand: 'Amaran', model: 'F22C', daily: 600 },

    // APUTURE
    { name: 'APUTURE 300X (BICOLOR) - REFLETOR', brand: 'Aputure', model: '300X', daily: 400 },
    { name: 'APUTURE 600X (BICOLOR) - REFLETOR', brand: 'Aputure', model: '600X', daily: 800 },
    { name: 'APUTURE 600C (RGBW) - REFLETOR', brand: 'Aputure', model: '600C', daily: 900 },
    { name: 'APUTURE 1.200D PRO - REFLETOR', brand: 'Aputure', model: '1200D Pro', daily: 1500 },
    { name: 'APUTURE NOVA P300C RGBW - PAINEL', brand: 'Aputure', model: 'NOVA P300C', daily: 550 },
    { name: 'APUTURE P600C RGBW - PAINEL', brand: 'Aputure', model: 'P600C', daily: 800 },
    { name: 'APUTURE ELECTRO STORM XT26', brand: 'Aputure', model: 'Electro Storm XT26', daily: 3000 },

    // FRESNEL / PAR
    { name: 'FRESNEL 5.000w Arri', brand: 'Arri', model: '5K Fresnel', daily: 350 },
    { name: 'FRESNEL 2.000w Desisti', brand: 'Desisti', model: '2K Fresnel', daily: 140 },
    { name: 'FRESNEL 1.000w Desisti', brand: 'Desisti', model: '1K Fresnel', daily: 90 },
    { name: 'FRESNEL 650w Filmgear', brand: 'Filmgear', model: '650w Fresnel', daily: 80 },
    { name: 'FRESNEL 300w Filmgear', brand: 'Filmgear', model: '300w Fresnel', daily: 70 },
    { name: 'FRESNEL 150w Filmgear', brand: 'Filmgear', model: '150w Fresnel', daily: 60 },

    { name: 'PAR 64 - 1K (FOCO 2)', brand: 'Generic', model: 'PAR64 1K', daily: 60 },

    // KITS
    { name: 'APUTURE BULBO B7C - KIT MALETA COM 8 UNIDADES', brand: 'Aputure', model: 'B7c Kit', daily: 350, specifications: { isKit: true, kitItems: ['Bulbo B7c x8', 'Maleta/carregador'], notes: 'Conjunto de lâmpadas RGBWW com carregamento na maleta' } },
    { name: 'APTURE MC KIT 4 LEDS (Quadrado peq. c/ 2 difusões silicone)', brand: 'Aputure', model: 'MC 4-Light Kit', daily: 250, specifications: { isKit: true, kitItems: ['Aputure MC x4', 'Difusores de silicone x2', 'Case'], notes: 'Leds RGBWW portáteis' } },

    // Tubos / barras
    { name: 'APUTURE MT PRO RGBW (30 cm) - LED TUBO', brand: 'Aputure', model: 'MT Pro', daily: 100 },
    { name: 'AMARAN PT 2C (60 cm) - TUBO LED RGBWW', brand: 'Amaran', model: 'PT2c', daily: 120 },
    { name: 'AMARAN PT 4C (120 cm) - TUBO LED RGBWW', brand: 'Amaran', model: 'PT4c', daily: 150 },
    { name: 'PAVOTUBE II 30X RGBW - NANLITE (120 cm) - LED TUBO', brand: 'Nanlite', model: 'PavoTube II 30X', daily: 150 },
  ];

  const makeImages = (brand?: string, model?: string) => {
    const q = [brand, model, 'video light'].filter(Boolean).join(',');
    const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(q)}`;
    const url2 = `https://source.unsplash.com/1200x800/?${encodeURIComponent(q)}`;
    return [url, url2];
  };

  for (const [index, p] of products.entries()) {
    const daily = p.daily;
    await prisma.product.create({
      data: {
        name: p.name,
        description: 'Equipamento de iluminação profissional para cinema/foto. Valores por diária.',
        sku: `REF-${String(index + 1).padStart(3, '0')}`,
        brand: p.brand,
        model: p.model,
        dailyPrice: daily,
        weeklyPrice: weeklyFromDaily(daily),
        monthlyPrice: monthlyFromDaily(daily),
        quantity: p.specifications && (p.specifications as any).isKit ? 5 : 10,
        status: 'AVAILABLE',
        ownerType: 'COMPANY',
        tenantId: defaultTenant.id,
        categoryId: reflectorsCategory.id,
        specifications: p.specifications ? p.specifications as any : undefined,
        tags: ['REFLETORES'],
        images: makeImages(p.brand, p.model),
        isActive: true,
        visibility: 'PUBLIC',
        featured: index < 4 // Primeiros 4 produtos são destaque
      }
    });
  }

  console.log('✅ Produtos REFLETORES cadastrados');

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
  console.log('Bil\'s Cinema Admin: cabecadeefeitocine@gmail.com / admin123');
  console.log('Admin: admin@empresa.com / admin123');
  console.log('Employee: funcionario@empresa.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    // Safely handle missing process type in some environments
    if (typeof globalThis.process !== "undefined" && typeof globalThis.process.exit === "function") {
      globalThis.process.exit(1);
    }
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

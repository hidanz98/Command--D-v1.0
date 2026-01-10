import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando configuração do banco de dados...');

  // Buscar ou criar tenant padrão
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

  console.log('✅ Tenant configurado:', defaultTenant.name);

  // Configurar tenant settings
  await prisma.tenantSettings.upsert({
    where: { tenantId: defaultTenant.id },
    update: {},
    create: {
      tenantId: defaultTenant.id,
      siteName: 'Bil\'s Cinema e Vídeo',
      businessName: 'Bil\'s Cinema e Vídeo',
      businessEmail: 'cabecadeefeitocine@gmail.com',
      businessPhone: '(11) 99999-9999',
      primaryColor: '#F59E0B',
      secondaryColor: '#1E40AF',
      enableGPS: true,
      enablePayroll: true,
      enableInventory: true,
      enableReports: true
    }
  });

  console.log('✅ Configurações do tenant atualizadas');

  // ============================================
  // LIMPAR DADOS ANTIGOS
  // ============================================
  console.log('\n🧹 Limpando dados antigos...');

  // Apagar todos os pedidos
  await prisma.order.deleteMany({ where: { tenantId: defaultTenant.id } });
  console.log('✅ Pedidos removidos');

  // Apagar todos os timesheets
  await prisma.timesheet.deleteMany({ where: { tenantId: defaultTenant.id } });
  console.log('✅ Timesheets removidos');

  // Apagar todos os funcionários (exceto se tiverem relação com usuário admin)
  await prisma.employee.deleteMany({ where: { tenantId: defaultTenant.id } });
  console.log('✅ Funcionários removidos');

  // Apagar todos os clientes
  await prisma.client.deleteMany({ where: { tenantId: defaultTenant.id } });
  console.log('✅ Clientes removidos');

  // Apagar todos os usuários EXCETO o admin principal
  await prisma.user.deleteMany({
    where: {
      tenantId: defaultTenant.id,
      email: { not: 'cabecadeefeitocine@gmail.com' }
    }
  });
  console.log('✅ Usuários removidos (exceto admin)');

  // ============================================
  // CRIAR ADMIN PRINCIPAL (se não existir)
  // ============================================
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'cabecadeefeitocine@gmail.com' },
    update: {
      password: hashedPassword, // Garantir que a senha está atualizada
      name: 'Admin Bil\'s Cinema',
      role: 'ADMIN',
      isActive: true
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

  console.log('✅ Admin principal configurado:', admin.email);

  // ============================================
  // CRIAR USUÁRIO OTAVIO (DESENVOLVEDOR - ACESSO ADMIN)
  // ============================================
  const hashedPasswordOtavio = await bcrypt.hash('Deus@05052018', 12);
  
  const userOtavio = await prisma.user.upsert({
    where: { email: 'otavioalmeida137@gmail.com' },
    update: {
      password: hashedPasswordOtavio,
      name: 'Otavio Almeida de Souza',
      role: 'ADMIN', // Acesso total como desenvolvedor
      isActive: true
    },
    create: {
      email: 'otavioalmeida137@gmail.com',
      password: hashedPasswordOtavio,
      name: 'Otavio Almeida de Souza',
      role: 'ADMIN', // Acesso total como desenvolvedor
      tenantId: defaultTenant.id,
      isActive: true
    }
  });

  console.log('✅ Usuário Otavio (Dev) configurado:', userOtavio.email);

  // ============================================
  // CRIAR FUNCIONÁRIO OTAVIO (DADOS DE RH)
  // ============================================
  const funcionarioOtavio = await prisma.employee.upsert({
    where: { email: 'otavioalmeida137@gmail.com' },
    update: {
      name: 'Otavio Almeida de Souza',
      phone: '(31) 99999-8888',
      position: 'Desenvolvedor',
      department: 'TI',
      isActive: true
    },
    create: {
      name: 'Otavio Almeida de Souza',
      email: 'otavioalmeida137@gmail.com',
      phone: '(31) 99999-8888',
      position: 'Desenvolvedor',
      department: 'TI',
      salary: 5000.00,
      hireDate: new Date(),
      tenantId: defaultTenant.id,
      isActive: true
    }
  });

  console.log('✅ Funcionário Otavio configurado');

  // ============================================
  // CRIAR CLIENTE VICTOR
  // ============================================
  const clienteVictor = await prisma.client.create({
    data: {
      name: 'Victor',
      email: 'victor@exemplo.com',
      phone: '(11) 88888-7777',
      document: '123.456.789-00',
      cpfCnpj: '123.456.789-00',
      type: 'INDIVIDUAL',
      personType: 'PF',
      address: 'Rua Exemplo, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      status: 'APPROVED',
      tenantId: defaultTenant.id,
      isActive: true,
      approvedAt: new Date(),
      approvedBy: admin.id
    }
  });

  console.log('✅ Cliente criado: Victor');

  // ============================================
  // MANTER PRODUTOS (já estão pré-cadastrados)
  // ============================================
  // Verificar se já existem produtos, se não, criar
  const existingProducts = await prisma.product.count({
    where: { tenantId: defaultTenant.id }
  });

  if (existingProducts === 0) {
    console.log('\n📦 Criando produtos...');

    // Criar categoria REFLETORES
    let reflectorsCategory = await prisma.category.findFirst({
      where: {
        tenantId: defaultTenant.id,
        name: 'REFLETORES'
      }
    });

    if (!reflectorsCategory) {
      reflectorsCategory = await prisma.category.create({
        data: {
          name: 'REFLETORES',
          description: 'Refletores, painéis e tubos LED para cinema e vídeo',
          color: '#F59E0B',
          tenantId: defaultTenant.id,
          isActive: true,
        }
      });
    }

    console.log('✅ Categoria REFLETORES criada');

    // Helper for weekly/monthly pricing
    const weeklyFromDaily = (d: number) => Number((d * 5).toFixed(2));
    const monthlyFromDaily = (d: number) => Number((d * 20).toFixed(2));

    // Products list
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
  } else {
    console.log(`✅ Produtos já existem (${existingProducts} produtos mantidos)`);
  }

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log('\n🎉 Sistema configurado com sucesso!');
  console.log('\n📋 Resumo:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 ADMIN:');
  console.log('   Email: cabecadeefeitocine@gmail.com');
  console.log('   Senha: admin123');
  console.log('');
  console.log('👨‍💻 DESENVOLVEDOR (ACESSO ADMIN):');
  console.log('   Nome: Otavio Almeida de Souza');
  console.log('   Email: otavioalmeida137@gmail.com');
  console.log('   Senha: ********** (pessoal)');
  console.log('');
  console.log('👤 CLIENTE:');
  console.log('   Nome: Victor');
  console.log('   Email: victor@exemplo.com');
  console.log('   Status: Aprovado');
  console.log('');
  console.log('📦 PRODUTOS:');
  console.log(`   Total: ${existingProducts > 0 ? existingProducts : 'Criados'} produtos`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✨ Sistema pronto para uso! A locadora está iniciando agora.');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao configurar banco de dados:', e);
    if (typeof globalThis.process !== "undefined" && typeof globalThis.process.exit === "function") {
      globalThis.process.exit(1);
    }
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

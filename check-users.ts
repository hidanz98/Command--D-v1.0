import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando usuários no banco...\n');
  
  const users = await prisma.user.findMany();
  
  console.log(`Total de usuários: ${users.length}\n`);
  
  for (const user of users) {
    console.log(`📧 Email: ${user.email}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Ativo: ${user.isActive}`);
    console.log(`   Senha hash: ${user.password.substring(0, 20)}...`);
    console.log('');
  }
  
  // Testar senha admin123
  const testUser = await prisma.user.findUnique({
    where: { email: 'cabecadeefeitocine@gmail.com' }
  });
  
  if (testUser) {
    const isValid = await bcrypt.compare('admin123', testUser.password);
    console.log(`\n🔐 Teste de senha para cabecadeefeitocine@gmail.com:`);
    console.log(`   Senha 'admin123' é válida: ${isValid}`);
  } else {
    console.log('\n❌ Usuário cabecadeefeitocine@gmail.com NÃO encontrado!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



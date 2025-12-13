#!/usr/bin/env node

/**
 * Script de inicialização com migrações automáticas
 * Para uso no Easypanel quando não é possível executar comandos manualmente
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando WhatsApp Ticketing System...');
console.log('📊 Verificando banco de dados...');

// Aguardar banco de dados estar disponível
const waitForDatabase = async () => {
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      // Tentar conectar ao banco
      execSync('node -e "require(\'./dist/database\').default.authenticate().then(() => process.exit(0)).catch(() => process.exit(1))"', {
        stdio: 'ignore',
        timeout: 5000
      });
      console.log('✅ Banco de dados conectado!');
      return true;
    } catch (error) {
      attempts++;
      console.log(`⏳ Aguardando banco... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('❌ Não foi possível conectar ao banco de dados');
  return false;
};

const runMigrations = () => {
  try {
    console.log('🔄 Executando migrações...');
    execSync('npx sequelize db:migrate', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('✅ Migrações executadas com sucesso!');
    return true;
  } catch (error) {
    console.log('⚠️ Erro nas migrações:', error.message);
    console.log('🔄 Tentando continuar sem migrações...');
    return false;
  }
};

const runSeeding = () => {
  try {
    console.log('🌱 Executando seeding...');
    execSync('npx sequelize db:seed:all', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('✅ Seeding executado com sucesso!');
    return true;
  } catch (error) {
    console.log('⚠️ Erro no seeding:', error.message);
    console.log('🔄 Tentando continuar sem seeding...');
    return false;
  }
};

const startServer = () => {
  try {
    console.log('🚀 Iniciando servidor...');
    execSync('npm start', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
  } catch (error) {
    console.log('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
};

// Função principal
const main = async () => {
  console.log('📍 Diretório atual:', __dirname);
  console.log('📦 Verificando dependências...');
  
  // Verificar se o build existe
  const fs = require('fs');
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('🔨 Build não encontrado, compilando...');
    try {
      execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
      console.log('✅ Build concluído!');
    } catch (error) {
      console.log('❌ Erro no build:', error.message);
      process.exit(1);
    }
  }
  
  // Aguardar banco de dados
  const dbConnected = await waitForDatabase();
  if (!dbConnected) {
    console.log('⚠️ Continuando sem conexão com banco...');
  }
  
  // Executar migrações
  if (dbConnected) {
    runMigrations();
    runSeeding();
  }
  
  // Iniciar servidor
  startServer();
};

// Executar
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
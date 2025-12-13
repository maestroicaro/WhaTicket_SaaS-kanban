#!/usr/bin/env node

/**
 * Script de Verificação de Deploy - Easypanel
 * 
 * Use este script para verificar se seu deploy está funcionando corretamente
 * 
 * Uso: node verificar-deploy.js [FRONTEND_URL] [BACKEND_URL]
 * 
 * Exemplo:
 * node verificar-deploy.js https://meu-frontend.easypanel.host https://meu-backend.easypanel.host
 */

const axios = require('axios');

class VerificadorDeploy {
  constructor(frontendUrl, backendUrl) {
    this.frontendUrl = frontendUrl || 'https://waha-api-whaticket-kiro.ynbvqv.easypanel.host';
    this.backendUrl = backendUrl || 'https://waha-api-api-whaticket-kiro.ynbvqv.easypanel.host';
    this.timeout = 10000;
  }

  async verificarFrontend() {
    try {
      console.log(`🌐 Verificando frontend: ${this.frontendUrl}`);
      const response = await axios.get(this.frontendUrl, { timeout: this.timeout });
      
      if (response.status === 200 && response.data.includes('<!DOCTYPE html>')) {
        console.log('✅ Frontend: OK - Página carregando');
        return true;
      } else {
        console.log('❌ Frontend: Resposta inesperada');
        return false;
      }
    } catch (error) {
      console.log(`❌ Frontend: Erro - ${error.message}`);
      return false;
    }
  }

  async verificarBackendHealth() {
    try {
      console.log(`🏥 Verificando health do backend: ${this.backendUrl}/api/health`);
      const response = await axios.get(`${this.backendUrl}/api/health`, { 
        timeout: this.timeout,
        validateStatus: () => true 
      });
      
      if (response.status === 200 && response.data.status === 'healthy') {
        console.log('✅ Backend Health: OK - Serviço funcionando');
        console.log(`   Uptime: ${Math.floor(response.data.uptime)}s`);
        return true;
      } else if (response.status === 404 && response.data.includes('easypanel')) {
        console.log('❌ Backend Health: Serviço não deployado no Easypanel');
        console.log('   💡 Verifique se o backend foi deployado corretamente');
        return false;
      } else {
        console.log(`❌ Backend Health: Status ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Backend Health: Erro - ${error.message}`);
      return false;
    }
  }

  async verificarLoginEndpoint() {
    try {
      console.log(`🔐 Verificando endpoint de login: ${this.backendUrl}/auth/login`);
      
      // Teste com credenciais inválidas (deve retornar 401)
      const response = await axios.post(`${this.backendUrl}/auth/login`, {
        email: 'teste@invalido.com',
        password: 'senha_invalida'
      }, {
        timeout: this.timeout,
        validateStatus: () => true
      });
      
      if (response.status === 401) {
        console.log('✅ Login Endpoint: OK - Retorna 401 para credenciais inválidas');
        return true;
      } else if (response.status === 404) {
        console.log('❌ Login Endpoint: Rota não encontrada (404)');
        console.log('   💡 Backend pode não estar inicializado corretamente');
        return false;
      } else {
        console.log(`⚠️ Login Endpoint: Status inesperado ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Login Endpoint: Erro - ${error.message}`);
      return false;
    }
  }

  async testarLoginAdmin() {
    try {
      console.log(`🔑 Testando login com admin@admin.com`);
      
      const response = await axios.post(`${this.backendUrl}/auth/login`, {
        email: 'admin@admin.com',
        password: '123456'
      }, {
        timeout: this.timeout,
        validateStatus: () => true
      });
      
      if (response.status === 200 && response.data.token) {
        console.log('✅ Login Admin: OK - Credenciais funcionando!');
        console.log(`   User ID: ${response.data.user?.id}`);
        console.log(`   Profile: ${response.data.user?.profile}`);
        return true;
      } else if (response.status === 401) {
        console.log('❌ Login Admin: Credenciais inválidas');
        console.log('   💡 Usuário admin pode não existir - execute migrações');
        return false;
      } else {
        console.log(`❌ Login Admin: Status ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Login Admin: Erro - ${error.message}`);
      return false;
    }
  }

  async executarVerificacao() {
    console.log('🔍 Verificação de Deploy - Easypanel\n');
    console.log(`Frontend: ${this.frontendUrl}`);
    console.log(`Backend:  ${this.backendUrl}\n`);

    const resultados = [];

    // 1. Verificar Frontend
    resultados.push(await this.verificarFrontend());
    console.log();

    // 2. Verificar Backend Health
    const backendOk = await this.verificarBackendHealth();
    resultados.push(backendOk);
    console.log();

    if (backendOk) {
      // 3. Verificar Login Endpoint
      resultados.push(await this.verificarLoginEndpoint());
      console.log();

      // 4. Testar Login Admin
      resultados.push(await this.testarLoginAdmin());
      console.log();
    } else {
      console.log('⏭️ Pulando testes de login - backend não está funcionando\n');
      resultados.push(false, false);
    }

    // Resumo
    const sucessos = resultados.filter(r => r).length;
    const total = resultados.length;

    console.log('📊 RESUMO:');
    console.log(`   ✅ Testes passaram: ${sucessos}/${total}`);

    if (sucessos === total) {
      console.log('\n🎉 DEPLOY FUNCIONANDO PERFEITAMENTE!');
      console.log('   📧 Login: admin@admin.com');
      console.log('   🔑 Senha: 123456');
      console.log(`   🌐 Acesse: ${this.frontendUrl}`);
    } else if (sucessos === 0) {
      console.log('\n🚨 DEPLOY COM PROBLEMAS GRAVES');
      console.log('   1. Verifique se os serviços estão rodando no Easypanel');
      console.log('   2. Verifique logs dos containers');
      console.log('   3. Confirme as variáveis de ambiente');
    } else {
      console.log('\n⚠️ DEPLOY PARCIALMENTE FUNCIONANDO');
      
      if (!resultados[0]) {
        console.log('   • Frontend: Problema no deploy ou configuração');
      }
      if (!resultados[1]) {
        console.log('   • Backend: Não está rodando ou com erro');
      }
      if (!resultados[2]) {
        console.log('   • API Routes: Problema na inicialização do backend');
      }
      if (!resultados[3]) {
        console.log('   • Login: Problema com banco de dados ou migrações');
      }
    }

    console.log('\n🔧 PRÓXIMOS PASSOS:');
    if (!resultados[1]) {
      console.log('   1. Verifique logs do backend no Easypanel');
      console.log('   2. Confirme que PostgreSQL está rodando');
      console.log('   3. Verifique variáveis de ambiente do backend');
    } else if (!resultados[3]) {
      console.log('   1. Execute migrações manualmente se necessário');
      console.log('   2. Verifique logs do backend para erros de migração');
      console.log('   3. Confirme conexão com PostgreSQL');
    } else {
      console.log('   1. Tudo funcionando! 🎉');
    }

    return sucessos === total;
  }
}

// Executar verificação
if (require.main === module) {
  const args = process.argv.slice(2);
  const frontendUrl = args[0];
  const backendUrl = args[1];
  
  if (args.length >= 2) {
    console.log('📝 Usando URLs fornecidas como parâmetros\n');
  } else {
    console.log('📝 Usando URLs padrão (você pode passar suas URLs como parâmetros)\n');
    console.log('   Uso: node verificar-deploy.js [FRONTEND_URL] [BACKEND_URL]\n');
  }

  const verificador = new VerificadorDeploy(frontendUrl, backendUrl);
  verificador.executarVerificacao().catch(error => {
    console.error('❌ Falha na verificação:', error.message);
    process.exit(1);
  });
}

module.exports = VerificadorDeploy;
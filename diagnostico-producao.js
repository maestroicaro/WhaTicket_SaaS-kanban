#!/usr/bin/env node

/**
 * Diagnóstico de Produção - Easypanel
 * 
 * Este script testa a comunicação e configuração em produção
 */

const axios = require('axios');

class DiagnosticoProducao {
  constructor() {
    // URLs do seu novo projeto Easypanel
    this.frontendUrl = 'https://waha-api-whaticket-kiro.ynbvqv.easypanel.host';
    this.backendUrl = 'https://waha-api-api-whaticket-kiro.ynbvqv.easypanel.host';
    this.timeout = 15000; // 15 segundos
  }

  /**
   * Teste 1: Verificar se o frontend está acessível
   */
  async testarFrontend() {
    try {
      console.log(`🌐 Testando frontend: ${this.frontendUrl}`);
      
      const response = await axios.get(this.frontendUrl, {
        timeout: this.timeout,
        validateStatus: () => true
      });

      return {
        success: response.status === 200,
        message: response.status === 200 ? "✅ Frontend acessível" : `⚠️ Frontend retornou status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers['content-type']
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "❌ Frontend não acessível",
        details: {
          error: error.message,
          code: error.code
        }
      };
    }
  }

  /**
   * Teste 2: Verificar se o backend está acessível
   */
  async testarBackend() {
    try {
      console.log(`🔧 Testando backend: ${this.backendUrl}`);
      
      const response = await axios.get(this.backendUrl, {
        timeout: this.timeout,
        validateStatus: () => true
      });

      return {
        success: response.status !== 0,
        message: response.status === 404 ? "✅ Backend rodando (404 é normal)" : `✅ Backend respondeu com status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "❌ Backend não acessível",
        details: {
          error: error.message,
          code: error.code,
          suggestion: "Verifique se o serviço backend está rodando no Easypanel"
        }
      };
    }
  }

  /**
   * Teste 3: Verificar endpoint de login
   */
  async testarEndpointLogin() {
    try {
      console.log(`🔐 Testando endpoint de login: ${this.backendUrl}/auth/login`);
      
      // Teste com credenciais inválidas (deve retornar 401)
      const response = await axios.post(`${this.backendUrl}/auth/login`, {
        email: 'teste@teste.com',
        password: 'senha_invalida'
      }, {
        timeout: this.timeout,
        validateStatus: () => true,
        withCredentials: true
      });

      if (response.status === 401) {
        return {
          success: true,
          message: "✅ Endpoint de login funcionando (retorna 401 para credenciais inválidas)",
          details: {
            status: response.status,
            endpoint: `${this.backendUrl}/auth/login`
          }
        };
      } else {
        return {
          success: false,
          message: `⚠️ Endpoint de login com comportamento inesperado (status ${response.status})`,
          details: {
            status: response.status,
            response: response.data
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "❌ Endpoint de login não acessível",
        details: {
          error: error.message,
          suggestion: "Verifique se as rotas estão configuradas corretamente"
        }
      };
    }
  }

  /**
   * Teste 4: Testar login com credenciais padrão
   */
  async testarLoginPadrao() {
    try {
      console.log(`🔑 Testando login com credenciais padrão`);
      
      const response = await axios.post(`${this.backendUrl}/auth/login`, {
        email: 'admin@admin.com',
        password: '123456'
      }, {
        timeout: this.timeout,
        validateStatus: () => true,
        withCredentials: true
      });

      if (response.status === 200 && response.data.token) {
        return {
          success: true,
          message: "✅ Login com credenciais padrão funcionando!",
          details: {
            status: response.status,
            hasToken: !!response.data.token,
            hasUser: !!response.data.user,
            userId: response.data.user?.id,
            userProfile: response.data.user?.profile
          }
        };
      } else if (response.status === 401) {
        return {
          success: false,
          message: "❌ Credenciais padrão inválidas - usuário pode não existir",
          details: {
            status: response.status,
            error: response.data,
            suggestion: "Execute as migrações e seeding no banco de dados"
          }
        };
      } else {
        return {
          success: false,
          message: `❌ Login falhou com status ${response.status}`,
          details: {
            status: response.status,
            response: response.data
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "❌ Erro ao tentar fazer login",
        details: {
          error: error.message,
          suggestion: "Verifique conectividade e configuração do backend"
        }
      };
    }
  }

  /**
   * Teste 5: Verificar CORS
   */
  async testarCORS() {
    try {
      console.log(`🌐 Testando configuração CORS`);
      
      const response = await axios.options(`${this.backendUrl}/auth/login`, {
        timeout: this.timeout,
        headers: {
          'Origin': this.frontendUrl,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        },
        validateStatus: () => true
      });

      const corsHeaders = {
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-methods': response.headers['access-control-allow-methods'],
        'access-control-allow-credentials': response.headers['access-control-allow-credentials']
      };

      const allowsOrigin = corsHeaders['access-control-allow-origin'] === this.frontendUrl || 
                          corsHeaders['access-control-allow-origin'] === '*';

      return {
        success: allowsOrigin,
        message: allowsOrigin ? "✅ CORS configurado corretamente" : "❌ CORS pode estar mal configurado",
        details: {
          corsHeaders,
          frontendUrl: this.frontendUrl,
          allowsCredentials: corsHeaders['access-control-allow-credentials'] === 'true'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "❌ Erro ao testar CORS",
        details: {
          error: error.message
        }
      };
    }
  }

  /**
   * Executar diagnóstico completo
   */
  async executarDiagnostico() {
    console.log("🔍 Diagnóstico de Produção - Easypanel\n");
    console.log("URLs sendo testadas:");
    console.log(`  Frontend: ${this.frontendUrl}`);
    console.log(`  Backend:  ${this.backendUrl}\n`);

    const testes = [
      { nome: "Frontend Acessível", metodo: () => this.testarFrontend() },
      { nome: "Backend Acessível", metodo: () => this.testarBackend() },
      { nome: "Endpoint de Login", metodo: () => this.testarEndpointLogin() },
      { nome: "CORS Configuration", metodo: () => this.testarCORS() },
      { nome: "Login Credenciais Padrão", metodo: () => this.testarLoginPadrao() }
    ];

    const resultados = [];

    for (let i = 0; i < testes.length; i++) {
      const teste = testes[i];
      console.log(`${i + 1}. ${teste.nome}:`);
      
      try {
        const resultado = await teste.metodo();
        console.log(`   ${resultado.message}`);
        if (resultado.details) {
          console.log(`   Detalhes:`, JSON.stringify(resultado.details, null, 2));
        }
        resultados.push(resultado);
      } catch (error) {
        const resultado = {
          success: false,
          message: `❌ Erro no teste: ${error.message}`,
          details: { error: error.message }
        };
        console.log(`   ${resultado.message}`);
        resultados.push(resultado);
      }
      
      console.log();
    }

    // Resumo
    const sucessos = resultados.filter(r => r.success).length;
    const total = resultados.length;

    console.log("📊 Resumo do Diagnóstico:");
    console.log(`   Testes passaram: ${sucessos}/${total}`);
    
    if (sucessos === total) {
      console.log("   🎉 Todos os testes passaram! O sistema deveria estar funcionando.");
      console.log("   📧 Tente fazer login com: admin@admin.com");
      console.log("   🔑 Senha: 123456");
    } else {
      console.log("   ⚠️ Alguns testes falharam. Recomendações:");
      
      resultados.forEach((resultado, index) => {
        if (!resultado.success && resultado.details?.suggestion) {
          console.log(`   • Teste ${index + 1}: ${resultado.details.suggestion}`);
        }
      });

      console.log("\n   🔧 Ações recomendadas:");
      console.log("   1. Verifique se todos os serviços estão rodando no Easypanel");
      console.log("   2. Confirme as variáveis de ambiente (URLs, banco, etc.)");
      console.log("   3. Execute migrações do banco: npm run db:migrate && npm run db:seed");
      console.log("   4. Verifique logs dos containers no Easypanel");
    }

    console.log("\n   🌐 URLs para testar manualmente:");
    console.log(`   Frontend: ${this.frontendUrl}`);
    console.log(`   Backend:  ${this.backendUrl}`);
  }
}

// Executar diagnóstico
if (require.main === module) {
  const diagnostico = new DiagnosticoProducao();
  diagnostico.executarDiagnostico().catch(error => {
    console.error('❌ Falha no diagnóstico:', error.message);
    process.exit(1);
  });
}

module.exports = DiagnosticoProducao;
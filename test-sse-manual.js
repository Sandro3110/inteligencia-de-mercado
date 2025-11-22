/**
 * Script de Teste Manual para Sistema de Notificações SSE
 * 
 * Como usar:
 * 1. Faça login no sistema: https://3000-izrmelqgbgh8w93e231so-6564cc02.manus.computer
 * 2. Abra o DevTools (F12)
 * 3. Cole este script no Console
 * 4. Execute: await testSSENotifications()
 */

async function testSSENotifications() {
  console.log("🚀 Iniciando testes de SSE...\n");

  // Teste 1: Verificar autenticação
  console.log("📋 Teste 1: Verificando autenticação...");
  try {
    const authResponse = await fetch("/api/trpc/auth.me", {
      credentials: "include",
    });
    const authData = await authResponse.json();
    const user = authData.result?.data?.json;
    
    if (user) {
      console.log("✅ Usuário autenticado:", user.name, `(${user.id})`);
    } else {
      console.error("❌ Não autenticado! Faça login primeiro.");
      return;
    }
  } catch (error) {
    console.error("❌ Erro ao verificar autenticação:", error);
    return;
  }

  // Teste 2: Testar endpoint SSE sem autenticação
  console.log("\n📋 Teste 2: Testando rejeição sem autenticação...");
  try {
    const noAuthResponse = await fetch("/api/notifications/stream", {
      credentials: "omit", // Não enviar cookies
    });
    
    if (noAuthResponse.status === 401) {
      console.log("✅ Endpoint rejeitou corretamente requisição sem auth (401)");
    } else {
      console.warn("⚠️ Endpoint deveria retornar 401, retornou:", noAuthResponse.status);
    }
  } catch (error) {
    console.error("❌ Erro ao testar sem auth:", error);
  }

  // Teste 3: Conectar ao SSE com autenticação
  console.log("\n📋 Teste 3: Conectando ao stream SSE...");
  const eventSource = new EventSource("/api/notifications/stream");
  let heartbeatCount = 0;
  let notificationCount = 0;

  eventSource.onopen = () => {
    console.log("✅ Conexão SSE estabelecida!");
  };

  eventSource.onerror = (error) => {
    console.error("❌ Erro na conexão SSE:", error);
    eventSource.close();
  };

  eventSource.addEventListener("heartbeat", () => {
    heartbeatCount++;
    console.log(`💓 Heartbeat recebido (${heartbeatCount})`);
  });

  eventSource.addEventListener("notification", (event) => {
    notificationCount++;
    const notification = JSON.parse(event.data);
    console.log(`🔔 Notificação ${notificationCount} recebida:`, notification);
  });

  // Teste 4: Criar notificação de teste
  console.log("\n📋 Teste 4: Criando notificação de teste...");
  setTimeout(async () => {
    try {
      const createResponse = await fetch("/api/trpc/notifications.create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: "Teste SSE Manual",
          content: `Notificação criada em ${new Date().toLocaleString()}`,
          type: "info",
        }),
      });

      const createData = await createResponse.json();
      const notification = createData.result?.data?.json;
      
      if (notification) {
        console.log("✅ Notificação criada:", notification.id);
        console.log("⏳ Aguardando recebimento via SSE...");
      } else {
        console.error("❌ Erro ao criar notificação:", createData);
      }
    } catch (error) {
      console.error("❌ Erro ao criar notificação:", error);
    }
  }, 2000);

  // Teste 5: Verificar notificações não lidas
  setTimeout(async () => {
    console.log("\n📋 Teste 5: Listando notificações não lidas...");
    try {
      const unreadResponse = await fetch("/api/trpc/notifications.getUnread", {
        credentials: "include",
      });
      const unreadData = await unreadResponse.json();
      const unread = unreadData.result?.data?.json || [];
      
      console.log(`✅ Total de notificações não lidas: ${unread.length}`);
      if (unread.length > 0) {
        console.log("Primeiras 3:", unread.slice(0, 3));
      }
    } catch (error) {
      console.error("❌ Erro ao listar não lidas:", error);
    }
  }, 4000);

  // Teste 6: Estatísticas após 10 segundos
  setTimeout(() => {
    console.log("\n📊 Estatísticas após 10 segundos:");
    console.log(`- Heartbeats recebidos: ${heartbeatCount}`);
    console.log(`- Notificações recebidas: ${notificationCount}`);
    
    if (heartbeatCount > 0) {
      console.log("✅ Sistema de heartbeat funcionando!");
    } else {
      console.warn("⚠️ Nenhum heartbeat recebido");
    }

    console.log("\n🏁 Testes concluídos!");
    console.log("💡 Dica: Deixe o console aberto para continuar monitorando eventos SSE");
    console.log("💡 Para fechar a conexão: eventSource.close()");
    
    // Expor eventSource globalmente para controle manual
    window.testEventSource = eventSource;
  }, 10000);

  return "Testes iniciados! Aguarde 10 segundos para ver os resultados...";
}

// Teste rápido de autenticação
async function quickAuthTest() {
  const response = await fetch("/api/trpc/auth.me", { credentials: "include" });
  const data = await response.json();
  const user = data.result?.data?.json;
  
  if (user) {
    console.log("✅ Autenticado como:", user.name);
    return true;
  } else {
    console.log("❌ Não autenticado");
    return false;
  }
}

console.log("📦 Script de teste SSE carregado!");
console.log("📝 Comandos disponíveis:");
console.log("  - await quickAuthTest()         // Verificar autenticação");
console.log("  - await testSSENotifications()  // Executar todos os testes");
console.log("");

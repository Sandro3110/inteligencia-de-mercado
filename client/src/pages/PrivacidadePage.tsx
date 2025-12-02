import { PageHeader } from '@/components/PageHeader';

/**
 * Página de Política de Privacidade
 * LGPD Art. 9 - Transparência no tratamento de dados
 */
export default function PrivacidadePage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <PageHeader
        title="Política de Privacidade"
        description="Como tratamos os dados em nossa plataforma de Inteligência de Mercado"
      />

      <div className="prose prose-slate dark:prose-invert max-w-none mt-8 space-y-8">
        {/* Última atualização */}
        <p className="text-sm text-muted-foreground">
          <strong>Última atualização:</strong> 02 de dezembro de 2025
        </p>

        {/* 1. Introdução */}
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Introdução</h2>
          <p>
            Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos
            os dados em nossa plataforma de Inteligência de Mercado, em conformidade com a{' '}
            <strong>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong>.
          </p>
          <p>
            Nossa plataforma é voltada para <strong>análise de inteligência de mercado B2B</strong>,
            coletando e processando exclusivamente <strong>dados públicos de empresas</strong>.
          </p>
        </section>

        {/* 2. Dados que Coletamos */}
        <section>
          <h2 className="text-2xl font-bold mb-4">2. Dados que Coletamos</h2>
          
          <h3 className="text-xl font-semibold mb-3">2.1. Dados de Empresas (Dados Públicos)</h3>
          <p>Coletamos os seguintes dados públicos de empresas:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>CNPJ</strong> - Cadastro Nacional de Pessoa Jurídica</li>
            <li><strong>Razão Social</strong> - Nome oficial da empresa</li>
            <li><strong>Nome Fantasia</strong> - Nome comercial</li>
            <li><strong>Setor de Atuação</strong> - CNAE e segmento</li>
            <li><strong>Porte</strong> - Micro, pequena, média ou grande empresa</li>
            <li><strong>Endereço Comercial</strong> - Localização da sede</li>
            <li><strong>Situação Cadastral</strong> - Ativa, inativa, suspensa</li>
            <li><strong>Data de Abertura</strong> - Quando a empresa foi fundada</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.2. Dados de Usuários da Plataforma</h3>
          <p>Para usuários que se cadastram em nossa plataforma:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Nome</strong> - Para identificação</li>
            <li><strong>Email</strong> - Para login e comunicação</li>
            <li><strong>Senha</strong> - Criptografada (nunca armazenamos em texto claro)</li>
            <li><strong>Papel/Função</strong> - Admin, Manager, Analyst ou Viewer</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.3. O que NÃO Coletamos</h3>
          <p className="font-semibold text-primary">
            NÃO coletamos dados pessoais de pessoas físicas, incluindo:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>❌ CPF de pessoas físicas</li>
            <li>❌ Email pessoal de funcionários</li>
            <li>❌ Telefone celular pessoal</li>
            <li>❌ Endereço residencial</li>
            <li>❌ Dados sensíveis (raça, religião, saúde, etc)</li>
          </ul>
        </section>

        {/* 3. Fontes dos Dados */}
        <section>
          <h2 className="text-2xl font-bold mb-4">3. Fontes dos Dados</h2>
          <p>Coletamos dados exclusivamente de fontes públicas e legítimas:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Receita Federal do Brasil</strong> - Dados cadastrais de empresas</li>
            <li><strong>Sites Corporativos Oficiais</strong> - Informações públicas</li>
            <li><strong>Portais Governamentais</strong> - Dados abertos</li>
            <li><strong>Diário Oficial</strong> - Publicações legais</li>
            <li><strong>APIs Públicas</strong> - Serviços de dados abertos</li>
          </ul>
          <p className="mt-4 font-semibold">
            NÃO utilizamos dados de vazamentos, scraping não autorizado ou fontes ilegais.
          </p>
        </section>

        {/* 4. Finalidade */}
        <section>
          <h2 className="text-2xl font-bold mb-4">4. Finalidade do Tratamento</h2>
          <p>Utilizamos os dados coletados para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Análise de Inteligência de Mercado</strong> - Identificar tendências e oportunidades</li>
            <li><strong>Pesquisa de Empresas</strong> - Facilitar busca e análise de empresas</li>
            <li><strong>Relatórios e Insights</strong> - Gerar análises dimensionais</li>
            <li><strong>Enriquecimento de Dados</strong> - Complementar informações via IA</li>
            <li><strong>Visualizações</strong> - Criar dashboards e gráficos</li>
          </ul>
          <p className="mt-4 font-semibold text-primary">
            NÃO vendemos dados. NÃO fazemos spam. NÃO compartilhamos com terceiros sem autorização.
          </p>
        </section>

        {/* 5. Base Legal */}
        <section>
          <h2 className="text-2xl font-bold mb-4">5. Base Legal (LGPD)</h2>
          <p>O tratamento de dados é fundamentado em:</p>
          
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="font-semibold">
              <strong>Art. 7, VI da LGPD - Legítimo Interesse</strong>
            </p>
            <p className="text-sm mt-2 italic">
              "O tratamento de dados pessoais somente poderá ser realizado quando necessário para
              atender aos interesses legítimos do controlador ou de terceiro"
            </p>
          </div>

          <p className="mt-4">
            <strong>Justificativa:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Os dados são de natureza pública</li>
            <li>A finalidade é legítima (inteligência de mercado)</li>
            <li>Não prejudica os titulares</li>
            <li>Gera benefício para o mercado e economia</li>
          </ul>
        </section>

        {/* 6. Compartilhamento */}
        <section>
          <h2 className="text-2xl font-bold mb-4">6. Compartilhamento de Dados</h2>
          <p>
            <strong>NÃO vendemos, alugamos ou compartilhamos</strong> dados com terceiros para
            fins comerciais.
          </p>
          <p className="mt-4">Podemos compartilhar dados apenas em casos específicos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Obrigação Legal</strong> - Quando exigido por lei ou ordem judicial</li>
            <li><strong>Proteção de Direitos</strong> - Para defender nossos direitos legais</li>
            <li><strong>Consentimento Expresso</strong> - Com sua autorização prévia</li>
          </ul>
        </section>

        {/* 7. Armazenamento e Segurança */}
        <section>
          <h2 className="text-2xl font-bold mb-4">7. Armazenamento e Segurança</h2>
          
          <h3 className="text-xl font-semibold mb-3">7.1. Medidas de Segurança</h3>
          <p>Implementamos rigorosas medidas de segurança:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Criptografia AES-256-GCM</strong> - Padrão militar para dados sensíveis</li>
            <li><strong>Controle de Acesso (RBAC)</strong> - 4 níveis de permissão</li>
            <li><strong>Rate Limiting</strong> - Proteção contra ataques DDoS</li>
            <li><strong>Auditoria Completa</strong> - Log de todas as ações</li>
            <li><strong>Senhas Hash</strong> - Nunca armazenamos senhas em texto claro</li>
            <li><strong>HTTPS/TLS</strong> - Comunicação criptografada</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">7.2. Prazo de Retenção</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Dados de Empresas:</strong> Mantidos enquanto forem públicos e relevantes</li>
            <li><strong>Dados de Usuários:</strong> Mantidos enquanto a conta estiver ativa</li>
            <li><strong>Logs de Auditoria:</strong> 5 anos (compliance)</li>
          </ul>
        </section>

        {/* 8. Direitos dos Titulares */}
        <section>
          <h2 className="text-2xl font-bold mb-4">8. Seus Direitos (LGPD Art. 18)</h2>
          <p>Você tem os seguintes direitos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Confirmação</strong> - Saber se tratamos seus dados</li>
            <li><strong>Acesso</strong> - Ver quais dados temos sobre você</li>
            <li><strong>Correção</strong> - Corrigir dados incompletos ou incorretos</li>
            <li><strong>Anonimização</strong> - Solicitar anonimização de dados</li>
            <li><strong>Eliminação</strong> - Solicitar exclusão de dados (quando aplicável)</li>
            <li><strong>Oposição</strong> - Opor-se ao tratamento de dados</li>
            <li><strong>Revogação</strong> - Revogar consentimento (quando aplicável)</li>
          </ul>

          <p className="mt-4 font-semibold">
            Para exercer seus direitos, entre em contato com nosso DPO (veja seção 10).
          </p>
        </section>

        {/* 9. Cookies */}
        <section>
          <h2 className="text-2xl font-bold mb-4">9. Cookies e Tecnologias Similares</h2>
          <p>Utilizamos cookies apenas para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Autenticação</strong> - Manter você logado</li>
            <li><strong>Preferências</strong> - Lembrar tema (dark/light mode)</li>
            <li><strong>Analytics</strong> - Melhorar a experiência (anônimo)</li>
          </ul>
          <p className="mt-4">
            Você pode desabilitar cookies nas configurações do navegador, mas isso pode afetar
            funcionalidades da plataforma.
          </p>
        </section>

        {/* 10. Encarregado de Dados (DPO) */}
        <section>
          <h2 className="text-2xl font-bold mb-4">10. Encarregado de Dados (DPO)</h2>
          <div className="bg-primary/10 p-6 rounded-lg">
            <p className="font-semibold text-lg mb-2">Entre em contato conosco:</p>
            <ul className="space-y-2">
              <li><strong>Email:</strong> dpo@inteligenciademercado.com</li>
              <li><strong>Prazo de resposta:</strong> Até 15 dias úteis</li>
            </ul>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Nosso DPO está disponível para esclarecer dúvidas, receber solicitações e atender
            suas demandas relacionadas à proteção de dados.
          </p>
        </section>

        {/* 11. Alterações */}
        <section>
          <h2 className="text-2xl font-bold mb-4">11. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. Quando houver alterações
            significativas, notificaremos você por email ou aviso na plataforma.
          </p>
          <p className="mt-4">
            Recomendamos revisar esta página regularmente para se manter informado.
          </p>
        </section>

        {/* 12. Legislação */}
        <section>
          <h2 className="text-2xl font-bold mb-4">12. Legislação Aplicável</h2>
          <p>
            Esta Política de Privacidade é regida pela legislação brasileira, especialmente:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Lei 13.709/2018</strong> - Lei Geral de Proteção de Dados (LGPD)</li>
            <li><strong>Lei 12.965/2014</strong> - Marco Civil da Internet</li>
            <li><strong>Código de Defesa do Consumidor</strong> - Lei 8.078/1990</li>
          </ul>
        </section>

        {/* Rodapé */}
        <section className="border-t pt-6 mt-8">
          <p className="text-sm text-muted-foreground">
            Ao utilizar nossa plataforma, você concorda com esta Política de Privacidade.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Para dúvidas ou solicitações, entre em contato: <strong>dpo@inteligenciademercado.com</strong>
          </p>
        </section>
      </div>
    </div>
  );
}

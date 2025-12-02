import { PageHeader } from '@/components/PageHeader';

/**
 * Página de Termos de Uso
 * Contrato entre a plataforma e os usuários
 */
export default function TermosPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <PageHeader
        title="Termos de Uso"
        description="Condições para utilização da plataforma de Inteligência de Mercado"
      />

      <div className="prose prose-slate dark:prose-invert max-w-none mt-8 space-y-8">
        {/* Última atualização */}
        <p className="text-sm text-muted-foreground">
          <strong>Última atualização:</strong> 02 de dezembro de 2025
        </p>

        {/* 1. Aceitação dos Termos */}
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar esta plataforma de Inteligência de Mercado, você concorda em
            cumprir e estar vinculado a estes Termos de Uso.
          </p>
          <p className="mt-4">
            <strong>Se você não concorda com estes termos, não utilize a plataforma.</strong>
          </p>
        </section>

        {/* 2. Descrição do Serviço */}
        <section>
          <h2 className="text-2xl font-bold mb-4">2. Descrição do Serviço</h2>
          <p>
            Nossa plataforma oferece ferramentas de <strong>inteligência de mercado B2B</strong>,
            incluindo:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Análise dimensional de empresas</li>
            <li>Pesquisas de mercado</li>
            <li>Importação e enriquecimento de dados</li>
            <li>Visualizações e relatórios</li>
            <li>Análise temporal, geográfica e de mercado</li>
          </ul>
        </section>

        {/* 3. Cadastro e Conta */}
        <section>
          <h2 className="text-2xl font-bold mb-4">3. Cadastro e Conta de Usuário</h2>
          
          <h3 className="text-xl font-semibold mb-3">3.1. Requisitos</h3>
          <p>Para utilizar a plataforma, você deve:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ter capacidade legal para contratar (maior de 18 anos)</li>
            <li>Fornecer informações verdadeiras e atualizadas</li>
            <li>Manter a confidencialidade de sua senha</li>
            <li>Notificar imediatamente sobre uso não autorizado</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.2. Responsabilidade</h3>
          <p>
            Você é responsável por todas as atividades realizadas em sua conta.
          </p>
        </section>

        {/* 4. Uso Permitido */}
        <section>
          <h2 className="text-2xl font-bold mb-4">4. Uso Permitido</h2>
          <p>Você pode utilizar a plataforma para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>✅ Análise de inteligência de mercado</li>
            <li>✅ Pesquisa de empresas e setores</li>
            <li>✅ Geração de relatórios e insights</li>
            <li>✅ Tomada de decisões estratégicas</li>
            <li>✅ Estudos acadêmicos e pesquisas</li>
          </ul>
        </section>

        {/* 5. Uso Proibido */}
        <section>
          <h2 className="text-2xl font-bold mb-4">5. Uso Proibido</h2>
          <p className="font-semibold text-destructive">É estritamente proibido:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>❌ Revender ou redistribuir dados da plataforma</li>
            <li>❌ Utilizar para spam ou marketing não solicitado</li>
            <li>❌ Fazer scraping ou extração automatizada</li>
            <li>❌ Tentar acessar áreas restritas ou contas de terceiros</li>
            <li>❌ Enviar malware, vírus ou código malicioso</li>
            <li>❌ Sobrecarregar a infraestrutura (DDoS)</li>
            <li>❌ Violar direitos de propriedade intelectual</li>
            <li>❌ Utilizar para fins ilegais ou antiéticos</li>
          </ul>
          <p className="mt-4 font-semibold">
            A violação destes termos resultará em suspensão ou cancelamento da conta.
          </p>
        </section>

        {/* 6. Propriedade Intelectual */}
        <section>
          <h2 className="text-2xl font-bold mb-4">6. Propriedade Intelectual</h2>
          
          <h3 className="text-xl font-semibold mb-3">6.1. Nossa Propriedade</h3>
          <p>
            Todo o conteúdo da plataforma (código, design, textos, logos, etc) é de nossa
            propriedade ou licenciado por nós.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.2. Dados Públicos</h3>
          <p>
            Os dados de empresas são de natureza pública, obtidos de fontes legítimas.
            Você pode utilizá-los conforme permitido pela legislação.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.3. Seus Dados</h3>
          <p>
            Você mantém a propriedade dos projetos, pesquisas e análises que criar na plataforma.
          </p>
        </section>

        {/* 7. Limitação de Responsabilidade */}
        <section>
          <h2 className="text-2xl font-bold mb-4">7. Limitação de Responsabilidade</h2>
          
          <h3 className="text-xl font-semibold mb-3">7.1. Disponibilidade</h3>
          <p>
            Não garantimos que a plataforma estará disponível 100% do tempo. Podemos realizar
            manutenções, atualizações ou enfrentar problemas técnicos.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">7.2. Precisão dos Dados</h3>
          <p>
            Embora nos esforcemos para manter dados precisos e atualizados, não garantimos a
            exatidão, completude ou atualidade de todas as informações.
          </p>
          <p className="mt-4 font-semibold">
            Você é responsável por validar os dados antes de tomar decisões importantes.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">7.3. Decisões de Negócio</h3>
          <p>
            Não somos responsáveis por decisões de negócio tomadas com base nos dados da plataforma.
          </p>
        </section>

        {/* 8. Modificações */}
        <section>
          <h2 className="text-2xl font-bold mb-4">8. Modificações na Plataforma</h2>
          <p>
            Reservamo-nos o direito de:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modificar, suspender ou descontinuar funcionalidades</li>
            <li>Atualizar estes Termos de Uso</li>
            <li>Alterar preços ou planos (com aviso prévio)</li>
          </ul>
          <p className="mt-4">
            Mudanças significativas serão comunicadas por email ou aviso na plataforma.
          </p>
        </section>

        {/* 9. Cancelamento */}
        <section>
          <h2 className="text-2xl font-bold mb-4">9. Cancelamento</h2>
          
          <h3 className="text-xl font-semibold mb-3">9.1. Por Você</h3>
          <p>
            Você pode cancelar sua conta a qualquer momento através das configurações.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">9.2. Por Nós</h3>
          <p>
            Podemos suspender ou cancelar sua conta se:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violar estes Termos de Uso</li>
            <li>Utilizar a plataforma de forma abusiva</li>
            <li>Não pagar valores devidos (se aplicável)</li>
            <li>Fornecer informações falsas</li>
          </ul>
        </section>

        {/* 10. Privacidade */}
        <section>
          <h2 className="text-2xl font-bold mb-4">10. Privacidade e Proteção de Dados</h2>
          <p>
            O tratamento de dados pessoais é regido por nossa{' '}
            <a href="/privacidade" className="text-primary hover:underline font-semibold">
              Política de Privacidade
            </a>
            , em conformidade com a LGPD.
          </p>
        </section>

        {/* 11. Legislação */}
        <section>
          <h2 className="text-2xl font-bold mb-4">11. Legislação e Foro</h2>
          <p>
            Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
          </p>
          <p className="mt-4">
            Fica eleito o foro da comarca de <strong>[SUA CIDADE]</strong> para dirimir quaisquer
            controvérsias decorrentes destes termos.
          </p>
        </section>

        {/* 12. Contato */}
        <section>
          <h2 className="text-2xl font-bold mb-4">12. Contato</h2>
          <div className="bg-primary/10 p-6 rounded-lg">
            <p className="font-semibold text-lg mb-2">Dúvidas sobre os Termos de Uso?</p>
            <ul className="space-y-2">
              <li><strong>Email:</strong> contato@inteligenciademercado.com</li>
              <li><strong>DPO (Proteção de Dados):</strong> dpo@inteligenciademercado.com</li>
            </ul>
          </div>
        </section>

        {/* Rodapé */}
        <section className="border-t pt-6 mt-8">
          <p className="text-sm text-muted-foreground">
            Ao utilizar nossa plataforma, você declara ter lido, compreendido e concordado com
            estes Termos de Uso.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Versão 1.0 - Última atualização: 02/12/2025
          </p>
        </section>
      </div>
    </div>
  );
}

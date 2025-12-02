-- ============================================================================
-- POPULAR dim_mercado com segmentos de mercado B2B
-- ============================================================================
-- Execute este SQL diretamente no Supabase SQL Editor
-- https://supabase.com/dashboard/project/ecnzlynmuerbmqingyfl/editor
-- ============================================================================

INSERT INTO dim_mercado (codigo, nome, descricao, tipo, nivel, ativo) VALUES
-- TECNOLOGIA
('TEC001', 'Tecnologia da Informação', 'Desenvolvimento de software, consultoria TI, infraestrutura', 'Tecnologia', 1, true),
('TEC002', 'SaaS', 'Software as a Service - aplicações em nuvem', 'Tecnologia', 2, true),
('TEC003', 'Cibersegurança', 'Segurança da informação, proteção de dados', 'Tecnologia', 2, true),
('TEC004', 'Cloud Computing', 'Computação em nuvem, infraestrutura', 'Tecnologia', 2, true),
('TEC005', 'Inteligência Artificial', 'IA, Machine Learning, automação', 'Tecnologia', 2, true),

-- VAREJO
('VAR001', 'Varejo', 'Comércio varejista em geral', 'Varejo', 1, true),
('VAR002', 'E-commerce', 'Comércio eletrônico, marketplace', 'Varejo', 2, true),
('VAR003', 'Supermercados', 'Redes de supermercados e hipermercados', 'Varejo', 2, true),
('VAR004', 'Farmácias', 'Drogarias e farmácias', 'Varejo', 2, true),
('VAR005', 'Moda e Vestuário', 'Lojas de roupas, calçados, acessórios', 'Varejo', 2, true),

-- SERVIÇOS
('SER001', 'Serviços Profissionais', 'Consultoria, auditoria, assessoria', 'Serviços', 1, true),
('SER002', 'Consultoria Empresarial', 'Consultoria estratégica e gestão', 'Serviços', 2, true),
('SER003', 'Contabilidade', 'Serviços contábeis e fiscais', 'Serviços', 2, true),
('SER004', 'Jurídico', 'Escritórios de advocacia', 'Serviços', 2, true),
('SER005', 'Marketing e Publicidade', 'Agências de marketing, publicidade', 'Serviços', 2, true),

-- INDÚSTRIA
('IND001', 'Indústria', 'Manufatura e produção industrial', 'Indústria', 1, true),
('IND002', 'Alimentos e Bebidas', 'Indústria alimentícia', 'Indústria', 2, true),
('IND003', 'Automotiva', 'Fabricação de veículos e autopeças', 'Indústria', 2, true),
('IND004', 'Química e Petroquímica', 'Produtos químicos, petroquímicos', 'Indústria', 2, true),
('IND005', 'Metalurgia', 'Siderurgia, fundição, usinagem', 'Indústria', 2, true),

-- SAÚDE
('SAU001', 'Saúde', 'Serviços de saúde em geral', 'Saúde', 1, true),
('SAU002', 'Hospitais', 'Hospitais e clínicas', 'Saúde', 2, true),
('SAU003', 'Laboratórios', 'Laboratórios de análises clínicas', 'Saúde', 2, true),
('SAU004', 'Planos de Saúde', 'Operadoras de planos de saúde', 'Saúde', 2, true),
('SAU005', 'Equipamentos Médicos', 'Fabricação e distribuição de equipamentos', 'Saúde', 2, true),

-- EDUCAÇÃO
('EDU001', 'Educação', 'Instituições de ensino', 'Educação', 1, true),
('EDU002', 'Ensino Superior', 'Universidades e faculdades', 'Educação', 2, true),
('EDU003', 'Ensino Técnico', 'Escolas técnicas e profissionalizantes', 'Educação', 2, true),
('EDU004', 'Cursos Livres', 'Cursos de idiomas, informática, etc', 'Educação', 2, true),
('EDU005', 'EdTech', 'Tecnologia educacional, EAD', 'Educação', 2, true),

-- FINANCEIRO
('FIN001', 'Financeiro', 'Serviços financeiros', 'Financeiro', 1, true),
('FIN002', 'Bancos', 'Instituições bancárias', 'Financeiro', 2, true),
('FIN003', 'Fintechs', 'Tecnologia financeira', 'Financeiro', 2, true),
('FIN004', 'Seguros', 'Seguradoras e corretoras', 'Financeiro', 2, true),
('FIN005', 'Investimentos', 'Gestão de investimentos, corretoras', 'Financeiro', 2, true),

-- CONSTRUÇÃO
('CON001', 'Construção Civil', 'Construção e engenharia', 'Construção', 1, true),
('CON002', 'Construtoras', 'Empresas de construção', 'Construção', 2, true),
('CON003', 'Incorporadoras', 'Incorporação imobiliária', 'Construção', 2, true),
('CON004', 'Materiais de Construção', 'Fabricação e distribuição', 'Construção', 2, true),
('CON005', 'Arquitetura', 'Escritórios de arquitetura', 'Construção', 2, true),

-- AGRONEGÓCIO
('AGR001', 'Agronegócio', 'Agricultura e pecuária', 'Agronegócio', 1, true),
('AGR002', 'Agricultura', 'Produção agrícola', 'Agronegócio', 2, true),
('AGR003', 'Pecuária', 'Criação de animais', 'Agronegócio', 2, true),
('AGR004', 'Agroindústria', 'Processamento de produtos agrícolas', 'Agronegócio', 2, true),
('AGR005', 'Insumos Agrícolas', 'Fertilizantes, defensivos, sementes', 'Agronegócio', 2, true),

-- LOGÍSTICA
('LOG001', 'Logística e Transporte', 'Transporte e armazenagem', 'Logística', 1, true),
('LOG002', 'Transportadoras', 'Transporte rodoviário de cargas', 'Logística', 2, true),
('LOG003', 'Armazéns', 'Armazenagem e distribuição', 'Logística', 2, true),
('LOG004', 'Courier', 'Entregas expressas', 'Logística', 2, true),
('LOG005', 'Logística Integrada', 'Operadores logísticos', 'Logística', 2, true)

ON CONFLICT (codigo) DO NOTHING;

-- Verificar resultado
SELECT 
  tipo,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE nivel = 1) as nivel_1,
  COUNT(*) FILTER (WHERE nivel = 2) as nivel_2
FROM dim_mercado
GROUP BY tipo
ORDER BY tipo;

-- Mostrar todos os registros
SELECT * FROM dim_mercado ORDER BY codigo;

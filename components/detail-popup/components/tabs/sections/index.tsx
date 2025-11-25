/**
 * Detail Sections Components
 * All sections for the DetailsTab
 */

'use client';

import {
  Hash,
  FileText,
  Package,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Instagram,
  MapPin,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import MiniMap from '@/components/MiniMap';
import { CLASSES, LABELS, ICON_SIZES } from '../../../constants';
import {
  formatCNPJ,
  formatPhone,
  formatCEP,
  formatCurrency,
  formatNumber,
  formatOrEmpty,
  formatDate,
} from '../../../utils/formatters';
import type {
  BasicInfoSectionProps,
  ContactSectionProps,
  LocationSectionProps,
  ProductsSectionProps,
  FinancialSectionProps,
  ValidationSectionProps,
  QualitySectionProps,
  MetadataSectionProps,
  Cliente,
} from '../../../types';

// ============================================================================
// HELPER COMPONENT
// ============================================================================

interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
      <Icon className={`${ICON_SIZES.MEDIUM} text-slate-500 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

// ============================================================================
// BASIC INFO SECTION
// ============================================================================

export function BasicInfoSection({ item, type }: BasicInfoSectionProps) {
  const cnpj = (item as Cliente).cnpj;
  const cnae = (item as { cnae?: string | null }).cnae;
  const porte = (item as { porte?: string | null }).porte;
  const setor = (item as { setor?: string | null }).setor;
  const tipo = (item as { tipo?: string | null }).tipo;

  if (!cnpj && !cnae && !porte && !setor && !tipo) return null;

  return (
    <>
      <div>
        <h3 className={CLASSES.SECTION_TITLE}>
          <Hash className={`${ICON_SIZES.MEDIUM} text-blue-600`} />
          {LABELS.BASIC_INFO}
        </h3>
        <div className={CLASSES.GRID_2_COLS}>
          {cnpj && <InfoCard icon={Hash} label={LABELS.CNPJ} value={formatCNPJ(cnpj)} />}
          {cnae && <InfoCard icon={FileText} label="CNAE" value={cnae} />}
          {porte && <InfoCard icon={Package} label={LABELS.PORTE} value={porte} />}
          {setor && <InfoCard icon={Briefcase} label={LABELS.SETOR} value={setor} />}
          {tipo && <InfoCard icon={Building2} label="Tipo" value={tipo} />}
        </div>
      </div>
      <Separator />
    </>
  );
}

// ============================================================================
// CONTACT SECTION
// ============================================================================

export function ContactSection({ item }: ContactSectionProps) {
  const email = (item as Cliente).email;
  const telefone = (item as Cliente).telefone;
  const celular = (item as { celular?: string | null }).celular;
  const website = (item as { website?: string | null }).website;
  const linkedin = (item as Cliente).linkedin;
  const instagram = (item as { instagram?: string | null }).instagram;

  if (!email && !telefone && !celular && !website && !linkedin && !instagram) return null;

  return (
    <>
      <div>
        <h3 className={CLASSES.SECTION_TITLE}>
          <Mail className={`${ICON_SIZES.MEDIUM} text-blue-600`} />
          {LABELS.CONTACT}
        </h3>
        <div className={CLASSES.GRID_2_COLS}>
          {email && <InfoCard icon={Mail} label={LABELS.EMAIL} value={email} />}
          {telefone && <InfoCard icon={Phone} label={LABELS.TELEFONE} value={formatPhone(telefone)} />}
          {celular && <InfoCard icon={Phone} label={LABELS.CELULAR} value={formatPhone(celular)} />}
          {website && <InfoCard icon={Globe} label={LABELS.WEBSITE} value={website} />}
          {linkedin && <InfoCard icon={Linkedin} label={LABELS.LINKEDIN} value={linkedin} />}
          {instagram && <InfoCard icon={Instagram} label={LABELS.INSTAGRAM} value={instagram} />}
        </div>
      </div>
      <Separator />
    </>
  );
}

// ============================================================================
// LOCATION SECTION
// ============================================================================

export function LocationSection({ item }: LocationSectionProps) {
  const endereco = (item as { endereco?: string | null }).endereco;
  const cidade = (item as { cidade?: string | null }).cidade;
  const estado = (item as { estado?: string | null }).estado;
  const cep = (item as { cep?: string | null }).cep;
  const pais = (item as { pais?: string | null }).pais;
  const latitude = (item as { latitude?: number | null }).latitude;
  const longitude = (item as { longitude?: number | null }).longitude;

  const hasLocation = endereco || cidade || estado || cep || pais;
  const hasCoordinates = latitude && longitude;

  if (!hasLocation && !hasCoordinates) return null;

  return (
    <>
      <div>
        <h3 className={CLASSES.SECTION_TITLE}>
          <MapPin className={`${ICON_SIZES.MEDIUM} text-blue-600`} />
          {LABELS.LOCATION}
        </h3>
        {hasLocation && (
          <div className={CLASSES.GRID_2_COLS}>
            {endereco && <InfoCard icon={MapPin} label={LABELS.ENDERECO} value={endereco} />}
            {cidade && <InfoCard icon={MapPin} label={LABELS.CIDADE} value={cidade} />}
            {estado && <InfoCard icon={MapPin} label={LABELS.ESTADO} value={estado} />}
            {cep && <InfoCard icon={MapPin} label={LABELS.CEP} value={formatCEP(cep)} />}
            {pais && <InfoCard icon={MapPin} label={LABELS.PAIS} value={pais} />}
          </div>
        )}
        {hasCoordinates && (
          <div className="mt-4">
            <MiniMap latitude={latitude} longitude={longitude} />
          </div>
        )}
      </div>
      <Separator />
    </>
  );
}

// ============================================================================
// PRODUCTS SECTION
// ============================================================================

export function ProductsSection({ item }: ProductsSectionProps) {
  const descricao = (item as { descricao?: string | null }).descricao;

  if (!descricao) return null;

  return (
    <>
      <div>
        <h3 className={CLASSES.SECTION_TITLE}>
          <Package className={`${ICON_SIZES.MEDIUM} text-blue-600`} />
          {LABELS.PRODUCTS_SERVICES}
        </h3>
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{descricao}</p>
        </div>
      </div>
      <Separator />
    </>
  );
}

// ============================================================================
// FINANCIAL SECTION
// ============================================================================

export function FinancialSection({ item }: FinancialSectionProps) {
  const faturamento = (item as { faturamento?: string | number | null }).faturamento;
  const numeroFuncionarios = (item as { numeroFuncionarios?: number | null }).numeroFuncionarios;

  if (!faturamento && !numeroFuncionarios) return null;

  return (
    <>
      <div>
        <h3 className={CLASSES.SECTION_TITLE}>
          <DollarSign className={`${ICON_SIZES.MEDIUM} text-blue-600`} />
          {LABELS.FINANCIAL}
        </h3>
        <div className={CLASSES.GRID_2_COLS}>
          {faturamento && (
            <InfoCard
              icon={DollarSign}
              label={LABELS.FATURAMENTO}
              value={formatCurrency(typeof faturamento === 'string' ? parseFloat(faturamento) : faturamento as number)}
            />
          )}
          {numeroFuncionarios && (
            <InfoCard
              icon={Users}
              label={LABELS.FUNCIONARIOS}
              value={formatNumber(numeroFuncionarios)}
            />
          )}
        </div>
      </div>
      <Separator />
    </>
  );
}

// ============================================================================
// VALIDATION SECTION
// ============================================================================

export function ValidationSection({ item }: ValidationSectionProps) {
  const observacoes = (item as { observacoes?: string | null }).observacoes;

  if (!observacoes) return null;

  return (
    <>
      <div>
        <h3 className={CLASSES.SECTION_TITLE}>
          <CheckCircle2 className={`${ICON_SIZES.MEDIUM} text-blue-600`} />
          {LABELS.VALIDATION}
        </h3>
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{observacoes}</p>
        </div>
      </div>
      <Separator />
    </>
  );
}

// ============================================================================
// QUALITY SECTION
// ============================================================================

export function QualitySection({ item }: QualitySectionProps) {
  const qualidadeScore = item.qualidadeScore;

  if (qualidadeScore === undefined || qualidadeScore === null) return null;

  return (
    <>
      <div>
        <h3 className={CLASSES.SECTION_TITLE}>
          <CheckCircle2 className={`${ICON_SIZES.MEDIUM} text-blue-600`} />
          {LABELS.QUALITY}
        </h3>
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-700">Score de Qualidade</span>
            <span className="text-2xl font-bold text-blue-600">{qualidadeScore}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${qualidadeScore}%` }}
            />
          </div>
        </div>
      </div>
      <Separator />
    </>
  );
}

// ============================================================================
// METADATA SECTION
// ============================================================================

export function MetadataSection({ item }: MetadataSectionProps) {
  const createdAt = item.createdAt;
  const updatedAt = (item as { updatedAt?: string | null }).updatedAt;

  if (!createdAt && !updatedAt) return null;

  return (
    <div>
      <h3 className={CLASSES.SECTION_TITLE}>
        <Clock className={`${ICON_SIZES.MEDIUM} text-blue-600`} />
        {LABELS.METADATA}
      </h3>
      <div className={CLASSES.GRID_2_COLS}>
        {createdAt && (
          <InfoCard icon={Calendar} label={LABELS.CREATED_AT} value={formatDate(createdAt)} />
        )}
        {updatedAt && (
          <InfoCard icon={Calendar} label={LABELS.UPDATED_AT} value={formatDate(updatedAt)} />
        )}
      </div>
    </div>
  );
}

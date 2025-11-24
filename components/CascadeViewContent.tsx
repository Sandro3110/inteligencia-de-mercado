'use client';

import { useState, useEffect, useRef } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { motion, AnimatePresence } from "framer-motion";
import {
  pageVariants,
  pageTransition,
  listVariants,
  listItemVariants,
} from "@/lib/animations";
import {
  calculateQualityScore,
  classifyQuality,
  isValidCNPJFormat,
  isValidEmailFormat,
} from "@shared/qualityScore";
import { trpc } from "@/lib/trpc/client";
import { DetailPopup } from "@/components/DetailPopup";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
import { TagManager } from "@/components/TagManager";
import { EntityTagPicker } from "@/components/EntityTagPicker";
import { TagFilter } from "@/components/TagFilter";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import {
  SearchFieldSelector,
  SearchField,
} from "@/components/SearchFieldSelector";
import { SaveFilterDialog } from "@/components/SaveFilterDialog";
import { SavedFilters } from "@/components/SavedFilters";
import {
  SkeletonMercado,
  SkeletonCliente,
  SkeletonConcorrente,
  SkeletonLead,
} from "@/components/SkeletonLoading";
import { MercadoAccordionCard } from "@/components/MercadoAccordionCard";
import { CompararMercadosModal } from "@/components/CompararMercadosModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Building2,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  Download,
  ArrowUp,
  AlertTriangle,
  MapPin,
  Briefcase,
  Package,
  Save,
  FileText,
  FileSpreadsheet,
  FileDown,
  List,
  GitCompare,
  History,
} from "lucide-react";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  ExportData,
} from "@/lib/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import KanbanBoard from "@/components/KanbanBoard";
import { LayoutList, LayoutGrid, BarChart3, FilterX } from "lucide-react";
import { Link } from "wouter";
import SearchHistory, { addToSearchHistory } from "@/components/SearchHistory";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { useSelectedPesquisa } from "@/hooks/useSelectedPesquisa";
import { ProjectSelector } from "@/components/ProjectSelector";
import { PesquisaSelector } from "@/components/PesquisaSelector";
import DraftRecoveryModal from "@/components/DraftRecoveryModal";

type StatusFilter = "all" | "pending" | "rich" | "discarded";
type Page = "mercados" | "clientes" | "concorrentes" | "leads";
type ValidationStatus = "pending" | "rich" | "needs_adjustment" | "discarded";
type ViewMode = "list" | "kanban";

interface CascadeViewContentProps {
  showHeader?: boolean;
  showSidebar?: boolean;
}

/**
 * Componente extraído do CascadeView original
 * Mantém toda a lógica e UI, mas pode ser usado sem header/sidebar
 */
export default function CascadeViewContent({
  showHeader = true,
  showSidebar = false,
}: CascadeViewContentProps) {
  // Todo o conteúdo do CascadeView será copiado aqui
  // Por enquanto, vamos importar o CascadeView original

  return (
    <div className="h-full w-full">
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Conteúdo do CascadeView será migrado aqui...
        </p>
      </div>
    </div>
  );
}

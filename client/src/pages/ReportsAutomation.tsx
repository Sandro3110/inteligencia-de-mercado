/**
 * Relatórios e Automação Unificado
 * Fusão de: ReportsPage + SchedulePage + ReportSchedules
 *
 * Abas disponíveis:
 * - Relatórios: Geração manual de relatórios PDF
 * - Agendamentos: Agendamento de pesquisas automáticas
 * - Automação: Agendamento de relatórios recorrentes
 */

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calendar, Zap } from "lucide-react";
import { ReportGenerator } from "@/components/ReportGenerator";
import { ScheduleTab } from "@/components/reports/ScheduleTab";
import { AutomationTab } from "@/components/reports/AutomationTab";

export default function ReportsAutomation() {
  const [activeTab, setActiveTab] = useState("reports");

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Automação</h1>
          <p className="text-muted-foreground mt-1">
            Gere relatórios, agende pesquisas e configure automações
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="schedules" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Agendamentos</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Automação</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <ReportGenerator />
          </TabsContent>

          <TabsContent value="schedules" className="space-y-6">
            <ScheduleTab />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <AutomationTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

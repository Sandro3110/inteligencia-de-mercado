/**
 * Gestão de Projetos Unificada
 * Fusão de: ProjectManagement + ProjectActivityDashboard + AtividadePage
 *
 * Abas disponíveis:
 * - Projetos: Gerenciamento completo de projetos
 * - Atividades: Dashboard de atividade e inatividade
 * - Logs: Registro de atividades do sistema
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, Activity, FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProjectsTab } from "@/components/projects/ProjectsTab";
import { ActivityTab } from "@/components/projects/ActivityTab";
import { LogsTab } from "@/components/projects/LogsTab";

export default function ProjectManagement() {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Gestão de Projetos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus projetos, monitore atividades e visualize logs do
            sistema
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="projects" className="gap-2">
              <Folder className="w-4 h-4" />
              <span className="hidden sm:inline">Projetos</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Atividades</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <ProjectsTab />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityTab />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <LogsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

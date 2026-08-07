import { useState } from "react";
import { CalendarRange, Sparkles } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import DocumentList from "../components/dashboard/DocumentList";
import StudyPlanner from "../components/dashboard/StudyPlanner";
import { type DocumentItem } from "../api/document.api";

export default function PlannerPage() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [refreshKey] = useState(0);

  const handleDocumentSelect = (doc: DocumentItem) => {
    setSelectedDocument(doc);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-600/10 p-2.5 text-amber-400 ring-1 ring-amber-500/20">
              <CalendarRange size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Study Planner & Roadmap</h1>
              <p className="text-xs text-zinc-400">
                Generate personalized 1-Day Exam Cram schedules, 7-Day Sprints, and 4-Week Mastery Curriculums.
              </p>
            </div>
          </div>

          {selectedDocument && (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs text-zinc-300">
              <Sparkles size={14} className="text-amber-400" />
              <span>Target: <strong className="text-white">{selectedDocument.title}</strong></span>
            </div>
          )}
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-12">
          {/* Document Picker Sidebar */}
          <div className="2xl:col-span-4">
            <DocumentList
              refreshKey={refreshKey}
              selectedDocument={selectedDocument}
              onSelect={handleDocumentSelect}
            />
          </div>

          {/* Main Study Planner Canvas */}
          <div className="2xl:col-span-8">
            <StudyPlanner document={selectedDocument} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

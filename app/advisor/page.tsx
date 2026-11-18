import { ChatBox } from '@/components/ChatBox';
import { FileText, Shield, Sparkles, Eye } from 'lucide-react';

export default function AdvisorPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="mb-6 sm:mb-8 space-y-3">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Admissions Counseling</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Medical School Advisor</h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Get personalized guidance on school selection, application strategies, MCAT preparation,
          and holistic profile evaluation. Upload your transcript or score report to receive an
          in-depth analysis.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-card text-card-foreground shadow-xs">
            <FileText className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold">PDF Transcript Analysis</p>
              <p className="text-[11px] text-muted-foreground">
                In-memory parsing of coursework, GPA trends, and prerequisites.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-card text-card-foreground shadow-xs">
            <Eye className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Vision Model Enabled</p>
              <p className="text-[11px] text-muted-foreground">
                Reads PNG &amp; JPG screenshots of MCAT score breakdowns and CVs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-card text-card-foreground shadow-xs">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold">100% Private &amp; Ephemeral</p>
              <p className="text-[11px] text-muted-foreground">
                No uploads are ever saved to any database or external cloud storage.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ChatBox />
    </div>
  );
}

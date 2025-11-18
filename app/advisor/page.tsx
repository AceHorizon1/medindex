import { ChatBox } from '@/components/ChatBox';

export default function AdvisorPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Medical School Advisor</h1>
        <p className="text-muted-foreground">
          Get personalized guidance on medical school selection, application strategies, MCAT
          preparation, and more. Our AI advisor is trained to help pre-med students make informed
          decisions.
        </p>
      </div>

      <ChatBox
        systemPrompt="You are an experienced medical school admissions advisor with deep knowledge of MD and DO programs, application processes, MCAT preparation, and pre-medical education. Provide helpful, accurate, and encouraging guidance. Be concise but thorough, and always prioritize the student's best interests."
      />
    </div>
  );
}


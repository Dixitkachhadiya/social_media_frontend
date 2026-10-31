import { useSearchParams } from 'react-router-dom';
import { FileText, PenLine, ShieldCheck, Wand2 } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Tabs from '../../components/common/Tabs';
import GenerateTool from './GenerateTool';
import ImproveTool from './ImproveTool';
import SummarizeTool from './SummarizeTool';
import TextSummaryTool from './TextSummaryTool';
import ModerationTool from './ModerationTool';

const TOOLS = [
  { value: 'generate', label: 'Generate', icon: PenLine, description: 'Turn a topic into a ready-to-edit post.' },
  { value: 'improve', label: 'Improve', icon: Wand2, description: 'Fix grammar and readability while keeping your meaning.' },
  { value: 'summarize', label: 'Summarize', icon: FileText, description: 'Shorten your text, or get the gist of a post and its comments.' },
  { value: 'moderate', label: 'Check content', icon: ShieldCheck, description: 'Check text for vulgar, abusive, hateful or threatening language, and get a respectful alternative.' },
];

const SUMMARY_MODES = [
  { value: 'text', label: 'Text' },
  { value: 'discussion', label: 'Post discussion' },
];

// All requests go through the backend (/api/ai/*); the frontend never sees an AI key
export default function AIAssistantPage() {
  useDocumentTitle('AI Assistant');
  const [params, setParams] = useSearchParams();
  const tab = TOOLS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'generate';
  const active = TOOLS.find((t) => t.value === tab);
  // A post link (?post=<id>) opens the discussion summary; otherwise text summaries are the default
  const summaryMode = params.get('mode') === 'discussion' || params.get('post') ? 'discussion' : 'text';

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">AI Content Assistant</h2>
          <p className="text-sm text-muted">{active.description} Nothing is posted until you publish it yourself.</p>
        </div>
        <Tabs label="AI tools" value={tab} onChange={(value) => setParams({ tab: value })} options={TOOLS} />
      </div>

      {tab === 'generate' && <GenerateTool />}
      {tab === 'improve' && <ImproveTool />}
      {tab === 'summarize' && (
        <>
          <Tabs label="What to summarize" value={summaryMode} onChange={(mode) => setParams({ tab: 'summarize', mode })} options={SUMMARY_MODES} />
          {summaryMode === 'text' ? <TextSummaryTool /> : <SummarizeTool initialPostId={params.get('post')} />}
        </>
      )}
      {tab === 'moderate' && <ModerationTool />}

      <p className="text-center text-xs text-muted">
        AI can make mistakes. Read the text before publishing. All AI features run on the Ollama model configured on our server;
        every post and comment is checked again when it is saved.
      </p>
    </div>
  );
}

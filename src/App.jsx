import { useRouter } from "./hooks/useRouter";
import Dashboard from "./components/Dashboard";
import Editor from "./components/Editor";

export default function App() {
  const { page, flowId } = useRouter();
  if (page === "editor" && flowId) return <Editor key={flowId} flowId={flowId} />;
  return <Dashboard />;
}

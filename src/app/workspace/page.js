import { ToastProvider } from "@/components/ui/Toast";
import WorkspaceApp from "@/components/workspace/WorkspaceApp";
import { PROJECT } from "@/data/project";

export const metadata = { title: "Workspace" };

export default function WorkspacePage() {
  return (
    <ToastProvider>
      <WorkspaceApp project={PROJECT} />
    </ToastProvider>
  );
}

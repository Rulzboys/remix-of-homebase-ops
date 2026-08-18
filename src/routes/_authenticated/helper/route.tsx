import { createFileRoute } from "@tanstack/react-router";

import { RoleLayout } from "@/components/RoleLayout";

export const Route = createFileRoute("/_authenticated/helper")({
  component: () => <RoleLayout role="helper" />,
});

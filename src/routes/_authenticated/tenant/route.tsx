import { createFileRoute } from "@tanstack/react-router";

import { RoleLayout } from "@/components/RoleLayout";

export const Route = createFileRoute("/_authenticated/tenant")({
  component: () => <RoleLayout role="tenant" />,
});

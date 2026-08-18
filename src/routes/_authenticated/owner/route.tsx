import { createFileRoute } from "@tanstack/react-router";

import { RoleLayout } from "@/components/RoleLayout";

export const Route = createFileRoute("/_authenticated/owner")({
  component: () => <RoleLayout role="owner" />,
});

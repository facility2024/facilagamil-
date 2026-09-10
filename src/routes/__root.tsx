import { createFileRoute, Outlet } from "@tanstack/react-router";

function RootLayout() {
  return <Outlet />;
}

export const Route = createFileRoute("/__root")({
  component: RootLayout,
});

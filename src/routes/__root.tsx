import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

function RootLayout() {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Facility Email Marketing</title>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
}

export const Route = createFileRoute("/__root")({
  component: RootLayout,
});

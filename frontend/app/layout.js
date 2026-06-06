import "./globals.css";

export const metadata = {
  title: "Hospital Operations Dashboard",
  description:
    "Multi-page hospital dashboard for admissions, room occupancy, doctor coverage, and staff attendance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Hospital Management System" />
      </head>
      <body className="app-body">{children}</body>
    </html>
  );
}

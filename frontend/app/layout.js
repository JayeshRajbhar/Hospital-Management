import "./globals.css";

export const metadata = {
  title: "Hospital Operations Dashboard",
  description:
    "Multi-page hospital dashboard for admissions, room occupancy, doctor coverage, and staff attendance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-body">{children}</body>
    </html>
  );
}

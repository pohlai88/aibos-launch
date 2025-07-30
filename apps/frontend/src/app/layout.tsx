import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI-BOS Platform',
    description: 'Manifest-Driven, Lean Architecture SaaS Platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

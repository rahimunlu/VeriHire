
'use client';

// This page is obsolete and is no longer part of the main user flow.
// It is kept to prevent build errors from broken links but should not be accessed directly.
export default function ObsoletePage() {
  return (
    <div className="p-4 text-center">
      <h1 className="text-lg font-semibold">Page Not Found</h1>
      <p className="text-muted-foreground">This step is no longer in use.</p>
    </div>
  );
}

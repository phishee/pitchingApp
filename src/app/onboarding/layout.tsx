// app/onboarding/layout.tsx
export default function OnboardingLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="h-screen bg-red-500">
        {children}
      </div>
    );
  }
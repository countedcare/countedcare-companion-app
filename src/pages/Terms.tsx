import { useEffect } from "react";

const Terms = () => {
  useEffect(() => {
    // Redirect to external Terms page
    window.location.href = "https://countedcare.com/terms-and-conditions";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to Terms & Conditions...</p>
      </div>
    </div>
  );
};

export default Terms;
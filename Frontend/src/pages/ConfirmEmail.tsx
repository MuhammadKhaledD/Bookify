/**
 * ConfirmEmail.tsx
 * 
 * Email confirmation page:
 * - Extracts token from URL query parameters
 * - Confirms email with backend API
 * - Stores access token and redirects to home
 * 
 * Handles email verification flow after user registration
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ResendConfirmationDialog } from "@/components/ResendConfirmationDialog";
import api from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [resendDialogOpen, setResendDialogOpen] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      // Extract token from URL query parameters
      const token = searchParams.get("token");
      const userId = searchParams.get("userId");

      if (!token) {
        setStatus("error");
        setErrorMessage("Invalid confirmation link. Token is missing.");
        return;
      }

      try {
        // Call the confirm-email endpoint without cookies (token in body is enough)
        const response = await api.post("/auth/confirm-email", {
          token,
        });

        // Store the access token and user in Redux
        const accessToken = response.data.accessToken || response.data.access_token;
        if (accessToken) {
          dispatch(setCredentials({
            accessToken: accessToken,
            user: response.data.user,
          }));
        }

        setStatus("success");
        toast({
          title: "Email confirmed!",
          description: "Your account has been successfully activated.",
        });

        // Redirect to home page after a short delay (user is now logged in)
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } catch (error: any) {
        setStatus("error");
        const errorMsg = error.response?.data?.message || error.message || "Failed to confirm email. The link may have expired.";
        setErrorMessage(errorMsg);
        toast({
          title: "Confirmation failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              </div>
              <CardTitle className="text-3xl">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Confirming Email
                </span>
              </CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-3xl">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Email Confirmed!
                </span>
              </CardTitle>
              <CardDescription>
                Your account has been successfully activated.
              </CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-destructive/10">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-3xl">
                <span className="bg-gradient-to-r from-destructive to-destructive/80 bg-clip-text text-transparent">
                  Confirmation Failed
                </span>
              </CardTitle>
              <CardDescription>
                {errorMessage}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <p className="text-sm text-muted-foreground text-center">
              Redirecting you to the home page...
            </p>
          )}

          {status === "error" && (
            <>
              <p className="text-sm text-muted-foreground text-center">
                The confirmation link may have expired or is invalid.
                Please try resending the confirmation email.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setResendDialogOpen(true)}
                >
                  Resend Email
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  Go Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Resend Confirmation Dialog */}
      <ResendConfirmationDialog
        open={resendDialogOpen}
        onOpenChange={setResendDialogOpen}
      />
    </div>
  );
}


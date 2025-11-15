import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_TITLE, APP_LOGO } from "@/const";

export function LoginPage() {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: signupUsername, 
          password: signupPassword,
          name: signupName 
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Signup failed");
      }

      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2">
            {APP_LOGO && APP_LOGO !== "https://placehold.co/128x128/E1E7EF/1F2937?text=App" && (
              <div className="flex justify-center mb-2">
                <img src={APP_LOGO} alt="Logo" className="h-12 w-12 rounded-lg" />
              </div>
            )}
            <CardTitle className="text-3xl font-bold">{APP_TITLE}</CardTitle>
            <CardDescription>Manage your crochet projects</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="login-username" className="text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <Input
                      id="login-username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Enter your username"
                      disabled={loading}
                      autoFocus
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={loading}
                      className="h-10"
                    />
                  </div>
                  <Button type="submit" className="w-full h-10 text-base" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Demo Credentials:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><span className="font-medium">Username:</span> <code className="bg-white px-2 py-1 rounded">admin</code></p>
                    <p><span className="font-medium">Password:</span> <code className="bg-white px-2 py-1 rounded">admin123</code></p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input
                      id="signup-name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                      autoFocus
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-username" className="text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <Input
                      id="signup-username"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="Choose a username"
                      disabled={loading}
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500">At least 3 characters</p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Choose a password"
                      disabled={loading}
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500">At least 6 characters</p>
                  </div>
                  <Button type="submit" className="w-full h-10 text-base" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>

                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-gray-600">
                    👉 <span className="font-medium">Tip:</span> You'll be automatically logged in after creating an account.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

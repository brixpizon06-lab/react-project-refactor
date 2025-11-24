import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Users, BarChart3, Clock, Mail, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple demo authentication
    setTimeout(() => {
      if (email && password) {
        const userRole = email.includes("admin") ? "admin" : "student";
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userEmail", email);
        
        toast({
          title: "Login successful!",
          description: `Welcome back, ${userRole}!`,
        });
        
        navigate(userRole === "admin" ? "/admin" : "/student");
      } else {
        toast({
          title: "Login failed",
          description: "Please enter valid credentials",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/50 p-5">
      <div className="flex w-full max-w-5xl h-[600px] bg-card rounded-[20px] shadow-elegant overflow-hidden">
        {/* Left Side - Red Gradient */}
        <div className="flex-[1.2] bg-gradient-to-br from-primary to-primary/90 text-primary-foreground p-12 flex flex-direction-column justify-center relative overflow-hidden">
          <div className="absolute w-[250px] h-[250px] rounded-full bg-white/10 -top-20 -right-20" />
          <div className="absolute w-[200px] h-[200px] rounded-full bg-white/10 -bottom-20 -left-20" />
          
          <div className="relative z-10">
            <div className="flex items-center mb-10">
              <GraduationCap className="w-9 h-9 mr-3" />
              <h1 className="text-3xl font-bold">
                Attendance <span className="text-white/80">Tracker</span>
              </h1>
            </div>

            <div className="mb-10">
              <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-lg opacity-90 leading-relaxed">
                Track student attendance and grades efficiently with our comprehensive management system.
              </p>
            </div>

            <div className="space-y-6 mt-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Student Management</h3>
                  <p className="text-sm opacity-80">Manage all student records easily</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Real-time Attendance</h3>
                  <p className="text-sm opacity-80">Track attendance in real-time</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Detailed Reports</h3>
                  <p className="text-sm opacity-80">Generate comprehensive reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 p-12 flex flex-col justify-center bg-card">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold mb-2 text-foreground">Sign In</h2>
            <p className="text-muted-foreground mb-8">Enter your credentials to access your account</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-border"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-primary font-medium hover:underline">
                  Forgot Password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Demo: Use <span className="font-mono font-semibold text-foreground">admin@example.com</span> for admin or{" "}
                <span className="font-mono font-semibold text-foreground">student@example.com</span> for student
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { Shield, Lock, Download, FileText, Eye, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SecuritySection = () => {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Your data, protected
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Secure authentication and access controls keep your financial data private. 
              You're always in control of what you share.
            </p>
          </div>
          
          {/* Security Features */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                <Lock className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Secure authentication required</h3>
                <p className="text-sm text-muted-foreground">
                  Only authenticated users can access financial data through row-level security policies
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                <UserCheck className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Access control</h3>
                <p className="text-sm text-muted-foreground">
                  You can only view and modify your own data - no one else can access it
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                <Download className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Export your data</h3>
                <p className="text-sm text-muted-foreground">
                  Download your financial records anytime for tax filing or personal backup
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Feature Cards */}
        <div className="space-y-4">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">SOC 2 Type 2 infrastructure</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Built on Supabase, a SOC 2 Type 2 certified platform that undergoes 
                regular security audits.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">IRS Pub 502 alignment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Expense categories align with IRS Publication 502 definitions for 
                medical expense deductions.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Data ownership</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Your data belongs to you. Export it anytime for tax purposes or 
                contact support for account deletion.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
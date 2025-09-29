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
              We take privacy seriously. Role-based access, encrypted storage, and secure 
              infrastructure keep your data safe. You're always in control of what you share.
            </p>
          </div>
          
          {/* Security Features */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                <Lock className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Encrypted at rest and in transit</h3>
                <p className="text-sm text-muted-foreground">
                  All data is protected with bank-level encryption both when stored and transmitted
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                <UserCheck className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Authenticated user access only</h3>
                <p className="text-sm text-muted-foreground">
                  Secure authentication ensures only you can access your financial data
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                <Download className="w-3 h-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">One-click export & delete</h3>
                <p className="text-sm text-muted-foreground">
                  Export your data anytime for tax filing or easily delete your account
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
                <CardTitle className="text-lg">Compliance-ready posture</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Architected with SOC-2 principles in mind; we continuously improve 
                controls as we scale.
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
                Categories match IRS definitions for medical expense deductions, 
                making tax preparation seamless.
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
                You control what's stored, exported, or deleted — anytime. 
                Your data belongs to you, not us.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
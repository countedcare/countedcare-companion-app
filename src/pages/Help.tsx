import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Book, MessageCircle, Video, FileText, DollarSign, Users, Camera, CreditCard } from 'lucide-react';

// Zendesk widget type declaration
declare global {
  interface Window {
    zE?: (command: string, action: string) => void;
  }
}
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'getting-started' | 'expenses' | 'tax' | 'resources' | 'account';
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Show Zendesk widget on this page only
  useEffect(() => {
    // Show Zendesk when component mounts
    if (window.zE) {
      window.zE('messenger', 'show');
    }

    // Hide Zendesk when component unmounts
    return () => {
      if (window.zE) {
        window.zE('messenger', 'hide');
      }
    };
  }, []);

  const helpTopics: HelpTopic[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of CountedCare',
      icon: <Book className="h-5 w-5" />,
      category: 'getting-started',
      articles: [
        {
          id: 'first-steps',
          title: 'Your First Steps in CountedCare',
          content: `Welcome to CountedCare! Here's how to get started:

1. **Complete Your Profile**: Make sure your profile has your name, email, and caregiving details
2. **Link Your Bank Account**: Connect your bank to automatically import medical transactions
3. **Add Care Recipients**: Set up profiles for family members you're caring for
4. **Start Tracking**: Begin adding expenses either manually or through bank imports
5. **Set Tax Goals**: Configure your projected AGI for accurate tax deduction tracking

Your dashboard will show you everything at a glance once you've completed these steps.`,
          tags: ['setup', 'profile', 'bank', 'recipients']
        },
        {
          id: 'navigation',
          title: 'Navigating the App',
          content: `CountedCare is organized into several main sections:

**Home**: Your dashboard with recent activity and quick actions
**Expenses**: Track and manage all your caregiving expenses
**Resources**: Find government programs and benefits
**Profile**: Manage your account settings and care recipients

Use the bottom navigation on mobile or the header menu on desktop to switch between sections.`,
          tags: ['navigation', 'dashboard', 'mobile']
        }
      ]
    },
    {
      id: 'expenses',
      title: 'Managing Expenses',
      description: 'Track and categorize your caregiving costs',
      icon: <DollarSign className="h-5 w-5" />,
      category: 'expenses',
      articles: [
        {
          id: 'add-expense',
          title: 'Adding Expenses',
          content: `There are several ways to add expenses to CountedCare:

**Manual Entry**:
1. Go to Expenses and click "Add Expense"
2. Fill in the date, amount, and category
3. Add the vendor name and description
4. Upload a receipt photo if you have one
5. Mark if it's tax deductible

**Bank Import**:
1. Link your bank account in Profile settings
2. Transactions will automatically import
3. Review and categorize imported transactions
4. Keep medical expenses, skip others

**Receipt Scanner**:
1. Use the camera button to scan receipts
2. The app will extract details automatically
3. Review and confirm the information
4. Save to your expense list`,
          tags: ['add', 'manual', 'bank', 'receipt', 'scanner']
        },
        {
          id: 'categories',
          title: 'Expense Categories',
          content: `CountedCare uses specific categories for caregiving expenses:

**Medical Categories**:
- Medical: Doctor visits, prescriptions, medical equipment
- Dental: Dental care, orthodontics, oral surgery
- Mental Health: Therapy, counseling, mental health services
- Vision: Eye exams, glasses, contacts

**Care Categories**:
- Personal Care: Bathing aids, mobility equipment
- Home Modifications: Ramps, grab bars, accessibility improvements
- Transportation: Medical appointments, care-related travel

**Other Categories**:
- Insurance: Health, long-term care premiums
- Legal: Elder law attorney, estate planning
- Education: Caregiver training, medical conferences

Choose the most specific category for accurate tax reporting.`,
          tags: ['categories', 'medical', 'dental', 'tax']
        }
      ]
    },
    {
      id: 'tax-deductions',
      title: 'Tax Deductions',
      description: 'Maximize your caregiving tax benefits',
      icon: <FileText className="h-5 w-5" />,
      category: 'tax',
      articles: [
        {
          id: 'medical-deductions',
          title: 'Medical & Dental Deductions',
          content: `You can deduct medical expenses that exceed 7.5% of your Adjusted Gross Income (AGI):

**Qualifying Expenses**:
- Medical and dental care for you and dependents
- Prescription medications
- Medical equipment and supplies
- Transportation to medical appointments
- Long-term care insurance premiums (with limits)

**How CountedCare Helps**:
1. Set your projected AGI in your profile
2. Track medical expenses throughout the year
3. View your progress toward the 7.5% threshold
4. Generate Schedule A reports for tax filing

**Tips**:
- Keep all receipts and documentation
- Include mileage for medical trips
- Don't forget insurance premiums and copays
- Consider timing large medical expenses`,
          tags: ['medical', 'deductions', 'agi', 'schedule-a']
        },
        {
          id: 'dependent-care',
          title: 'Dependent Care Credits',
          content: `If you pay for care while you work, you may qualify for the Dependent Care Credit:

**Qualifying Expenses**:
- Adult day care programs
- In-home care while you work
- Care that allows you to look for work

**Requirements**:
- Care recipient must be your dependent
- You must have earned income
- Care must be necessary for work

**Limits**:
- Up to $3,000 per dependent ($6,000 for two or more)
- Credit is 20-35% of expenses based on income

CountedCare helps you track these separately from medical deductions.`,
          tags: ['dependent', 'care', 'credit', 'work']
        }
      ]
    },
    {
      id: 'bank-linking',
      title: 'Bank Integration',
      description: 'Connect accounts to import transactions',
      icon: <CreditCard className="h-5 w-5" />,
      category: 'account',
      articles: [
        {
          id: 'link-accounts',
          title: 'Linking Your Bank Accounts',
          content: `Connect your bank accounts to automatically import medical transactions:

**Getting Started**:
1. Go to Profile → Link Bank Account
2. Search for your bank
3. Enter your online banking credentials
4. Choose which accounts to connect
5. Authorize the connection

**Security**:
- We use bank-level security (256-bit encryption)
- We never store your banking passwords
- You can disconnect accounts anytime
- Read-only access (we cannot move money)

**What Gets Imported**:
- Credit and debit card transactions
- Only transactions from connected accounts
- Transaction details: date, amount, merchant
- Categories are suggested automatically`,
          tags: ['bank', 'security', 'import', 'transactions']
        },
        {
          id: 'review-transactions',
          title: 'Reviewing Imported Transactions',
          content: `After linking accounts, you'll need to review imported transactions:

**Transaction Review Process**:
1. New transactions appear in the review queue
2. Each transaction shows: date, amount, merchant, category
3. Choose "Keep" for medical expenses or "Skip" for others
4. Kept transactions are added to your expense list
5. You can edit details before saving

**AI Medical Detection**:
- Our AI flags likely medical transactions
- Common medical merchants are detected automatically
- You can override AI suggestions
- Manual review ensures accuracy

**Best Practices**:
- Review transactions weekly
- Keep receipts for flagged expenses
- Double-check categories and amounts
- Add notes for complex transactions`,
          tags: ['review', 'ai', 'medical', 'accuracy']
        }
      ]
    },
    {
      id: 'care-recipients',
      title: 'Care Recipients',
      description: 'Manage family member profiles',
      icon: <Users className="h-5 w-5" />,
      category: 'account',
      articles: [
        {
          id: 'add-recipients',
          title: 'Adding Care Recipients',
          content: `Set up profiles for family members you're caring for:

**Required Information**:
- Full name
- Relationship to you (spouse, parent, child, etc.)
- Date of birth (for tax dependency calculations)

**Optional Details**:
- Notes about their care needs
- Last 4 digits of SSN (for tax records)
- Medical conditions or special needs

**Benefits of Adding Recipients**:
- Filter expenses by person
- Track costs per family member
- Generate individual spending reports
- Organize receipts and documentation

**Privacy & Security**:
- All data is encrypted and secure
- Only you can access recipient information
- Data is never shared with third parties`,
          tags: ['recipients', 'family', 'tax', 'privacy']
        }
      ]
    }
  ];

  const faqs = [
    {
      question: "Is my financial data secure?",
      answer: "Yes! We use bank-level 256-bit encryption and read-only access to your accounts. We never store your banking passwords and cannot move money from your accounts."
    },
    {
      question: "How accurate is the medical expense detection?",
      answer: "Our AI correctly identifies medical transactions about 85-90% of the time. We recommend reviewing all flagged transactions to ensure accuracy."
    },
    {
      question: "Can I use this for multiple family members?",
      answer: "Absolutely! Add care recipients in your profile to track expenses separately for each family member you're caring for."
    },
    {
      question: "What if I don't want to link my bank account?",
      answer: "That's fine! You can manually add all expenses, scan receipts, or upload CSV files. Bank linking is optional but makes tracking much easier."
    },
    {
      question: "How do I know if an expense is tax deductible?",
      answer: "CountedCare provides guidance, but we recommend consulting a tax professional for your specific situation. Generally, medical expenses over 7.5% of your AGI are deductible."
    },
    {
      question: "Can I export my data?",
      answer: "Yes! You can export expenses as PDF reports or CSV files from the Expenses page. This is helpful for tax filing and record keeping."
    }
  ];

  const filteredTopics = helpTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.articles.some(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderArticle = (article: HelpArticle) => (
    <Card key={article.id} className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{article.title}</CardTitle>
        <div className="flex flex-wrap gap-1">
          {article.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          {article.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**:')) {
              return (
                <h4 key={index} className="font-semibold mt-4 mb-2 text-primary">
                  {paragraph.replace(/\*\*/g, '')}
                </h4>
              );
            }
            return (
              <p key={index} className="mb-3 leading-relaxed">
                {paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .split(/(<strong>.*?<\/strong>)/)
                  .map((part, i) =>
                    part.startsWith('<strong>') ? (
                      <span key={i} dangerouslySetInnerHTML={{ __html: part }} />
                    ) : (
                      part
                    )
                  )}
              </p>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container-padding py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              Help Center
            </h1>
            <p className="text-gray-600 mb-6">
              Everything you need to know about using CountedCare
            </p>
            
            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for help topics, FAQs, or guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <Tabs defaultValue="guides" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="guides" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                Guides
              </TabsTrigger>
              <TabsTrigger value="faqs" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guides" className="space-y-6">
              {selectedTopic ? (
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedTopic(null)}
                    className="mb-4"
                  >
                    ← Back to all topics
                  </Button>
                  {helpTopics
                    .find(topic => topic.id === selectedTopic)
                    ?.articles.map(renderArticle)}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredTopics.map((topic) => (
                    <Card 
                      key={topic.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedTopic(topic.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              {topic.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{topic.title}</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">
                                {topic.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          {topic.articles.length} article{topic.articles.length !== 1 ? 's' : ''}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="faqs">
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="video">
              <div className="text-center py-12">
                <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Video Tutorials Coming Soon
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We're creating helpful video tutorials to guide you through CountedCare's features. 
                  Check back soon for step-by-step videos!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
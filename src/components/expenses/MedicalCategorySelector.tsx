import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronRight, Info, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MEDICAL_CATEGORIES, 
  searchMedicalCategories, 
  getMedicalCategoryLabels,
  getMedicalSubcategories,
  getCategoryData,
  type MedicalCategory,
  type MedicalSubcategory 
} from '@/lib/medicalCategories';

interface MedicalCategorySelectorProps {
  selectedCategory: string;
  selectedSubcategory?: string;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  onIrsDataChange?: (irsReferenceTag: string, description: string) => void;
  onDoctorPrescriptionChange?: (isPrescribed: boolean, doctorNote?: string) => void;
}

const MedicalCategorySelector: React.FC<MedicalCategorySelectorProps> = ({
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  onIrsDataChange,
  onDoctorPrescriptionChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{category: MedicalCategory, subcategory?: MedicalSubcategory, relevance: number}>>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showPrescriptionPrompt, setShowPrescriptionPrompt] = useState(false);
  const [doctorNote, setDoctorNote] = useState('');
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [subcategorySelectOpen, setSubcategorySelectOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.trim()) {
      const results = searchMedicalCategories(searchTerm);
      setSearchResults(results.slice(0, 10)); // Limit to top 10 results
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Update IRS data when category/subcategory changes
    if (selectedCategory && onIrsDataChange) {
      const data = getCategoryData(selectedCategory, selectedSubcategory);
      if (data) {
        const tag = data.subcategory?.irsReferenceTag || data.category.irsReferenceTag;
        const description = data.subcategory?.description || data.category.description;
        onIrsDataChange(tag, description);
      }
    }
  }, [selectedCategory, selectedSubcategory, onIrsDataChange]);

  const handleSearchResultClick = (result: {category: MedicalCategory, subcategory?: MedicalSubcategory}) => {
    onCategoryChange(result.category.userFriendlyLabel);
    if (result.subcategory) {
      onSubcategoryChange(result.subcategory.userFriendlyLabel);
    }
    setSearchTerm('');
    setShowSearch(false);
    
    // Check if this is a conditional deductible category
    if (result.category.id === 'doctor-prescribed-only') {
      setShowPrescriptionPrompt(true);
    }
  };

  const handleCategorySelection = (categoryLabel: string) => {
    onCategoryChange(categoryLabel);
    setCategorySelectOpen(false); // Close dropdown
    
    // Check if this is a conditional deductible category
    const category = MEDICAL_CATEGORIES.find(cat => cat.userFriendlyLabel === categoryLabel);
    if (category?.id === 'doctor-prescribed-only') {
      setShowPrescriptionPrompt(true);
    }
  };

  const handleSubcategorySelection = (subcategoryLabel: string) => {
    onSubcategoryChange(subcategoryLabel);
    setSubcategorySelectOpen(false); // Close dropdown
    
    // Check if parent category is conditional deductible
    const category = MEDICAL_CATEGORIES.find(cat => cat.userFriendlyLabel === selectedCategory);
    if (category?.id === 'doctor-prescribed-only') {
      setShowPrescriptionPrompt(true);
    }
  };

  const handlePrescriptionResponse = (isPrescribed: boolean) => {
    if (onDoctorPrescriptionChange) {
      onDoctorPrescriptionChange(isPrescribed, isPrescribed ? doctorNote : undefined);
    }
    setShowPrescriptionPrompt(false);
    setDoctorNote('');
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const availableSubcategories = getMedicalSubcategories(selectedCategory);

  return (
    <div className="space-y-4">
      {/* Search Toggle */}
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant={showSearch ? "default" : "outline"}
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center space-x-2"
        >
          <Search className="h-4 w-4" />
          <span>Search Expenses</span>
        </Button>
        {selectedCategory && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">IRS Compliant</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">This categorization follows IRS Publication 502 guidelines for medical expense deductions.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Search Interface */}
      {showSearch && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Search Medical Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type any medical expense (e.g., 'hearing aid batteries', 'physical therapy')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {result.subcategory?.userFriendlyLabel || result.category.userFriendlyLabel}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.category.userFriendlyLabel}
                          {result.subcategory && ` → ${result.subcategory.userFriendlyLabel}`}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.subcategory?.description || result.category.description}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm && searchResults.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No matches found. Try browsing categories below or contact support for help categorizing unusual expenses.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Traditional Category Selection */}
      {!showSearch && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Medical Expense Category *</Label>
            <Select 
              value={selectedCategory} 
              onValueChange={handleCategorySelection}
              open={categorySelectOpen}
              onOpenChange={setCategorySelectOpen}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a medical expense category" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-background border z-50">
                {getMedicalCategoryLabels().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && availableSubcategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subcategory">Specific Type</Label>
              <Select 
                value={selectedSubcategory || ''} 
                onValueChange={handleSubcategorySelection}
                open={subcategorySelectOpen}
                onOpenChange={setSubcategorySelectOpen}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specific type (optional)" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-background border z-50">
                  {availableSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Browse All Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Browse All Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {MEDICAL_CATEGORIES.map((category) => (
            <Collapsible 
              key={category.id}
              open={expandedCategories.has(category.id)}
              onOpenChange={() => toggleCategoryExpansion(category.id)}
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-2 h-auto text-left"
                >
                  <div>
                    <div className="font-medium text-sm">{category.userFriendlyLabel}</div>
                    <div className="text-xs text-muted-foreground">{category.description}</div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${
                    expandedCategories.has(category.id) ? 'rotate-90' : ''
                  }`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pl-4">
                {category.subcategories.map((subcategory) => (
                  <Button
                    key={subcategory.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => {
                      handleCategorySelection(category.userFriendlyLabel);
                      handleSubcategorySelection(subcategory.userFriendlyLabel);
                    }}
                  >
                    <div>
                      <div className="text-sm">{subcategory.userFriendlyLabel}</div>
                      <div className="text-xs text-muted-foreground">{subcategory.description}</div>
                      {subcategory.examples && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Examples: {subcategory.examples.slice(0, 2).join(', ')}
                          {subcategory.examples.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Current Selection Display */}
      {selectedCategory && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{selectedCategory}</Badge>
                {selectedSubcategory && (
                  <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline">{selectedSubcategory}</Badge>
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {(() => {
                  const data = getCategoryData(selectedCategory, selectedSubcategory);
                  return data?.subcategory?.description || data?.category.description;
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Prescription Prompt */}
      {showPrescriptionPrompt && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900">Doctor Prescription Required</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    This expense is deductible only if prescribed by a doctor. Did a doctor prescribe this for a specific medical condition?
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="doctor-note" className="text-sm">Doctor's Note or Prescription Details (optional)</Label>
                  <textarea
                    id="doctor-note"
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="Enter doctor's prescription details, diagnosis, or notes..."
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handlePrescriptionResponse(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Yes, Doctor Prescribed
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrescriptionResponse(false)}
                  >
                    No, Not Prescribed
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalCategorySelector;
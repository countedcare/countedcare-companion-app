import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronRight, Info, FileText } from 'lucide-react';
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
  const [searchResults, setSearchResults] = useState<Array<{category: MedicalCategory, subcategory?: MedicalSubcategory, relevance: number}>>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showPrescriptionPrompt, setShowPrescriptionPrompt] = useState(false);
  const [doctorNote, setDoctorNote] = useState('');
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [subcategorySelectOpen, setSubcategorySelectOpen] = useState(false);
  const [browseSelectOpen, setBrowseSelectOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    setIsSearchFocused(false);
    
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

  const handleBrowseSelection = (value: string) => {
    const [categoryId, subcategoryId] = value.split('|');
    const category = MEDICAL_CATEGORIES.find(cat => cat.id === categoryId);
    
    if (category) {
      handleCategorySelection(category.userFriendlyLabel);
      
      if (subcategoryId) {
        const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
        if (subcategory) {
          handleSubcategorySelection(subcategory.userFriendlyLabel);
        }
      }
    }
    setBrowseSelectOpen(false);
  };

  const availableSubcategories = getMedicalSubcategories(selectedCategory);

  return (
    <div className="space-y-4">
      {/* Search Input - Always Visible */}
      <div className="space-y-2">
        <Label htmlFor="expense-search">Expense Category & Details</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            id="expense-search"
            placeholder="Type any medical expense (e.g., 'hearing aid batteries', 'physical therapy')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="pl-10 h-12 text-base"
          />
        </div>
        
        {/* Live Recommendations Dropdown */}
        {searchTerm && isSearchFocused && (
          <Card className="absolute z-50 w-full mt-1 shadow-lg border-2 border-primary/20">
            <CardContent className="p-0">
              {searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-sm">
                            {result.subcategory?.userFriendlyLabel || result.category.userFriendlyLabel}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.category.userFriendlyLabel}
                            {result.subcategory && ` → ${result.subcategory.userFriendlyLabel}`}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {result.subcategory?.description || result.category.description}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <p className="text-sm">No matches found. Try browsing categories below.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Browse All Categories Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="browse-categories">Or Browse All Categories</Label>
        <Select 
          value="" 
          onValueChange={handleBrowseSelection}
          open={browseSelectOpen}
          onOpenChange={setBrowseSelectOpen}
        >
          <SelectTrigger id="browse-categories" className="h-12">
            <SelectValue placeholder="Browse All Categories" />
          </SelectTrigger>
          <SelectContent className="max-h-80 bg-background border z-50">
             {MEDICAL_CATEGORIES.filter(category => category.id?.trim()).map((category) => (
              <div key={category.id}>
                {/* Category Header */}
                <SelectItem 
                  value={category.id} 
                  className="font-medium py-3 bg-muted/30"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">{category.userFriendlyLabel}</span>
                  </div>
                </SelectItem>
                
                {/* Subcategories */}
                {category.subcategories.filter(subcategory => subcategory.id?.trim()).map((subcategory) => (
                  <SelectItem 
                    key={`${category.id}|${subcategory.id}`}
                    value={`${category.id}|${subcategory.id}`}
                    className="pl-6 py-2"
                  >
                    <div className="space-y-1">
                      <div className="text-sm">{subcategory.userFriendlyLabel}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {subcategory.description}
                      </div>
                      {subcategory.examples && (
                        <div className="text-xs text-muted-foreground">
                          Examples: {subcategory.examples.slice(0, 2).join(', ')}
                          {subcategory.examples.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* IRS Compliant Badge */}
      {selectedCategory && (
        <div className="flex items-center justify-end space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground cursor-help">
                  <FileText className="h-3 w-3" />
                  <span>IRS Compliant</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">This categorization follows IRS Publication 502 guidelines for medical expense deductions.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Manual Category Selection (Hidden when search is active) */}
      {!searchTerm && (
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
                {getMedicalCategoryLabels().filter(category => category?.trim()).map((category) => (
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
                  {availableSubcategories.filter(subcategory => subcategory?.trim()).map((subcategory) => (
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
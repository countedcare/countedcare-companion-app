
export function isLikelyMedicalExpense(description: string, merchantName?: string): boolean {
  const text = `${description} ${merchantName || ''}`.toLowerCase()
  
  const medicalKeywords = [
    'pharmacy', 'cvs', 'walgreens', 'rite aid', 'medical', 'doctor', 'hospital',
    'clinic', 'dentist', 'dental', 'urgent care', 'health', 'prescription',
    'medicare', 'medicaid', 'insurance', 'copay', 'deductible', 'therapy',
    'physical therapy', 'mental health', 'counseling', 'nursing', 'care',
    'assisted living', 'home care', 'caregiver'
  ]
  
  return medicalKeywords.some(keyword => text.includes(keyword))
}

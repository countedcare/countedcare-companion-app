export interface MedicalCategory {
  id: string;
  userFriendlyLabel: string;
  irsReferenceTag: string;
  description: string;
  subcategories: MedicalSubcategory[];
  searchTerms: string[];
}

export interface MedicalSubcategory {
  id: string;
  userFriendlyLabel: string;
  irsReferenceTag: string;
  description: string;
  searchTerms: string[];
  examples?: string[];
}

export const MEDICAL_CATEGORIES: MedicalCategory[] = [
  {
    id: "doctor-medical",
    userFriendlyLabel: "Doctor & Medical Services",
    irsReferenceTag: "medical_services",
    description: "Professional medical care and services",
    searchTerms: ["doctor", "physician", "medical", "appointment", "visit", "consultation"],
    subcategories: [
      {
        id: "physician-visits",
        userFriendlyLabel: "Doctor Visits",
        irsReferenceTag: "physician_services",
        description: "Regular doctor appointments and consultations",
        searchTerms: ["doctor visit", "physician", "family doctor", "gp", "general practitioner"],
        examples: ["Family doctor visit", "Annual check-up", "Sick visit"]
      },
      {
        id: "specialists",
        userFriendlyLabel: "Specialist Care",
        irsReferenceTag: "specialist_services",
        description: "Chiropractor, osteopath, psychiatrist, psychologist, Christian Science practitioner",
        searchTerms: ["specialist", "chiropractor", "osteopath", "psychiatrist", "psychologist", "christian science"],
        examples: ["Cardiologist", "Dermatologist", "Orthopedist", "Neurologist"]
      },
      {
        id: "therapy",
        userFriendlyLabel: "Therapy Services",
        irsReferenceTag: "therapy_services", 
        description: "Mental health, physical, occupational, speech therapy",
        searchTerms: ["therapy", "physical therapy", "occupational therapy", "speech therapy", "mental health"],
        examples: ["PT session", "Counseling", "Speech pathology"]
      },
      {
        id: "diagnostic-tests",
        userFriendlyLabel: "Tests & Diagnostics",
        irsReferenceTag: "diagnostic_services",
        description: "X-rays, lab fees, body scans, pregnancy tests",
        searchTerms: ["x-ray", "lab", "test", "scan", "mri", "ct scan", "ultrasound", "blood work"],
        examples: ["Blood work", "MRI scan", "X-ray", "Pregnancy test"]
      },
      {
        id: "annual-physicals",
        userFriendlyLabel: "Annual Physicals",
        irsReferenceTag: "preventive_care",
        description: "Annual physical examinations and preventive care",
        searchTerms: ["annual physical", "checkup", "wellness visit", "preventive"],
        examples: ["Annual wellness exam", "Preventive screening"]
      },
      {
        id: "operations",
        userFriendlyLabel: "Surgery & Operations",
        irsReferenceTag: "surgical_procedures",
        description: "Non-cosmetic, medically necessary operations",
        searchTerms: ["surgery", "operation", "procedure", "surgical"],
        examples: ["Appendectomy", "Joint replacement", "Heart surgery"]
      },
      {
        id: "legal-medical",
        userFriendlyLabel: "Legal Fees (Medical)",
        irsReferenceTag: "legal_fees_medical",
        description: "Legal fees necessary to authorize medical treatment",
        searchTerms: ["legal fees", "attorney", "guardianship", "medical authorization"],
        examples: ["Guardianship for medical decisions", "Medical power of attorney"]
      }
    ]
  },
  {
    id: "hospital-nursing",
    userFriendlyLabel: "Hospital, Nursing & Long-Term Care",
    irsReferenceTag: "institutional_care",
    description: "Hospital stays, nursing care, and long-term care services",
    searchTerms: ["hospital", "nursing home", "long-term care", "assisted living"],
    subcategories: [
      {
        id: "hospital-stays",
        userFriendlyLabel: "Hospital Stays",
        irsReferenceTag: "hospital_care",
        description: "Hospital stays including meals and lodging if for medical care",
        searchTerms: ["hospital", "inpatient", "emergency room", "er", "admission"],
        examples: ["Emergency room visit", "Surgery stay", "Inpatient treatment"]
      },
      {
        id: "nursing-home",
        userFriendlyLabel: "Nursing Home Care",
        irsReferenceTag: "nursing_home_care",
        description: "Nursing home care if primarily for medical care",
        searchTerms: ["nursing home", "skilled nursing", "nursing facility"],
        examples: ["Skilled nursing facility", "Memory care unit"]
      },
      {
        id: "nursing-services",
        userFriendlyLabel: "Nursing Services",
        irsReferenceTag: "nursing_services",
        description: "Home or facility nursing, including attendant wages for medical tasks",
        searchTerms: ["nurse", "nursing", "home health", "attendant", "caregiver"],
        examples: ["Home health aide", "Private duty nurse", "Medical attendant"]
      },
      {
        id: "long-term-care",
        userFriendlyLabel: "Long-Term Care Services",
        irsReferenceTag: "long_term_care_services",
        description: "Services for diagnosed chronically ill with prescribed care plan",
        searchTerms: ["long-term care", "chronic care", "custodial care"],
        examples: ["Adult day care", "Respite care", "Chronic illness management"]
      },
      {
        id: "assisted-living",
        userFriendlyLabel: "Assisted Living",
        irsReferenceTag: "assisted_living_disability",
        description: "Assisted living or special homes if prescribed for disability",
        searchTerms: ["assisted living", "special home", "disability care", "group home"],
        examples: ["Memory care facility", "Disability group home"]
      }
    ]
  },
  {
    id: "dental-vision",
    userFriendlyLabel: "Dental & Vision",
    irsReferenceTag: "dental_vision_care",
    description: "Dental and vision care expenses",
    searchTerms: ["dental", "dentist", "vision", "eye", "glasses", "contacts"],
    subcategories: [
      {
        id: "dental-treatment",
        userFriendlyLabel: "Dental Care",
        irsReferenceTag: "dental_treatment",
        description: "Cleanings, fillings, dentures, braces, extractions",
        searchTerms: ["dentist", "dental", "cleaning", "filling", "crown", "root canal", "braces", "dentures"],
        examples: ["Teeth cleaning", "Cavity filling", "Root canal", "Braces"]
      },
      {
        id: "eyeglasses-contacts",
        userFriendlyLabel: "Glasses & Contacts",
        irsReferenceTag: "vision_correction",
        description: "Eyeglasses, contact lenses, and supplies",
        searchTerms: ["glasses", "eyeglasses", "contacts", "contact lenses", "prescription glasses"],
        examples: ["Prescription glasses", "Contact lenses", "Lens solution"]
      },
      {
        id: "eye-surgery",
        userFriendlyLabel: "Eye Surgery",
        irsReferenceTag: "eye_surgery",
        description: "LASIK, radial keratotomy, and other eye procedures",
        searchTerms: ["lasik", "eye surgery", "radial keratotomy", "cataract surgery"],
        examples: ["LASIK surgery", "Cataract removal", "Retinal surgery"]
      },
      {
        id: "vision-aids",
        userFriendlyLabel: "Vision Aids",
        irsReferenceTag: "vision_aids",
        description: "Braille books/magazines, closed-caption TVs",
        searchTerms: ["braille", "vision aid", "closed caption", "magnifier"],
        examples: ["Braille materials", "Screen reader", "Magnifying equipment"]
      }
    ]
  },
  {
    id: "prescriptions-supplies",
    userFriendlyLabel: "Prescriptions & Medical Supplies",
    irsReferenceTag: "prescriptions_supplies",
    description: "Prescription medications and medical supplies",
    searchTerms: ["prescription", "medication", "medicine", "pharmacy", "supplies"],
    subcategories: [
      {
        id: "prescription-medicines",
        userFriendlyLabel: "Prescription Medications",
        irsReferenceTag: "prescription_drugs",
        description: "Prescription medicines and insulin",
        searchTerms: ["prescription", "medication", "medicine", "insulin", "pharmacy", "rx"],
        examples: ["Blood pressure medication", "Insulin", "Antibiotics"]
      },
      {
        id: "birth-control",
        userFriendlyLabel: "Birth Control (Prescribed)",
        irsReferenceTag: "prescribed_birth_control",
        description: "Birth control pills when prescribed",
        searchTerms: ["birth control", "contraceptive", "oral contraceptive"],
        examples: ["Birth control pills", "IUD insertion"]
      },
      {
        id: "medical-supplies",
        userFriendlyLabel: "Medical Supplies",
        irsReferenceTag: "medical_supplies",
        description: "Bandages, PPE like masks/sanitizer, condoms",
        searchTerms: ["bandages", "medical supplies", "mask", "sanitizer", "gauze", "condoms"],
        examples: ["First aid supplies", "Medical masks", "Hand sanitizer"]
      },
      {
        id: "pregnancy-tests",
        userFriendlyLabel: "Pregnancy Test Kits",
        irsReferenceTag: "pregnancy_test_kits",
        description: "Home pregnancy test kits",
        searchTerms: ["pregnancy test", "home pregnancy test"],
        examples: ["Home pregnancy test", "Digital pregnancy test"]
      }
    ]
  },
  {
    id: "medical-equipment",
    userFriendlyLabel: "Medical Equipment & Aids",
    irsReferenceTag: "medical_equipment",
    description: "Medical equipment, devices, and assistive aids",
    searchTerms: ["wheelchair", "equipment", "medical device", "prosthetic", "hearing aid"],
    subcategories: [
      {
        id: "wheelchairs",
        userFriendlyLabel: "Wheelchairs",
        irsReferenceTag: "wheelchair_equipment",
        description: "Purchase, maintenance, and repairs of wheelchairs",
        searchTerms: ["wheelchair", "mobility chair", "wheelchair repair"],
        examples: ["Manual wheelchair", "Electric wheelchair", "Wheelchair maintenance"]
      },
      {
        id: "prosthetics",
        userFriendlyLabel: "Prosthetics",
        irsReferenceTag: "artificial_devices",
        description: "Artificial limbs, teeth, and other prosthetics",
        searchTerms: ["prosthetic", "artificial limb", "artificial teeth", "prosthesis"],
        examples: ["Prosthetic leg", "Dentures", "Artificial arm"]
      },
      {
        id: "mobility-aids",
        userFriendlyLabel: "Mobility Aids",
        irsReferenceTag: "mobility_aids",
        description: "Crutches and other mobility assistance",
        searchTerms: ["crutches", "walker", "cane", "mobility aid"],
        examples: ["Crutches", "Walker", "Walking cane"]
      },
      {
        id: "oxygen-equipment",
        userFriendlyLabel: "Oxygen Equipment",
        irsReferenceTag: "oxygen_equipment",
        description: "Oxygen and oxygen equipment",
        searchTerms: ["oxygen", "oxygen tank", "concentrator", "cpap"],
        examples: ["Oxygen concentrator", "CPAP machine", "Oxygen tanks"]
      },
      {
        id: "hearing-aids",
        userFriendlyLabel: "Hearing Aids",
        irsReferenceTag: "hearing_aids",
        description: "Hearing aids plus batteries and maintenance",
        searchTerms: ["hearing aid", "hearing device", "hearing aid battery"],
        examples: ["Digital hearing aids", "Hearing aid batteries", "Cochlear implant"]
      },
      {
        id: "breast-pumps",
        userFriendlyLabel: "Breast Pumps & Lactation",
        irsReferenceTag: "lactation_supplies",
        description: "Breast pumps and lactation supplies",
        searchTerms: ["breast pump", "lactation", "nursing supplies"],
        examples: ["Electric breast pump", "Nursing pads", "Milk storage bags"]
      },
      {
        id: "medical-wigs",
        userFriendlyLabel: "Medical Wigs",
        irsReferenceTag: "medical_wigs",
        description: "Wig if prescribed after disease-related hair loss",
        searchTerms: ["wig", "hairpiece", "hair loss", "medical wig"],
        examples: ["Chemotherapy wig", "Alopecia hairpiece"]
      },
      {
        id: "service-animals",
        userFriendlyLabel: "Service Animals",
        irsReferenceTag: "service_animals",
        description: "Guide dog or service animal (purchase, training, food, vet care)",
        searchTerms: ["service dog", "guide dog", "service animal", "therapy animal"],
        examples: ["Guide dog training", "Service dog food", "Therapy animal care"]
      },
      {
        id: "disability-equipment",
        userFriendlyLabel: "Disability Equipment",
        irsReferenceTag: "disability_equipment",
        description: "Telephone and TV equipment for hearing/speech disabilities",
        searchTerms: ["tty", "amplified phone", "closed caption", "disability equipment"],
        examples: ["TTY device", "Amplified telephone", "Closed caption decoder"]
      }
    ]
  },
  {
    id: "home-modifications",
    userFriendlyLabel: "Home & Vehicle Modifications",
    irsReferenceTag: "accessibility_modifications",
    description: "Home and vehicle accessibility improvements",
    searchTerms: ["home modification", "ramp", "accessibility", "grab bar", "vehicle modification"],
    subcategories: [
      {
        id: "accessibility-improvements",
        userFriendlyLabel: "Home Accessibility",
        irsReferenceTag: "home_accessibility",
        description: "Ramps, widened doors/hallways, grab bars, alarms",
        searchTerms: ["ramp", "grab bar", "accessibility", "door widening", "bathroom modification"],
        examples: ["Wheelchair ramp", "Bathroom grab bars", "Doorway widening"]
      },
      {
        id: "modified-rooms",
        userFriendlyLabel: "Room Modifications",
        irsReferenceTag: "room_modifications",
        description: "Modified bathrooms and kitchens for accessibility",
        searchTerms: ["bathroom modification", "kitchen modification", "accessible bathroom"],
        examples: ["Roll-in shower", "Lowered countertops", "Accessible kitchen"]
      },
      {
        id: "lifts-equipment",
        userFriendlyLabel: "Lifts & Equipment",
        irsReferenceTag: "lift_equipment",
        description: "Porch/stair lifts (not elevators)",
        searchTerms: ["stair lift", "porch lift", "chair lift"],
        examples: ["Stairlift installation", "Porch lift", "Curved stairlift"]
      },
      {
        id: "warning-systems",
        userFriendlyLabel: "Warning Systems",
        irsReferenceTag: "warning_systems",
        description: "Modified smoke detectors or warning systems",
        searchTerms: ["smoke detector", "warning system", "alert system", "safety alarm"],
        examples: ["Flashing smoke alarm", "Vibrating alarm", "Medical alert system"]
      },
      {
        id: "ground-modifications",
        userFriendlyLabel: "Ground Access",
        irsReferenceTag: "ground_access",
        description: "Grading ground for access",
        searchTerms: ["grading", "ground modification", "driveway", "pathway"],
        examples: ["Driveway grading", "Accessible pathway", "Ground leveling"]
      },
      {
        id: "vehicle-modifications",
        userFriendlyLabel: "Vehicle Modifications",
        irsReferenceTag: "vehicle_accessibility",
        description: "Hand controls, wheelchair lifts, accessible vehicle design",
        searchTerms: ["hand controls", "wheelchair lift", "vehicle modification", "accessible vehicle"],
        examples: ["Hand controls installation", "Wheelchair lift", "Vehicle ramp"]
      },
      {
        id: "lead-paint-removal",
        userFriendlyLabel: "Lead Paint Removal",
        irsReferenceTag: "lead_paint_removal",
        description: "Lead-based paint removal if prescribed for child with lead poisoning",
        searchTerms: ["lead paint", "lead removal", "lead poisoning"],
        examples: ["Lead paint abatement", "Lead remediation"]
      }
    ]
  },
  {
    id: "insurance-premiums",
    userFriendlyLabel: "Insurance & Premiums",
    irsReferenceTag: "insurance_premiums",
    description: "Health insurance premiums and related costs",
    searchTerms: ["insurance", "premium", "medicare", "medicaid", "health insurance"],
    subcategories: [
      {
        id: "health-insurance",
        userFriendlyLabel: "Health Insurance Premiums",
        irsReferenceTag: "health_insurance_premiums",
        description: "Health, dental, and vision insurance premiums",
        searchTerms: ["health insurance", "dental insurance", "vision insurance", "premium"],
        examples: ["Monthly health premium", "Dental plan premium", "Vision coverage"]
      },
      {
        id: "hmo-premiums",
        userFriendlyLabel: "HMO Premiums",
        irsReferenceTag: "hmo_premiums",
        description: "Health Maintenance Organization premiums",
        searchTerms: ["hmo", "hmo premium", "health maintenance organization"],
        examples: ["HMO monthly fee", "HMO enrollment"]
      },
      {
        id: "medicare-premiums",
        userFriendlyLabel: "Medicare Premiums",
        irsReferenceTag: "medicare_premiums",
        description: "Medicare Part A (if voluntary), Part B, Part D",
        searchTerms: ["medicare", "medicare part a", "medicare part b", "medicare part d"],
        examples: ["Medicare Part B premium", "Medicare Part D premium", "Medicare supplement"]
      },
      {
        id: "long-term-care-insurance",
        userFriendlyLabel: "Long-Term Care Insurance",
        irsReferenceTag: "ltc_insurance_premiums",
        description: "Qualified long-term care insurance premiums (subject to age-based limits)",
        searchTerms: ["long-term care insurance", "ltc insurance", "ltci"],
        examples: ["LTC insurance premium", "Long-term care policy"]
      },
      {
        id: "prepaid-insurance",
        userFriendlyLabel: "Prepaid Insurance",
        irsReferenceTag: "prepaid_insurance",
        description: "Prepaid insurance premiums meeting IRS requirements",
        searchTerms: ["prepaid insurance", "prepaid premium"],
        examples: ["Annual premium payment", "Prepaid health coverage"]
      },
      {
        id: "lifetime-care-contracts",
        userFriendlyLabel: "Lifetime Care Contracts",
        irsReferenceTag: "lifetime_care_contracts",
        description: "Lifetime care / founder's fee contracts (portion allocable to medical care)",
        searchTerms: ["lifetime care", "founders fee", "continuing care", "ccrc"],
        examples: ["CCRC entrance fee", "Lifetime care contract"]
      },
      {
        id: "sick-leave-premiums",
        userFriendlyLabel: "Sick Leave Premiums",
        irsReferenceTag: "sick_leave_premiums",
        description: "Unused sick leave applied to premiums",
        searchTerms: ["sick leave", "unused sick leave", "sick leave premium"],
        examples: ["Sick leave for insurance", "Unused sick time premium"]
      }
    ]
  },
  {
    id: "transportation-travel",
    userFriendlyLabel: "Transportation & Travel",
    irsReferenceTag: "medical_transportation",
    description: "Transportation and travel for medical care",
    searchTerms: ["transportation", "travel", "mileage", "ambulance", "medical travel"],
    subcategories: [
      {
        id: "ambulance",
        userFriendlyLabel: "Ambulance Services",
        irsReferenceTag: "ambulance_services",
        description: "Emergency and non-emergency ambulance services",
        searchTerms: ["ambulance", "emergency transport", "medical transport"],
        examples: ["Emergency ambulance", "Medical transport", "Air ambulance"]
      },
      {
        id: "public-transit",
        userFriendlyLabel: "Public Transportation",
        irsReferenceTag: "public_transportation",
        description: "Public transit, taxi, train, plane fares for medical care",
        searchTerms: ["bus", "train", "taxi", "uber", "lyft", "plane", "flight", "public transit"],
        examples: ["Bus fare to appointment", "Taxi to hospital", "Flight for treatment"]
      },
      {
        id: "mileage-parking",
        userFriendlyLabel: "Mileage & Parking",
        irsReferenceTag: "vehicle_expenses",
        description: "Car mileage (21¢ per mile for 2024), parking, tolls",
        searchTerms: ["mileage", "parking", "toll", "gas", "car expenses"],
        examples: ["Medical appointment mileage", "Hospital parking", "Medical travel tolls"]
      },
      {
        id: "caregiver-travel",
        userFriendlyLabel: "Caregiver Travel",
        irsReferenceTag: "caregiver_transportation",
        description: "Caregiver travel if medically necessary to accompany patient",
        searchTerms: ["caregiver travel", "family travel", "companion travel"],
        examples: ["Parent travel for child care", "Spouse travel for support"]
      },
      {
        id: "medical-lodging",
        userFriendlyLabel: "Medical Lodging",
        irsReferenceTag: "medical_lodging",
        description: "Lodging (up to $50/night per person, $100 if caregiver accompanies; no meals unless inpatient)",
        searchTerms: ["hotel", "lodging", "accommodation", "medical travel lodging"],
        examples: ["Hotel for medical treatment", "Ronald McDonald House", "Medical travel lodging"]
      },
      {
        id: "medical-conferences",
        userFriendlyLabel: "Medical Conferences",
        irsReferenceTag: "medical_conferences",
        description: "Medical conferences (transportation and admission only)",
        searchTerms: ["medical conference", "health conference", "medical education"],
        examples: ["Diabetes conference", "Cancer support conference"]
      }
    ]
  },
  {
    id: "special-treatments",
    userFriendlyLabel: "Special Treatments & Programs",
    irsReferenceTag: "special_programs",
    description: "Specialized treatment programs and services",
    searchTerms: ["treatment program", "addiction", "fertility", "weight loss", "special education"],
    subcategories: [
      {
        id: "addiction-treatment",
        userFriendlyLabel: "Addiction Treatment",
        irsReferenceTag: "addiction_treatment",
        description: "Alcoholism/drug addiction treatment (inpatient programs, transportation to AA/NA if prescribed)",
        searchTerms: ["alcoholism", "drug addiction", "rehab", "aa", "na", "addiction treatment"],
        examples: ["Alcohol rehab program", "Drug treatment center", "AA meeting transportation"]
      },
      {
        id: "fertility-treatments",
        userFriendlyLabel: "Fertility Treatments",
        irsReferenceTag: "fertility_treatments",
        description: "IVF, reversal of prior surgery, egg/sperm storage",
        searchTerms: ["ivf", "fertility", "egg storage", "sperm storage", "fertility treatment"],
        examples: ["IVF treatment", "Fertility medications", "Egg freezing"]
      },
      {
        id: "sterilization",
        userFriendlyLabel: "Sterilization Procedures",
        irsReferenceTag: "sterilization_procedures",
        description: "Vasectomy, tubal ligation",
        searchTerms: ["vasectomy", "tubal ligation", "sterilization"],
        examples: ["Vasectomy procedure", "Tubal ligation surgery"]
      },
      {
        id: "smoking-cessation",
        userFriendlyLabel: "Stop-Smoking Programs",
        irsReferenceTag: "smoking_cessation",
        description: "Stop-smoking programs (fees, not OTC unless prescribed)",
        searchTerms: ["stop smoking", "smoking cessation", "quit smoking"],
        examples: ["Smoking cessation program", "Nicotine replacement therapy"]
      },
      {
        id: "weight-loss-programs",
        userFriendlyLabel: "Weight-Loss Programs",
        irsReferenceTag: "weight_loss_programs",
        description: "Weight-loss programs if prescribed for a diagnosed condition",
        searchTerms: ["weight loss", "diet program", "obesity treatment"],
        examples: ["Medically supervised diet", "Obesity treatment program"]
      },
      {
        id: "special-education",
        userFriendlyLabel: "Special Education",
        irsReferenceTag: "special_education",
        description: "Doctor-recommended for learning disabilities, Braille, remedial speech/language training",
        searchTerms: ["special education", "learning disability", "speech training", "braille training"],
        examples: ["Learning disability tutoring", "Speech therapy training", "Braille instruction"]
      },
      {
        id: "transplants",
        userFriendlyLabel: "Transplants & Organ Donation",
        irsReferenceTag: "transplant_procedures",
        description: "Transplants and organ donor-related medical costs",
        searchTerms: ["transplant", "organ donation", "donor costs"],
        examples: ["Kidney transplant", "Organ donor expenses", "Transplant medications"]
      }
    ]
  }
];

// Search functionality
export function searchMedicalCategories(searchTerm: string): Array<{category: MedicalCategory, subcategory?: MedicalSubcategory, relevance: number}> {
  const results: Array<{category: MedicalCategory, subcategory?: MedicalSubcategory, relevance: number}> = [];
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) return results;
  
  MEDICAL_CATEGORIES.forEach(category => {
    // Check category-level matches
    let categoryRelevance = 0;
    if (category.userFriendlyLabel.toLowerCase().includes(term)) categoryRelevance += 10;
    if (category.searchTerms.some(t => t.toLowerCase().includes(term))) categoryRelevance += 8;
    if (category.description.toLowerCase().includes(term)) categoryRelevance += 5;
    
    if (categoryRelevance > 0) {
      results.push({ category, relevance: categoryRelevance });
    }
    
    // Check subcategory matches
    category.subcategories.forEach(subcategory => {
      let subRelevance = 0;
      if (subcategory.userFriendlyLabel.toLowerCase().includes(term)) subRelevance += 15;
      if (subcategory.searchTerms.some(t => t.toLowerCase().includes(term))) subRelevance += 12;
      if (subcategory.examples?.some(e => e.toLowerCase().includes(term))) subRelevance += 10;
      if (subcategory.description.toLowerCase().includes(term)) subRelevance += 7;
      
      if (subRelevance > 0) {
        results.push({ category, subcategory, relevance: subRelevance });
      }
    });
  });
  
  return results.sort((a, b) => b.relevance - a.relevance);
}

// Get all categories as simple strings (for backward compatibility)
export function getMedicalCategoryLabels(): string[] {
  return MEDICAL_CATEGORIES.map(cat => cat.userFriendlyLabel);
}

// Get subcategories for a category (for backward compatibility)
export function getMedicalSubcategories(categoryLabel: string): string[] {
  const category = MEDICAL_CATEGORIES.find(cat => cat.userFriendlyLabel === categoryLabel);
  return category ? category.subcategories.map(sub => sub.userFriendlyLabel) : [];
}

// Get category and subcategory by labels
export function getCategoryData(categoryLabel: string, subcategoryLabel?: string) {
  const category = MEDICAL_CATEGORIES.find(cat => cat.userFriendlyLabel === categoryLabel);
  if (!category) return null;
  
  if (subcategoryLabel) {
    const subcategory = category.subcategories.find(sub => sub.userFriendlyLabel === subcategoryLabel);
    return { category, subcategory };
  }
  
  return { category };
}
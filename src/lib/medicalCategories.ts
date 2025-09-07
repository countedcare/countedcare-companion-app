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
    description: "Professional medical care and services from licensed practitioners",
    searchTerms: ["doctor", "physician", "medical", "appointment", "visit", "consultation", "therapy", "psychiatrist", "psychologist"],
    subcategories: [
      {
        id: "physician-visits",
        userFriendlyLabel: "Doctor Visits",
        irsReferenceTag: "physician_services",
        description: "Fees paid to physicians, surgeons, specialists, and other medical practitioners for professional services",
        searchTerms: ["doctor visit", "physician", "family doctor", "gp", "general practitioner", "consultation"],
        examples: ["Family doctor visit", "Annual check-up", "Sick visit", "Medical consultation"]
      },
      {
        id: "specialists",
        userFriendlyLabel: "Specialist Care", 
        irsReferenceTag: "specialist_services",
        description: "Fees to chiropractors, osteopaths, psychiatrists, psychologists, and Christian Science practitioners",
        searchTerms: ["specialist", "chiropractor", "osteopath", "psychiatrist", "psychologist", "christian science", "cardiologist", "dermatologist"],
        examples: ["Cardiologist", "Dermatologist", "Orthopedist", "Neurologist", "Chiropractor"]
      },
      {
        id: "therapy",
        userFriendlyLabel: "Therapy Services",
        irsReferenceTag: "therapy_services",
        description: "Mental health counseling, physical therapy, occupational therapy, and speech therapy",
        searchTerms: ["therapy", "physical therapy", "occupational therapy", "speech therapy", "mental health", "counseling", "pt", "ot"],
        examples: ["Physical therapy session", "Mental health counseling", "Speech pathology", "Occupational therapy"]
      },
      {
        id: "diagnostic-tests",
        userFriendlyLabel: "Tests & Diagnostics",
        irsReferenceTag: "diagnostic_services", 
        description: "X-rays, laboratory fees, body scans, pregnancy tests, and other diagnostic procedures",
        searchTerms: ["x-ray", "lab", "test", "scan", "mri", "ct scan", "ultrasound", "blood work", "diagnostic", "lab work"],
        examples: ["Blood work", "MRI scan", "X-ray", "Pregnancy test", "Lab fees"]
      },
      {
        id: "annual-physicals",
        userFriendlyLabel: "Annual Physicals",
        irsReferenceTag: "preventive_care",
        description: "Annual physical examinations and routine preventive care",
        searchTerms: ["annual physical", "checkup", "wellness visit", "preventive", "routine exam"],
        examples: ["Annual wellness exam", "Preventive screening", "Routine physical"]
      },
      {
        id: "operations",
        userFriendlyLabel: "Surgery & Operations", 
        irsReferenceTag: "surgical_procedures",
        description: "Medically necessary operations and surgical procedures (not cosmetic)",
        searchTerms: ["surgery", "operation", "procedure", "surgical"],
        examples: ["Appendectomy", "Joint replacement", "Heart surgery", "Cataract surgery"]
      },
      {
        id: "legal-medical",
        userFriendlyLabel: "Legal Fees (Medical)",
        irsReferenceTag: "legal_fees_medical",
        description: "Legal fees necessary to authorize treatment for a mentally ill dependent",
        searchTerms: ["legal fees", "attorney", "guardianship", "medical authorization"],
        examples: ["Guardianship for medical decisions", "Medical power of attorney"]
      },
      {
        id: "acupuncture",
        userFriendlyLabel: "Acupuncture",
        irsReferenceTag: "acupuncture_services",
        description: "Acupuncture treatments for medical purposes",
        searchTerms: ["acupuncture", "acupuncturist", "traditional medicine"],
        examples: ["Acupuncture session", "Traditional Chinese medicine"]
      },
      {
        id: "abortion",
        userFriendlyLabel: "Abortion",
        irsReferenceTag: "abortion_services",
        description: "Legal abortion procedures and related medical costs",
        searchTerms: ["abortion", "pregnancy termination"],
        examples: ["Abortion procedure", "Related medical care"]
      }
    ]
  },
  {
    id: "hospital-nursing",
    userFriendlyLabel: "Hospital, Nursing & Long-Term Care",
    irsReferenceTag: "institutional_care",
    description: "Hospital stays, nursing care, and long-term care services",
    searchTerms: ["hospital", "nursing home", "long-term care", "assisted living", "inpatient"],
    subcategories: [
      {
        id: "hospital-stays",
        userFriendlyLabel: "Hospital Stays",
        irsReferenceTag: "hospital_care",
        description: "Hospital bills including meals and lodging when primarily for medical care",
        searchTerms: ["hospital", "inpatient", "emergency room", "er", "admission", "hospital stay"],
        examples: ["Emergency room visit", "Surgery stay", "Inpatient treatment", "Hospital meals"]
      },
      {
        id: "nursing-home",
        userFriendlyLabel: "Nursing Home Care",
        irsReferenceTag: "nursing_home_care", 
        description: "Nursing home care when primarily for medical reasons, not personal care",
        searchTerms: ["nursing home", "skilled nursing", "nursing facility"],
        examples: ["Skilled nursing facility", "Memory care unit", "Rehabilitation facility"]
      },
      {
        id: "nursing-services",
        userFriendlyLabel: "Nursing Services",
        irsReferenceTag: "nursing_services",
        description: "Home or facility nursing services, including wages for medical attendants",
        searchTerms: ["nurse", "nursing", "home health", "attendant", "caregiver", "medical aide"],
        examples: ["Home health aide", "Private duty nurse", "Medical attendant", "Nursing care"]
      },
      {
        id: "long-term-care",
        userFriendlyLabel: "Long-Term Care Services",
        irsReferenceTag: "long_term_care_services",
        description: "Qualified long-term care services for chronically ill individuals with care plans",
        searchTerms: ["long-term care", "chronic care", "custodial care", "ltc"],
        examples: ["Adult day care", "Respite care", "Chronic illness management"]
      },
      {
        id: "assisted-living",
        userFriendlyLabel: "Assisted Living (Medical)",
        irsReferenceTag: "assisted_living_medical",
        description: "Assisted living costs when prescribed by doctor for specific medical condition",
        searchTerms: ["assisted living", "special home", "disability care", "group home"],
        examples: ["Memory care facility", "Disability group home", "Medical assisted living"]
      }
    ]
  },
  {
    id: "dental-vision",
    userFriendlyLabel: "Dental & Vision",
    irsReferenceTag: "dental_vision_care",
    description: "Dental and vision care expenses including treatment and corrective devices",
    searchTerms: ["dental", "dentist", "vision", "eye", "glasses", "contacts", "dental care"],
    subcategories: [
      {
        id: "dental-treatment",
        userFriendlyLabel: "Dental Care",
        irsReferenceTag: "dental_treatment",
        description: "Dental cleanings, fillings, dentures, braces, extractions, and other dental work",
        searchTerms: ["dentist", "dental", "cleaning", "filling", "crown", "root canal", "braces", "dentures", "extraction"],
        examples: ["Teeth cleaning", "Cavity filling", "Root canal", "Braces", "Dentures"]
      },
      {
        id: "eyeglasses-contacts",
        userFriendlyLabel: "Glasses & Contacts",
        irsReferenceTag: "vision_correction",
        description: "Eyeglasses, contact lenses, and related supplies for vision correction",
        searchTerms: ["glasses", "eyeglasses", "contacts", "contact lenses", "prescription glasses", "lens"],
        examples: ["Prescription glasses", "Contact lenses", "Lens solution", "Reading glasses"]
      },
      {
        id: "eye-surgery",
        userFriendlyLabel: "Eye Surgery",
        irsReferenceTag: "eye_surgery",
        description: "LASIK, radial keratotomy, cataract surgery, and other medically necessary eye procedures",
        searchTerms: ["lasik", "eye surgery", "radial keratotomy", "cataract surgery", "eye operation"],
        examples: ["LASIK surgery", "Cataract removal", "Retinal surgery", "Glaucoma surgery"]
      },
      {
        id: "vision-aids",
        userFriendlyLabel: "Vision Aids",
        irsReferenceTag: "vision_aids",
        description: "Special aids for the blind including Braille books, magazines, and closed-caption TVs",
        searchTerms: ["braille", "vision aid", "closed caption", "magnifier", "blind", "low vision"],
        examples: ["Braille materials", "Screen reader", "Magnifying equipment", "Talking devices"]
      }
    ]
  },
  {
    id: "prescriptions-supplies",
    userFriendlyLabel: "Prescriptions & Medical Supplies",
    irsReferenceTag: "prescriptions_supplies",
    description: "Prescription medications and qualifying medical supplies",
    searchTerms: ["prescription", "medication", "medicine", "pharmacy", "supplies", "drugs"],
    subcategories: [
      {
        id: "prescription-medicines",
        userFriendlyLabel: "Prescription Medications",
        irsReferenceTag: "prescription_drugs",
        description: "Prescription medicines, insulin, and drugs requiring a prescription",
        searchTerms: ["prescription", "medication", "medicine", "insulin", "pharmacy", "rx", "drugs"],
        examples: ["Blood pressure medication", "Insulin", "Antibiotics", "Prescription drugs"]
      },
      {
        id: "birth-control",
        userFriendlyLabel: "Birth Control (Prescribed)",
        irsReferenceTag: "prescribed_birth_control",
        description: "Prescription birth control pills and devices prescribed by a doctor",
        searchTerms: ["birth control", "contraceptive", "oral contraceptive", "iud"],
        examples: ["Birth control pills", "IUD insertion", "Contraceptive devices"]
      },
      {
        id: "medical-supplies",
        userFriendlyLabel: "Medical Supplies",
        irsReferenceTag: "medical_supplies",
        description: "Medical supplies such as bandages, condoms, and certain PPE for medical purposes",
        searchTerms: ["bandages", "medical supplies", "gauze", "condoms", "first aid"],
        examples: ["First aid supplies", "Bandages", "Medical gauze", "Condoms"]
      },
      {
        id: "pregnancy-tests",
        userFriendlyLabel: "Pregnancy Test Kits",
        irsReferenceTag: "pregnancy_test_kits", 
        description: "Home pregnancy test kits and pregnancy-related testing supplies",
        searchTerms: ["pregnancy test", "home pregnancy test", "pregnancy kit"],
        examples: ["Home pregnancy test", "Digital pregnancy test", "Pregnancy test kit"]
      }
    ]
  },
  {
    id: "medical-equipment",
    userFriendlyLabel: "Medical Equipment & Aids",
    irsReferenceTag: "medical_equipment",
    description: "Medical equipment, devices, and assistive aids for medical conditions",
    searchTerms: ["wheelchair", "equipment", "medical device", "prosthetic", "hearing aid", "medical equipment"],
    subcategories: [
      {
        id: "wheelchairs",
        userFriendlyLabel: "Wheelchairs",
        irsReferenceTag: "wheelchair_equipment",
        description: "Cost and maintenance of wheelchairs when used primarily for medical reasons",
        searchTerms: ["wheelchair", "mobility chair", "wheelchair repair", "electric wheelchair"],
        examples: ["Manual wheelchair", "Electric wheelchair", "Wheelchair maintenance", "Wheelchair accessories"]
      },
      {
        id: "prosthetics", 
        userFriendlyLabel: "Prosthetics",
        irsReferenceTag: "artificial_devices",
        description: "Artificial limbs, artificial teeth, and other prosthetic devices",
        searchTerms: ["prosthetic", "artificial limb", "artificial teeth", "prosthesis", "implants"],
        examples: ["Prosthetic leg", "Dentures", "Artificial arm", "Medical implants"]
      },
      {
        id: "mobility-aids",
        userFriendlyLabel: "Mobility Aids",
        irsReferenceTag: "mobility_aids",
        description: "Crutches, walkers, and other mobility assistance devices",
        searchTerms: ["crutches", "walker", "cane", "mobility aid", "walking aid"],
        examples: ["Crutches", "Walker", "Walking cane", "Mobility scooter"]
      },
      {
        id: "oxygen-equipment",
        userFriendlyLabel: "Oxygen Equipment",
        irsReferenceTag: "oxygen_equipment",
        description: "Oxygen and oxygen equipment for medical treatment",
        searchTerms: ["oxygen", "oxygen tank", "concentrator", "cpap", "breathing equipment"],
        examples: ["Oxygen concentrator", "CPAP machine", "Oxygen tanks", "Sleep apnea equipment"]
      },
      {
        id: "hearing-aids",
        userFriendlyLabel: "Hearing Aids",
        irsReferenceTag: "hearing_aids",
        description: "Hearing aids, batteries, and maintenance costs for hearing impairments",
        searchTerms: ["hearing aid", "hearing device", "hearing aid battery", "cochlear implant"],
        examples: ["Digital hearing aids", "Hearing aid batteries", "Cochlear implant", "Hearing amplifiers"]
      },
      {
        id: "breast-pumps",
        userFriendlyLabel: "Breast Pumps & Lactation",
        irsReferenceTag: "lactation_supplies",
        description: "Breast pumps and lactation supplies for nursing mothers",
        searchTerms: ["breast pump", "lactation", "nursing supplies", "breast feeding"],
        examples: ["Electric breast pump", "Nursing pads", "Milk storage bags", "Lactation consultant"]
      },
      {
        id: "medical-wigs",
        userFriendlyLabel: "Medical Wigs",
        irsReferenceTag: "medical_wigs",
        description: "Wigs purchased upon doctor's recommendation for hair loss due to disease",
        searchTerms: ["wig", "hairpiece", "hair loss", "medical wig", "chemotherapy"],
        examples: ["Chemotherapy wig", "Alopecia hairpiece", "Medical hairpiece"]
      },
      {
        id: "service-animals",
        userFriendlyLabel: "Service Animals",
        irsReferenceTag: "service_animals",
        description: "Cost of buying, training, and maintaining guide dogs and other service animals",
        searchTerms: ["service dog", "guide dog", "service animal", "therapy animal"],
        examples: ["Guide dog training", "Service dog food", "Therapy animal care", "Service animal vet bills"]
      },
      {
        id: "disability-equipment",
        userFriendlyLabel: "Disability Equipment",
        irsReferenceTag: "disability_equipment",
        description: "Special telephone and television equipment for hearing and speech disabilities",
        searchTerms: ["tty", "amplified phone", "closed caption", "disability equipment", "communication aid"],
        examples: ["TTY device", "Amplified telephone", "Closed caption decoder", "Communication devices"]
      }
    ]
  },
  {
    id: "home-modifications",
    userFriendlyLabel: "Home & Vehicle Modifications",
    irsReferenceTag: "accessibility_modifications",
    description: "Home and vehicle modifications for medical accessibility and safety",
    searchTerms: ["home modification", "ramp", "accessibility", "grab bar", "vehicle modification", "home improvement"],
    subcategories: [
      {
        id: "accessibility-improvements",
        userFriendlyLabel: "Home Accessibility",
        irsReferenceTag: "home_accessibility",
        description: "Constructing entrance/exit ramps, widening doorways and hallways, installing grab bars",
        searchTerms: ["ramp", "grab bar", "accessibility", "door widening", "bathroom modification", "entrance ramp"],
        examples: ["Wheelchair ramp", "Bathroom grab bars", "Doorway widening", "Accessible entrance"]
      },
      {
        id: "modified-rooms",
        userFriendlyLabel: "Room Modifications",
        irsReferenceTag: "room_modifications",
        description: "Modifying bathrooms and kitchens to accommodate disabilities",
        searchTerms: ["bathroom modification", "kitchen modification", "accessible bathroom", "accessible kitchen"],
        examples: ["Roll-in shower", "Lowered countertops", "Accessible kitchen", "Modified bathroom"]
      },
      {
        id: "lifts-equipment",
        userFriendlyLabel: "Lifts & Equipment",
        irsReferenceTag: "lift_equipment", 
        description: "Installing porch lifts and stairway lifts (elevators don't qualify)",
        searchTerms: ["stair lift", "porch lift", "chair lift", "stairlift"],
        examples: ["Stairlift installation", "Porch lift", "Curved stairlift", "Chair lift"]
      },
      {
        id: "warning-systems",
        userFriendlyLabel: "Warning Systems",
        irsReferenceTag: "warning_systems",
        description: "Modifying hard-wired smoke detectors and other warning systems for disabilities",
        searchTerms: ["smoke detector", "warning system", "alert system", "safety alarm", "fire alarm"],
        examples: ["Flashing smoke alarm", "Vibrating alarm", "Visual alert system"]
      },
      {
        id: "ground-modifications",
        userFriendlyLabel: "Ground Access",
        irsReferenceTag: "ground_access",
        description: "Grading and paving to provide access to the home for disabled person",
        searchTerms: ["grading", "ground modification", "driveway", "pathway", "paving"],
        examples: ["Driveway grading", "Accessible pathway", "Ground leveling", "Accessible paving"]
      },
      {
        id: "vehicle-modifications",
        userFriendlyLabel: "Vehicle Modifications",
        irsReferenceTag: "vehicle_accessibility",
        description: "Special equipment installed in car for disabled person (hand controls, lifts)",
        searchTerms: ["hand controls", "wheelchair lift", "vehicle modification", "accessible vehicle", "car modification"],
        examples: ["Hand controls installation", "Wheelchair lift", "Vehicle ramp", "Disabled driver equipment"]
      },
      {
        id: "lead-paint-removal",
        userFriendlyLabel: "Lead Paint Removal",
        irsReferenceTag: "lead_paint_removal",
        description: "Removing lead-based paint from home surfaces when child has lead poisoning",
        searchTerms: ["lead paint", "lead removal", "lead poisoning", "paint removal"],
        examples: ["Lead paint abatement", "Lead remediation", "Lead-safe renovation"]
      }
    ]
  },
  {
    id: "insurance-premiums",
    userFriendlyLabel: "Insurance & Premiums",
    irsReferenceTag: "insurance_premiums",
    description: "Health insurance premiums and related medical insurance costs",
    searchTerms: ["insurance", "premium", "medicare", "medicaid", "health insurance", "insurance premium"],
    subcategories: [
      {
        id: "health-insurance",
        userFriendlyLabel: "Health Insurance Premiums",
        irsReferenceTag: "health_insurance_premiums",
        description: "Premiums for health, dental, and vision insurance policies",
        searchTerms: ["health insurance", "dental insurance", "vision insurance", "premium", "health premium"],
        examples: ["Monthly health premium", "Dental plan premium", "Vision coverage", "Health plan costs"]
      },
      {
        id: "hmo-premiums",
        userFriendlyLabel: "HMO Premiums",
        irsReferenceTag: "hmo_premiums",
        description: "Health Maintenance Organization membership fees and premiums",
        searchTerms: ["hmo", "hmo premium", "health maintenance organization", "hmo fee"],
        examples: ["HMO monthly fee", "HMO enrollment", "HMO membership"]
      },
      {
        id: "medicare-premiums",
        userFriendlyLabel: "Medicare Premiums",
        irsReferenceTag: "medicare_premiums",
        description: "Medicare Part A (voluntary), Part B, Part D, and Medicare supplement premiums",
        searchTerms: ["medicare", "medicare part a", "medicare part b", "medicare part d", "medigap"],
        examples: ["Medicare Part B premium", "Medicare Part D premium", "Medicare supplement", "Medigap premium"]
      },
      {
        id: "long-term-care-insurance",
        userFriendlyLabel: "Long-Term Care Insurance",
        irsReferenceTag: "ltc_insurance_premiums",
        description: "Qualified long-term care insurance premiums (subject to age-based annual limits)",
        searchTerms: ["long-term care insurance", "ltc insurance", "ltci", "long term care premium"],
        examples: ["LTC insurance premium", "Long-term care policy", "LTCI premium"]
      },
      {
        id: "prepaid-insurance",
        userFriendlyLabel: "Prepaid Insurance",
        irsReferenceTag: "prepaid_insurance",
        description: "Prepaid insurance premiums meeting specific IRS requirements for advance payment",
        searchTerms: ["prepaid insurance", "advance premium", "prepaid health insurance"],
        examples: ["Prepaid health premium", "Advance insurance payment"]
      },
      {
        id: "lifetime-care",
        userFriendlyLabel: "Lifetime Care Fees",
        irsReferenceTag: "lifetime_care_fees",
        description: "Founder's fees or similar amounts paid to retirement or life care communities",
        searchTerms: ["founder's fee", "lifetime care", "retirement community", "life care"],
        examples: ["Retirement community founder's fee", "Life care entrance fee"]
      },
      {
        id: "sick-leave-premiums",
        userFriendlyLabel: "Sick Leave Applied to Premiums",
        irsReferenceTag: "sick_leave_premiums",
        description: "Unused sick leave used to pay health insurance premiums after retirement",
        searchTerms: ["sick leave", "unused sick leave", "sick leave premium"],
        examples: ["Sick leave for health premiums", "Unused sick leave conversion"]
      }
    ]
  },
  {
    id: "transportation-travel",
    userFriendlyLabel: "Transportation & Travel",
    irsReferenceTag: "medical_transportation",
    description: "Transportation costs for medical care and related travel expenses",
    searchTerms: ["ambulance", "transportation", "travel", "mileage", "taxi", "medical travel"],
    subcategories: [
      {
        id: "ambulance-services",
        userFriendlyLabel: "Ambulance Services",
        irsReferenceTag: "ambulance_services",
        description: "Ambulance hire and emergency medical transportation",
        searchTerms: ["ambulance", "emergency transport", "medical transport", "ems"],
        examples: ["Ambulance ride", "Emergency transport", "Medical helicopter", "Emergency medical services"]
      },
      {
        id: "public-transportation",
        userFriendlyLabel: "Public Transit & Taxis",
        irsReferenceTag: "public_transit_medical",
        description: "Bus, taxi, train, or plane fares primarily for medical care",
        searchTerms: ["taxi", "bus", "train", "plane", "public transit", "uber", "lyft"],
        examples: ["Taxi to doctor", "Bus fare to hospital", "Train to medical center", "Flight for treatment"]
      },
      {
        id: "car-expenses",
        userFriendlyLabel: "Car Mileage & Expenses",
        irsReferenceTag: "car_expenses_medical",
        description: "Car mileage (21¢ per mile for 2024), parking fees, and tolls for medical trips",
        searchTerms: ["mileage", "parking", "tolls", "gas", "car expenses", "driving"],
        examples: ["Medical appointment mileage", "Hospital parking", "Toll fees", "Gas for medical trips"]
      },
      {
        id: "caregiver-travel",
        userFriendlyLabel: "Caregiver Travel",
        irsReferenceTag: "caregiver_travel_expenses",
        description: "Transportation costs when caregiver must accompany patient for medical reasons",
        searchTerms: ["caregiver travel", "accompanying travel", "parent travel", "family travel"],
        examples: ["Parent travel with child", "Spouse travel for surgery", "Caregiver transportation"]
      },
      {
        id: "medical-lodging",
        userFriendlyLabel: "Medical Lodging",
        irsReferenceTag: "medical_lodging",
        description: "Lodging up to $50/night per person ($100 if caregiver accompanies patient); no meals unless inpatient",
        searchTerms: ["lodging", "hotel", "medical lodging", "overnight stay", "accommodation"],
        examples: ["Hotel near hospital", "Medical lodging", "Overnight accommodation", "Treatment center stay"]
      },
      {
        id: "medical-conferences",
        userFriendlyLabel: "Medical Conferences",
        irsReferenceTag: "medical_conference_expenses",
        description: "Transportation and admission to medical conferences related to chronic illness (not meals/lodging)",
        searchTerms: ["medical conference", "health conference", "chronic illness conference"],
        examples: ["Diabetes conference", "Cancer support conference", "Medical education event"]
      }
    ]
  },
  {
    id: "special-treatments",
    userFriendlyLabel: "Special Treatments & Programs",
    irsReferenceTag: "special_medical_programs",
    description: "Specialized treatment programs and services",
    searchTerms: ["addiction treatment", "fertility", "weight loss", "special education", "rehabilitation"],
    subcategories: [
      {
        id: "substance-abuse-treatment",
        userFriendlyLabel: "Addiction Treatment",
        irsReferenceTag: "substance_abuse_treatment",
        description: "Alcoholism and drug addiction treatment programs and transportation to meetings if prescribed",
        searchTerms: ["alcoholism treatment", "drug treatment", "addiction treatment", "aa", "na", "rehab"],
        examples: ["Inpatient rehab", "AA transportation", "Drug treatment program", "Addiction counseling"]
      },
      {
        id: "fertility-treatments",
        userFriendlyLabel: "Fertility Treatments",
        irsReferenceTag: "fertility_treatments",
        description: "IVF, reversal of prior sterilization, egg/sperm storage for fertility treatment",
        searchTerms: ["ivf", "fertility treatment", "artificial insemination", "egg storage", "sperm storage"],
        examples: ["IVF treatment", "Fertility drugs", "Egg retrieval", "Artificial insemination"]
      },
      {
        id: "sterilization",
        userFriendlyLabel: "Sterilization Procedures",
        irsReferenceTag: "sterilization_procedures",
        description: "Vasectomy, tubal ligation, and other sterilization procedures",
        searchTerms: ["vasectomy", "tubal ligation", "sterilization", "birth control surgery"],
        examples: ["Vasectomy procedure", "Tubal ligation", "Sterilization surgery"]
      },
      {
        id: "smoking-cessation",
        userFriendlyLabel: "Stop-Smoking Programs",
        irsReferenceTag: "smoking_cessation",
        description: "Stop-smoking programs and prescribed smoking cessation aids",
        searchTerms: ["stop smoking", "smoking cessation", "quit smoking", "nicotine patch"],
        examples: ["Smoking cessation program", "Nicotine replacement therapy", "Quit smoking class"]
      },
      {
        id: "weight-loss-programs",
        userFriendlyLabel: "Weight-Loss Programs (Medical)",
        irsReferenceTag: "medical_weight_loss",
        description: "Weight-loss programs when prescribed by doctor for specific diagnosed condition",
        searchTerms: ["weight loss program", "medical weight loss", "obesity treatment", "bariatric"],
        examples: ["Medical weight loss program", "Bariatric surgery", "Prescribed diet program"]
      },
      {
        id: "special-education",
        userFriendlyLabel: "Special Education (Medical)",
        irsReferenceTag: "special_education_medical",
        description: "Doctor-recommended special education for learning disabilities, Braille, speech training",
        searchTerms: ["special education", "learning disability", "braille instruction", "speech training"],
        examples: ["Learning disability tutoring", "Braille instruction", "Speech therapy training"]
      },
      {
        id: "transplant-costs",
        userFriendlyLabel: "Transplant & Organ Costs",
        irsReferenceTag: "transplant_expenses",
        description: "Transplant operations and organ donor-related medical expenses",
        searchTerms: ["transplant", "organ donation", "donor expenses", "organ transplant"],
        examples: ["Kidney transplant", "Organ donor expenses", "Transplant surgery", "Donor medical costs"]
      }
    ]
  },
  {
    id: "not-deductible",
    userFriendlyLabel: "Not Deductible",
    irsReferenceTag: "non_qualifying_expenses",
    description: "Medical expenses that do NOT qualify for tax deductions under IRS rules",
    searchTerms: ["cosmetic", "vitamins", "supplements", "babysitting", "gym", "health club", "funeral", "not deductible"],
    subcategories: [
      {
        id: "cosmetic-surgery",
        userFriendlyLabel: "Cosmetic Surgery",
        irsReferenceTag: "cosmetic_procedures",
        description: "Cosmetic surgery and procedures that are not medically necessary",
        searchTerms: ["cosmetic surgery", "plastic surgery", "elective surgery", "beauty treatment"],
        examples: ["Face lift", "Tummy tuck", "Breast augmentation", "Teeth whitening"]
      },
      {
        id: "vitamins-supplements",
        userFriendlyLabel: "Vitamins & Supplements",
        irsReferenceTag: "vitamins_supplements",
        description: "Vitamins, supplements, and health foods unless prescribed for specific medical condition",
        searchTerms: ["vitamins", "supplements", "health food", "nutritional supplements"],
        examples: ["Daily vitamins", "Protein supplements", "Health food", "Nutritional drinks"]
      },
      {
        id: "personal-care",
        userFriendlyLabel: "Personal Care & Babysitting",
        irsReferenceTag: "personal_care_services",
        description: "Personal care, babysitting, childcare, and non-medical attendant services",
        searchTerms: ["babysitting", "childcare", "personal care", "babysitter", "nanny"],
        examples: ["Babysitting", "Childcare", "Personal care attendant", "Nanny services"]
      },
      {
        id: "fitness-recreation",
        userFriendlyLabel: "Fitness & Recreation",
        irsReferenceTag: "fitness_recreation",
        description: "Health club dues, gym memberships, and recreational activities for general health",
        searchTerms: ["gym", "health club", "fitness", "recreation", "membership"],
        examples: ["Gym membership", "Health club dues", "Fitness classes", "Personal trainer"]
      },
      {
        id: "funeral-expenses",
        userFriendlyLabel: "Funeral & Burial",
        irsReferenceTag: "funeral_expenses",
        description: "Funeral, burial, or cremation expenses are never deductible medical expenses",
        searchTerms: ["funeral", "burial", "cremation", "funeral expenses"],
        examples: ["Funeral costs", "Burial expenses", "Cremation fees", "Cemetery plot"]
      },
      {
        id: "experimental-treatments",
        userFriendlyLabel: "Experimental Treatments",
        irsReferenceTag: "experimental_treatments",
        description: "Experimental or unproven treatments not accepted by medical community",
        searchTerms: ["experimental", "unproven treatment", "alternative medicine"],
        examples: ["Experimental therapy", "Unproven treatments", "Non-approved procedures"]
      },
      {
        id: "surrogacy-costs",
        userFriendlyLabel: "Surrogacy Expenses",
        irsReferenceTag: "surrogacy_expenses",
        description: "Payments to surrogate mothers and surrogacy-related expenses",
        searchTerms: ["surrogacy", "surrogate mother", "surrogate payment"],
        examples: ["Surrogate mother payment", "Surrogacy fees", "Surrogate expenses"]
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
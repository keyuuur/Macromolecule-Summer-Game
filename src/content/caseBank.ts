import {
  EVIDENCE_CONCEPTS,
  MACROMOLECULES,
  type DiagnosticCase,
  type EvidenceConcept,
  type Macromolecule,
} from '../types'

export const CONTENT_VERSION = 'unit2-slides-11-16-v1'

const ALL_MACRO_CHOICES = [...MACROMOLECULES] as const

const tutorialCase: DiagnosticCase = {
  id: 'tutorial-quick-energy-01',
  eligibleStages: ['tutorial'],
  macromolecule: 'Carbohydrate',
  concept: 'function',
  prompt:
    'Practice case: A runner chooses a food from the class chart for immediate energy before a race. Which macromolecule does the food mostly represent?',
  macroChoices: ALL_MACRO_CHOICES,
  correctMacro: 'Carbohydrate',
  evidenceQuestion: 'Which class-chart clue best supports that choice?',
  evidenceChoices: [
    'It is used as an immediate energy source for animals.',
    'It stores genetic information.',
    'It provides long-term energy storage.',
    'It speeds up chemical reactions as an enzyme.',
  ],
  correctEvidence: 'It is used as an immediate energy source for animals.',
  misconceptionCode: 'tutorial-immediate-vs-long-term-energy',
  repair: {
    title: 'Practice reference: energy timing',
    reference:
      'Carbohydrates provide immediate energy for animals. Lipids are associated with long-term energy storage.',
    explanation:
      'Use the timing clue: immediate energy points to carbohydrates, while stored energy for later points to lipids.',
  },
  sourceNote: 'Unit 2 slides 11–16; immediate-energy model from slide 13.',
}

export const TUTORIAL_CASE = tutorialCase

const diagnosticCases: readonly DiagnosticCase[] = [
  {
    id: 'diag-carb-elements-01',
    legacySourceId: 'R2_CARB_002',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Carbohydrate',
    concept: 'elements',
    prompt:
      'A lab sample is built from simple sugars and supplies immediate energy. Which macromolecule best fits those clues?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Carbohydrate',
    evidenceQuestion: 'Which element pattern from the class chart supports this classification?',
    evidenceChoices: ['C, H, and O', 'C, H, O, and N', 'C, H, O, N, and P', 'N and P only'],
    correctEvidence: 'C, H, and O',
    misconceptionCode: 'carb-elements-confused-with-chon',
    repair: {
      title: 'Carbohydrate element check',
      reference: 'Carbohydrates contain carbon, hydrogen, and oxygen (CHO).',
      explanation:
        'Nitrogen belongs in the class-chart patterns for proteins and nucleic acids, not carbohydrates.',
    },
    sourceNote: 'Unit 2 slides 11–16; carbohydrate elements from slide 13.',
  },
  {
    id: 'diag-carb-example-01',
    legacySourceId: 'R3_CARB_003',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Carbohydrate',
    concept: 'example',
    prompt:
      'Before a short, intense activity, a student chooses a class-chart food for energy right away. Which macromolecule does that food mostly represent?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Carbohydrate',
    evidenceQuestion: 'Which matching pair is listed as examples in the class chart?',
    evidenceChoices: ['Sugars and vegetables', 'Fats and waxes', 'Meat and beans', 'DNA and RNA'],
    correctEvidence: 'Sugars and vegetables',
    misconceptionCode: 'carb-food-example-confusion',
    repair: {
      title: 'Carbohydrate example check',
      reference: 'The Unit 2 chart lists breads, potatoes, vegetables, and sugars as carbohydrate examples.',
      explanation:
        'Foods contain mixtures. In this class model, sugars and vegetables mostly represent the carbohydrate category.',
    },
    sourceNote: 'Unit 2 slides 11–16; carbohydrate examples from slide 13.',
  },
  {
    id: 'diag-lipid-function-01',
    legacySourceId: 'R4_LIPID_002',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Lipid',
    concept: 'function',
    prompt:
      'A seal stays warm in icy water and draws on stored material during a long migration. Which macromolecule best explains both observations?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Lipid',
    evidenceQuestion: 'Which paired functions are the strongest evidence?',
    evidenceChoices: [
      'Insulation and long-term energy storage',
      'Immediate energy and short-term plant storage',
      'Genetic information and protein instructions',
      'Enzyme action and antibody defense',
    ],
    correctEvidence: 'Insulation and long-term energy storage',
    misconceptionCode: 'lipid-function-confused-with-quick-energy',
    repair: {
      title: 'Lipid function check',
      reference: 'Lipids provide insulation and protection and store energy long term.',
      explanation:
        'Do not let the word energy alone decide the answer: energy for later and insulation point to lipids.',
    },
    sourceNote: 'Unit 2 slides 11–16; lipid functions from slide 14.',
  },
  {
    id: 'diag-lipid-building-01',
    legacySourceId: 'R1_LIPID_001',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Lipid',
    concept: 'building-block',
    prompt:
      'A lab breaks down an oily compound that an organism stores for later energy. Which macromolecule fits the sample?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Lipid',
    evidenceQuestion: 'Which building block is the key evidence?',
    evidenceChoices: ['Fatty acids', 'Simple sugars', 'Amino acids', 'Nucleotides'],
    correctEvidence: 'Fatty acids',
    misconceptionCode: 'lipid-building-block-confusion',
    repair: {
      title: 'Lipid building-block check',
      reference: 'The Unit 2 chart uses fatty acids as the building-block clue for lipids.',
      explanation:
        'For this course model, match fatty acids with lipids rather than with simple sugars, amino acids, or nucleotides.',
    },
    sourceNote: 'Unit 2 slides 11–16; fatty-acid model from slide 14.',
  },
  {
    id: 'diag-protein-example-01',
    legacySourceId: 'R3_PROT_001',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Protein',
    concept: 'example',
    prompt:
      'A student chooses a class-chart food to support body growth and repair. Which macromolecule does that food mostly represent?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Protein',
    evidenceQuestion: 'Which matching set is listed as examples in the class chart?',
    evidenceChoices: ['Nuts, meat, and beans', 'Fats, oils, and waxes', 'Bread, potatoes, and sugars', 'DNA and RNA'],
    correctEvidence: 'Nuts, meat, and beans',
    misconceptionCode: 'protein-food-example-confusion',
    repair: {
      title: 'Protein example check',
      reference: 'The Unit 2 chart lists nuts, meat, and beans as protein examples.',
      explanation:
        'Foods contain more than one nutrient. In this class model, meat and beans mostly represent the protein category.',
    },
    sourceNote: 'Unit 2 slides 11–16; protein examples from slide 15.',
  },
  {
    id: 'diag-protein-function-01',
    legacySourceId: 'R4_PROT_001',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Protein',
    concept: 'function',
    prompt:
      'A cell adds a biological catalyst, and a chemical reaction happens much faster. Which macromolecule category contains that catalyst?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Protein',
    evidenceQuestion: 'Which class-chart statement is the strongest evidence?',
    evidenceChoices: [
      'Enzymes speed up chemical reactions.',
      'The compound stores genetic information.',
      'The compound stores energy long term.',
      'The compound supplies immediate energy.',
    ],
    correctEvidence: 'Enzymes speed up chemical reactions.',
    misconceptionCode: 'protein-enzyme-function-confusion',
    repair: {
      title: 'Protein function check',
      reference: 'Enzymes are proteins that speed up chemical reactions.',
      explanation:
        'An enzyme is not an energy-storage molecule. Its reaction-speeding job is a protein clue in the Unit 2 chart.',
    },
    sourceNote: 'Unit 2 slides 11–16; enzyme function from slide 15.',
  },
  {
    id: 'diag-na-building-01',
    legacySourceId: 'R1_NA_001',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Nucleic Acid',
    concept: 'building-block',
    prompt:
      'A cell copies a molecule before division so biological instructions can pass to new cells. Which macromolecule is being copied?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Nucleic Acid',
    evidenceQuestion: 'Which building block is the key evidence?',
    evidenceChoices: ['Nucleotides', 'Amino acids', 'Simple sugars', 'Fatty acids'],
    correctEvidence: 'Nucleotides',
    misconceptionCode: 'nucleic-building-block-confusion',
    repair: {
      title: 'Nucleic-acid building-block check',
      reference: 'Nucleotides are the monomers of nucleic acids.',
      explanation:
        'Nucleotides carry the clue toward nucleic acids; amino acids instead build proteins.',
    },
    sourceNote: 'Unit 2 slides 11–16; nucleotide monomer from slide 16.',
  },
  {
    id: 'diag-na-elements-01',
    legacySourceId: 'R2_NA_002',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Nucleic Acid',
    concept: 'elements',
    prompt:
      'A molecule carries the coded instructions a cell uses to build other molecules. Which macromolecule best fits that role?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Nucleic Acid',
    evidenceQuestion: 'Which element pattern from the class chart supports this classification?',
    evidenceChoices: ['C, H, O, N, and P', 'C, H, O, and N', 'C, H, and O', 'N and P only'],
    correctEvidence: 'C, H, O, N, and P',
    misconceptionCode: 'nucleic-elements-missing-phosphorus',
    repair: {
      title: 'Nucleic-acid element check',
      reference: 'Nucleic acids contain carbon, hydrogen, oxygen, nitrogen, and phosphorus (CHONP).',
      explanation:
        'Phosphorus is the extra class-chart clue that separates CHONP from the CHON protein pattern.',
    },
    sourceNote: 'Unit 2 slides 11–16; nucleic-acid elements from slide 16.',
  },
  {
    id: 'diag-carb-elements-02',
    legacySourceId: 'R2_CARB_002',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Carbohydrate',
    concept: 'elements',
    prompt:
      'A biological compound is built from simple sugars and can supply energy right away. Which macromolecule best fits the combined clues?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Carbohydrate',
    evidenceQuestion: 'Which full element pattern does CHO represent?',
    evidenceChoices: ['Carbon, hydrogen, and oxygen', 'Carbon, hydrogen, oxygen, and nitrogen', 'Carbon, hydrogen, oxygen, nitrogen, and phosphorus', 'Nitrogen and phosphorus'],
    correctEvidence: 'Carbon, hydrogen, and oxygen',
    misconceptionCode: 'carb-elements-confused-with-chon',
    repair: {
      title: 'Carbohydrate element check',
      reference: 'Carbohydrates contain carbon, hydrogen, and oxygen (CHO).',
      explanation:
        'The simple-sugar and immediate-energy clues separate this CHO compound from lipids, which also use the CHO pattern in the class chart.',
    },
    sourceNote: 'Unit 2 slides 11–16; carbohydrate elements from slide 13.',
  },
  {
    id: 'diag-carb-example-02',
    legacySourceId: 'R3_CARB_002',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Carbohydrate',
    concept: 'example',
    prompt:
      'A student chooses a class-chart food for immediate energy. Which macromolecule does that food mostly represent?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Carbohydrate',
    evidenceQuestion: 'Which set contains only matching class-chart examples?',
    evidenceChoices: [
      'Bread, potatoes, vegetables, and sugars',
      'Fats, oils, waxes, and butter',
      'Nuts, meat, and beans',
      'DNA, RNA, and ATP',
    ],
    correctEvidence: 'Bread, potatoes, vegetables, and sugars',
    misconceptionCode: 'carb-food-example-confusion',
    repair: {
      title: 'Carbohydrate example check',
      reference: 'The Unit 2 chart lists breads, potatoes, vegetables, and sugars as carbohydrate examples.',
      explanation:
        'Foods contain mixtures. For this class model, bread and potatoes mostly represent the carbohydrate category.',
    },
    sourceNote: 'Unit 2 slides 11–16; carbohydrate examples from slide 13.',
  },
  {
    id: 'diag-lipid-function-02',
    legacySourceId: 'R1_LIPID_002',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Lipid',
    concept: 'function',
    prompt:
      'A biological compound is kept as an energy reserve and also helps form a cell boundary. Which macromolecule best fits the sample?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Lipid',
    evidenceQuestion: 'Which paired functions are the strongest evidence?',
    evidenceChoices: ['Long-term energy storage and membrane structure', 'Immediate energy and short-term plant storage', 'Genetic information and protein instructions', 'Enzyme action and antibody defense'],
    correctEvidence: 'Long-term energy storage and membrane structure',
    misconceptionCode: 'lipid-function-confused-with-quick-energy',
    repair: {
      title: 'Lipid function check',
      reference: 'Lipids store energy long term and help compose cell membranes.',
      explanation:
        'Energy for later and membrane structure point to lipids; immediate energy instead points to carbohydrates.',
    },
    sourceNote: 'Unit 2 slides 11–16; lipid functions from slide 14.',
  },
  {
    id: 'diag-lipid-building-02',
    legacySourceId: 'R1_LIPID_001',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Lipid',
    concept: 'building-block',
    prompt:
      'A lab breaks down an oily energy-reserve compound into smaller components. Which macromolecule is the lab examining?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Lipid',
    evidenceQuestion: 'Which building-block match is used in the Unit 2 class chart?',
    evidenceChoices: ['Fatty acids', 'Simple sugars', 'Amino acids', 'Nucleotides'],
    correctEvidence: 'Fatty acids',
    misconceptionCode: 'lipid-building-block-confusion',
    repair: {
      title: 'Lipid building-block check',
      reference: 'The Unit 2 chart uses fatty acids as the building-block clue for lipids.',
      explanation:
        'For this course model, match fatty acids with lipids rather than with the sugar, amino-acid, or nucleotide groups.',
    },
    sourceNote: 'Unit 2 slides 11–16; fatty-acid model from slide 14.',
  },
  {
    id: 'diag-protein-function-02',
    legacySourceId: 'R4_PROT_002',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Protein',
    concept: 'function',
    prompt:
      'An immune molecule attaches to a pathogen and helps neutralize it. Which macromolecule category contains that molecule?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Protein',
    evidenceQuestion: 'Which class-chart function is the strongest evidence?',
    evidenceChoices: ['Antibody defense against pathogens', 'Immediate energy for animals', 'Long-term energy storage', 'Storage of genetic information'],
    correctEvidence: 'Antibody defense against pathogens',
    misconceptionCode: 'protein-antibody-function-confusion',
    repair: {
      title: 'Protein function check',
      reference: 'Antibodies are proteins used by the immune system to neutralize pathogens.',
      explanation:
        'The immune-defense role is a protein clue; it is different from genetic-information storage.',
    },
    sourceNote: 'Unit 2 slides 11–16; antibody function from slide 15.',
  },
  {
    id: 'diag-protein-example-02',
    legacySourceId: 'R3_PROT_002',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Protein',
    concept: 'example',
    prompt:
      'A student chooses a class-chart food to support body growth and regulation. Which macromolecule does that food mostly represent?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Protein',
    evidenceQuestion: 'Which set contains only matching class-chart examples?',
    evidenceChoices: [
      'Nuts, meat, and beans',
      'Bread, potatoes, vegetables, and sugars',
      'Fats, oils, waxes, and butter',
      'DNA and RNA',
    ],
    correctEvidence: 'Nuts, meat, and beans',
    misconceptionCode: 'protein-food-example-confusion',
    repair: {
      title: 'Protein example check',
      reference: 'The Unit 2 chart lists nuts, meat, and beans as protein examples.',
      explanation:
        'Foods contain more than one nutrient. In this class model, these foods mostly represent the protein category.',
    },
    sourceNote: 'Unit 2 slides 11–16; protein examples from slide 15.',
  },
  {
    id: 'diag-na-elements-02',
    legacySourceId: 'R2_NA_002',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Nucleic Acid',
    concept: 'elements',
    prompt:
      'A molecule carries inherited instructions and is copied before cell division. Which macromolecule fits those observations?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Nucleic Acid',
    evidenceQuestion: 'Which element pattern from the class chart supports this classification?',
    evidenceChoices: ['C, H, O, N, and P', 'C, H, O, and N', 'C, H, and O', 'N and P only'],
    correctEvidence: 'C, H, O, N, and P',
    misconceptionCode: 'nucleic-elements-missing-phosphorus',
    repair: {
      title: 'Nucleic-acid element check',
      reference: 'Nucleic acids contain carbon, hydrogen, oxygen, nitrogen, and phosphorus (CHONP).',
      explanation:
        'Phosphorus is the extra class-chart clue that separates CHONP from the CHON protein pattern.',
    },
    sourceNote: 'Unit 2 slides 11–16; nucleic-acid elements from slide 16.',
  },
  {
    id: 'diag-na-building-02',
    legacySourceId: 'R1_NA_001',
    eligibleStages: ['diagnostic'],
    macromolecule: 'Nucleic Acid',
    concept: 'building-block',
    prompt:
      'A cell assembles a molecule that stores inherited instructions. Which macromolecule is being built?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Nucleic Acid',
    evidenceQuestion: 'Which building block is the key evidence?',
    evidenceChoices: ['Nucleotides', 'Amino acids', 'Simple sugars', 'Fatty acids'],
    correctEvidence: 'Nucleotides',
    misconceptionCode: 'nucleic-building-block-confusion',
    repair: {
      title: 'Nucleic-acid building-block check',
      reference: 'Nucleotides are the monomers of nucleic acids.',
      explanation:
        'Nucleotides identify nucleic acids; amino acids instead identify proteins.',
    },
    sourceNote: 'Unit 2 slides 11–16; nucleotide monomer from slide 16.',
  },
]

const transferCases: readonly DiagnosticCase[] = [
  {
    id: 'transfer-carb-starch-01',
    eligibleStages: ['transfer'],
    macromolecule: 'Carbohydrate',
    concept: 'function',
    prompt:
      'A potato plant stores extra sugar as starch for short-term use. Which macromolecule does this evidence support?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Carbohydrate',
    evidenceQuestion: 'Which clue best supports the classification?',
    evidenceChoices: [
      'Short-term energy storage in plants',
      'Long-term energy storage in animals',
      'Genetic instructions for cells',
      'Antibody defense',
    ],
    correctEvidence: 'Short-term energy storage in plants',
    misconceptionCode: 'transfer-carb-short-vs-long-storage',
    repair: {
      title: 'Carbohydrate transfer check',
      reference: 'Plants can store carbohydrate as starch for short-term energy use.',
      explanation: 'Short-term starch storage is the class-chart clue; long-term storage points to lipids.',
    },
    sourceNote: 'Unit 2 slides 11–16; plant starch function from slide 13.',
  },
  {
    id: 'transfer-carb-monosaccharide-02',
    eligibleStages: ['transfer'],
    macromolecule: 'Carbohydrate',
    concept: 'building-block',
    prompt:
      'A newly found compound is a chain made from many monosaccharide units. Which macromolecule should a student classify it as?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Carbohydrate',
    evidenceQuestion: 'Which translated term confirms the evidence?',
    evidenceChoices: ['Simple sugars', 'Amino acids', 'Fatty acids', 'Nucleotides'],
    correctEvidence: 'Simple sugars',
    misconceptionCode: 'transfer-carb-monomer-language',
    repair: {
      title: 'Carbohydrate transfer check',
      reference: 'Monosaccharide means simple sugar, the carbohydrate monomer in the Unit 2 chart.',
      explanation: 'Translate the scientific term before classifying: monosaccharide means simple sugar.',
    },
    sourceNote: 'Unit 2 slides 11–16; simple-sugar monomer from slide 13.',
  },
  {
    id: 'transfer-lipid-membrane-01',
    eligibleStages: ['transfer'],
    macromolecule: 'Lipid',
    concept: 'elements',
    prompt:
      'A compound helps form a cell’s flexible outer boundary. Which macromolecule category best fits that role?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Lipid',
    evidenceQuestion: 'Which class-chart element pattern also supports the classification?',
    evidenceChoices: [
      'C, H, and O',
      'C, H, O, and N',
      'C, H, O, N, and P',
      'N and P only',
    ],
    correctEvidence: 'C, H, and O',
    misconceptionCode: 'transfer-lipid-membrane-function',
    repair: {
      title: 'Lipid transfer check',
      reference: 'Lipids help compose the cell membrane and contain carbon, hydrogen, and oxygen in the Unit 2 chart.',
      explanation: 'The boundary role identifies the category; C, H, and O provide a separate supporting element match.',
    },
    sourceNote: 'Unit 2 slides 11–16; phospholipid-bilayer function from slide 14.',
  },
  {
    id: 'transfer-lipid-wax-02',
    eligibleStages: ['transfer'],
    macromolecule: 'Lipid',
    concept: 'example',
    prompt:
      'A water-resistant coating protects the surface of a leaf. Which macromolecule does the coating mostly represent in the class model?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Lipid',
    evidenceQuestion: 'Which evidence pair best supports the classification?',
    evidenceChoices: [
      'Wax and protection',
      'Sugar and immediate energy',
      'Nucleotide and genetic information',
      'Amino acid and enzyme action',
    ],
    correctEvidence: 'Wax and protection',
    misconceptionCode: 'transfer-lipid-wax-protection',
    repair: {
      title: 'Lipid transfer check',
      reference: 'Waxes are lipid examples, and protection is a lipid function in the Unit 2 chart.',
      explanation: 'This case gives both an example clue and a function clue that point to the same category.',
    },
    sourceNote: 'Unit 2 slides 11–16; wax example and protection function from slide 14.',
  },
  {
    id: 'transfer-protein-antibody-01',
    eligibleStages: ['transfer'],
    macromolecule: 'Protein',
    concept: 'building-block',
    prompt:
      'The immune system makes an antibody that neutralizes a pathogen. Which macromolecule is the antibody?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Protein',
    evidenceQuestion: 'Which building blocks should this molecule contain?',
    evidenceChoices: [
      'Amino acids',
      'Fatty acids',
      'Simple sugars',
      'Nucleotides',
    ],
    correctEvidence: 'Amino acids',
    misconceptionCode: 'transfer-protein-antibody-function',
    repair: {
      title: 'Protein transfer check',
      reference: 'Antibodies are protein examples, and proteins are built from amino acids.',
      explanation: 'The antibody role identifies the category; amino acids provide a separate building-block match.',
    },
    sourceNote: 'Unit 2 slides 11–16; antibody function from slide 15.',
  },
  {
    id: 'transfer-protein-hormone-02',
    eligibleStages: ['transfer'],
    macromolecule: 'Protein',
    concept: 'building-block',
    prompt:
      'A hormone coordinates activities in the body. Which macromolecule category best fits that role?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Protein',
    evidenceQuestion: 'Which building blocks should the hormone contain in this class model?',
    evidenceChoices: [
      'Amino acids',
      'Fatty acids',
      'Nucleotides',
      'Simple sugars',
    ],
    correctEvidence: 'Amino acids',
    misconceptionCode: 'transfer-protein-hormone-amino-acids',
    repair: {
      title: 'Protein transfer check',
      reference: 'The Unit 2 chart connects hormonal proteins with coordinating body activities and identifies amino acids as protein monomers.',
      explanation: 'Two independent clues—job and building block—support the same classification.',
    },
    sourceNote: 'Unit 2 slides 11–16; hormonal proteins and amino acids from slide 15.',
  },
  {
    id: 'transfer-na-instructions-01',
    eligibleStages: ['transfer'],
    macromolecule: 'Nucleic Acid',
    concept: 'example',
    prompt:
      'A molecule carries the coded instructions a cell uses to build proteins. Which macromolecule category does it belong to?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Nucleic Acid',
    evidenceQuestion: 'Which pair is listed as matching examples in the class chart?',
    evidenceChoices: [
      'DNA and RNA',
      'Fats and waxes',
      'Meat and beans',
      'Bread and sugars',
    ],
    correctEvidence: 'DNA and RNA',
    misconceptionCode: 'transfer-nucleic-instructions-vs-product',
    repair: {
      title: 'Nucleic-acid transfer check',
      reference: 'Nucleic acids provide the instructions for building proteins.',
      explanation: 'Classify the instruction-carrying molecule, not the protein product made from its instructions.',
    },
    sourceNote: 'Unit 2 slides 11–16; protein-building instructions from slide 16.',
  },
  {
    id: 'transfer-na-phosphorus-02',
    eligibleStages: ['transfer'],
    macromolecule: 'Nucleic Acid',
    concept: 'function',
    prompt:
      'DNA isolated from cheek cells belongs to which macromolecule category?',
    macroChoices: ALL_MACRO_CHOICES,
    correctMacro: 'Nucleic Acid',
    evidenceQuestion: 'Which class-chart function best supports the classification?',
    evidenceChoices: ['Carries genetic instructions', 'Insulates and protects', 'Speeds up reactions', 'Provides immediate energy'],
    correctEvidence: 'Carries genetic instructions',
    misconceptionCode: 'transfer-nucleic-phosphorus-clue',
    repair: {
      title: 'Nucleic-acid transfer check',
      reference: 'DNA is a nucleic acid that carries genetic instructions.',
      explanation: 'The DNA example identifies the category; carrying genetic instructions provides the supporting function.',
    },
    sourceNote: 'Unit 2 slides 11–16; CHONP pattern from slide 16.',
  },
]

export const CASE_BANK: readonly DiagnosticCase[] = [TUTORIAL_CASE, ...diagnosticCases, ...transferCases]

const DIAGNOSTIC_BLUEPRINTS = [
  [
    'diag-carb-elements-01',
    'diag-carb-example-01',
    'diag-lipid-function-01',
    'diag-lipid-building-01',
    'diag-protein-example-01',
    'diag-protein-function-01',
    'diag-na-building-01',
    'diag-na-elements-01',
  ],
  [
    'diag-carb-elements-02',
    'diag-carb-example-02',
    'diag-lipid-function-02',
    'diag-lipid-building-02',
    'diag-protein-function-02',
    'diag-protein-example-02',
    'diag-na-elements-02',
    'diag-na-building-02',
  ],
] as const

const TRANSFER_IDS_BY_MACRO: Readonly<Record<Macromolecule, readonly string[]>> = {
  Carbohydrate: ['transfer-carb-starch-01', 'transfer-carb-monosaccharide-02'],
  Lipid: ['transfer-lipid-membrane-01', 'transfer-lipid-wax-02'],
  Protein: ['transfer-protein-antibody-01', 'transfer-protein-hormone-02'],
  'Nucleic Acid': ['transfer-na-instructions-01', 'transfer-na-phosphorus-02'],
}

const EXPECTED_DIAGNOSTIC_CONCEPTS: Readonly<Record<Macromolecule, readonly EvidenceConcept[]>> = {
  Carbohydrate: ['elements', 'example'],
  Lipid: ['building-block', 'function'],
  Protein: ['function', 'example'],
  'Nucleic Acid': ['elements', 'building-block'],
}

const ANSWER_LABEL_PATTERNS: Readonly<Record<Macromolecule, RegExp>> = {
  Carbohydrate: /carbohydrate/i,
  Lipid: /lipid/i,
  Protein: /protein/i,
  'Nucleic Acid': /nucleic[\s-]*acid/i,
}

const CASES_BY_ID = new Map(CASE_BANK.map((item) => [item.id, item]))

export function getCaseById(id: string): DiagnosticCase | undefined {
  return CASES_BY_ID.get(id)
}

function normalizeSeed(seed: number): number {
  return Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 0
}

function seededRandom(seed: number): () => number {
  let state = normalizeSeed(seed)
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export type AttemptCaseSelection = Readonly<{
  diagnosticCaseIds: readonly string[]
  transferCaseIds: readonly string[]
}>

export function buildAttemptCaseSelection(seed: number): AttemptCaseSelection {
  const normalizedSeed = normalizeSeed(seed)
  const blueprint = DIAGNOSTIC_BLUEPRINTS[normalizedSeed % DIAGNOSTIC_BLUEPRINTS.length]
  const diagnosticCaseIds = shuffled(blueprint, seededRandom(normalizedSeed ^ 0x4d414352))

  const transferCaseIds = MACROMOLECULES.map((macromolecule, macroIndex) => {
    const candidates = TRANSFER_IDS_BY_MACRO[macromolecule]
    return candidates[(normalizedSeed + macroIndex) % candidates.length]
  })

  return {
    diagnosticCaseIds,
    transferCaseIds: shuffled(transferCaseIds, seededRandom(normalizedSeed ^ 0x5452414e)),
  }
}

export type CaseBankValidation = Readonly<{
  valid: boolean
  errors: readonly string[]
}>

function countsBy<T extends string>(values: readonly T[]): Map<T, number> {
  const counts = new Map<T, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return counts
}

export function validateCaseBank(cases: readonly DiagnosticCase[] = CASE_BANK): CaseBankValidation {
  const errors: string[] = []
  const ids = new Set<string>()

  for (const item of cases) {
    if (ids.has(item.id)) errors.push(`Duplicate case id: ${item.id}`)
    ids.add(item.id)

    if (!item.macroChoices.includes(item.correctMacro)) {
      errors.push(`${item.id}: correct macromolecule is missing from macroChoices`)
    }
    if (new Set(item.macroChoices).size !== item.macroChoices.length) {
      errors.push(`${item.id}: macroChoices contains duplicates`)
    }
    if (!item.evidenceChoices.includes(item.correctEvidence)) {
      errors.push(`${item.id}: correct evidence is missing from evidenceChoices`)
    }
    if (new Set(item.evidenceChoices).size !== item.evidenceChoices.length) {
      errors.push(`${item.id}: evidenceChoices contains duplicates`)
    }
    if (item.eligibleStages.length === 0) {
      errors.push(`${item.id}: no eligible stage`)
    }

    const isHiddenAnswerStage = item.eligibleStages.includes('diagnostic') || item.eligibleStages.includes('transfer')
    if (isHiddenAnswerStage) {
      const answerPattern = ANSWER_LABEL_PATTERNS[item.correctMacro]
      if (answerPattern.test(item.prompt) || answerPattern.test(item.evidenceQuestion)) {
        errors.push(`${item.id}: prompt text reveals the correct macromolecule`)
      }
      if (item.prompt.toLocaleLowerCase().includes(item.correctEvidence.toLocaleLowerCase())) {
        errors.push(`${item.id}: prompt text copies the correct evidence response`)
      }
    }
  }

  if (cases === CASE_BANK) {
    for (const [blueprintIndex, blueprint] of DIAGNOSTIC_BLUEPRINTS.entries()) {
      const selected = blueprint.map((id) => getCaseById(id))
      if (selected.some((item) => item === undefined)) {
        errors.push(`Diagnostic blueprint ${blueprintIndex} references a missing case`)
        continue
      }

      const complete = selected as DiagnosticCase[]
      const macroCounts = countsBy(complete.map((item) => item.macromolecule))
      const conceptCounts = countsBy(complete.map((item) => item.concept))

      for (const macromolecule of MACROMOLECULES) {
        if (macroCounts.get(macromolecule) !== 2) {
          errors.push(`Diagnostic blueprint ${blueprintIndex} must include two ${macromolecule} cases`)
        }
        const actualConcepts = complete
          .filter((item) => item.macromolecule === macromolecule)
          .map((item) => item.concept)
          .sort()
        const expectedConcepts = [...EXPECTED_DIAGNOSTIC_CONCEPTS[macromolecule]].sort()
        if (actualConcepts.join('|') !== expectedConcepts.join('|')) {
          errors.push(
            `Diagnostic blueprint ${blueprintIndex} has the wrong evidence matrix for ${macromolecule}`,
          )
        }
      }
      for (const concept of EVIDENCE_CONCEPTS) {
        if (conceptCounts.get(concept) !== 2) {
          errors.push(`Diagnostic blueprint ${blueprintIndex} must include concept ${concept} exactly twice`)
        }
      }
    }

    for (const macromolecule of MACROMOLECULES) {
      for (const id of TRANSFER_IDS_BY_MACRO[macromolecule]) {
        const item = getCaseById(id)
        if (!item || item.macromolecule !== macromolecule || !item.eligibleStages.includes('transfer')) {
          errors.push(`Transfer pool for ${macromolecule} contains invalid id ${id}`)
        }
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

export function summarizeSelectionConcepts(caseIds: readonly string[]): Readonly<Record<EvidenceConcept, number>> {
  const summary = Object.fromEntries(EVIDENCE_CONCEPTS.map((concept) => [concept, 0])) as Record<
    EvidenceConcept,
    number
  >
  for (const id of caseIds) {
    const item = getCaseById(id)
    if (item) summary[item.concept] += 1
  }
  return summary
}

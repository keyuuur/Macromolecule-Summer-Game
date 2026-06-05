function getConfigDefaults_() {
  return [
    ['game_title', APP_TITLE, 'Display title'],
    ['target_correct', '32', 'Total correct answers needed for 100 percent'],
    ['correct_per_round', '8', 'Correct answers needed to finish each round'],
    ['assignment_points', '100', 'Canvas-ready points if needed later'],
    ['allow_review_chart', 'TRUE', 'Students can open the review chart during the game'],
    ['allow_replay', 'TRUE', 'Students can play again'],
    ['theme_level', 'light-medium', 'Pirate theme should stay playful but not distracting'],
    ['question_bank_version', '1', 'Increase this if the question bank changes a lot']
  ];
}

function getRoundInfo_() {
  return [
    {
      id: 1,
      name: 'Sort the Clue',
      intro: 'Round 1: Sort the Clue. Read each clue and choose the macromolecule it describes.'
    },
    {
      id: 2,
      name: 'Build the Macromolecule',
      intro: 'Round 2: Build the Macromolecule. Choose the facts that belong with the macromolecule shown.'
    },
    {
      id: 3,
      name: 'Real-World Examples',
      intro: 'Round 3: Real-World Examples. Choose which macromolecule matches the food or example.'
    },
    {
      id: 4,
      name: 'Application Challenge',
      intro: 'Round 4: Application Challenge. Use what you know to answer short real-life biology questions.'
    }
  ];
}

function getReviewChartData_() {
  return [
    {
      macromolecule: 'Carbohydrates',
      elements: 'C, H, O',
      buildingBlock: 'Simple sugars',
      jobs: 'Immediate energy; short-term energy in plants',
      examples: 'Bread, pasta, sugars'
    },
    {
      macromolecule: 'Lipids',
      elements: 'C, H, O',
      buildingBlock: 'Fatty acids',
      jobs: 'Long-term energy; insulation; protection',
      examples: 'Fats, oils, butter'
    },
    {
      macromolecule: 'Proteins',
      elements: 'C, H, O, N',
      buildingBlock: 'Amino acids',
      jobs: 'Build muscle; enzymes; antibodies',
      examples: 'Meat, nuts, beans'
    },
    {
      macromolecule: 'Nucleic Acids',
      elements: 'C, H, O, N, P',
      buildingBlock: 'Nucleotides',
      jobs: 'Genetic information; instructions for proteins',
      examples: 'DNA, RNA'
    }
  ];
}

function getSeedQuestionRows_() {
  var options = ['Carbohydrates', 'Lipids', 'Proteins', 'Nucleic Acids'];
  var rows = [];

  addQuestion_(rows, 'R1_CARB_001', 1, 'Sort the Clue', 'single_choice', 'monomer', 'Carbohydrates', 'This macromolecule is made from simple sugars.', options, ['Carbohydrates'], 'Carbohydrates are made from simple sugars.', 'easy', 'carbohydrates,building-block');
  addQuestion_(rows, 'R1_CARB_002', 1, 'Sort the Clue', 'single_choice', 'function', 'Carbohydrates', 'This macromolecule gives animals quick energy.', options, ['Carbohydrates'], 'Carbohydrates are used for immediate energy.', 'easy', 'carbohydrates,function');
  addQuestion_(rows, 'R1_CARB_003', 1, 'Sort the Clue', 'single_choice', 'example', 'Carbohydrates', 'Bread, pasta, and sugars are examples of this macromolecule.', options, ['Carbohydrates'], 'Bread, pasta, and sugars are carbohydrate examples in our class chart.', 'easy', 'carbohydrates,example');
  addQuestion_(rows, 'R1_LIPID_001', 1, 'Sort the Clue', 'single_choice', 'monomer', 'Lipids', 'This macromolecule is built from fatty acids.', options, ['Lipids'], 'Lipids are built from fatty acids in our class chart.', 'easy', 'lipids,building-block');
  addQuestion_(rows, 'R1_LIPID_002', 1, 'Sort the Clue', 'single_choice', 'function', 'Lipids', 'This macromolecule is used for long-term energy storage.', options, ['Lipids'], 'Lipids store energy long term.', 'easy', 'lipids,function');
  addQuestion_(rows, 'R1_LIPID_003', 1, 'Sort the Clue', 'single_choice', 'example', 'Lipids', 'Fats, oils, and butter are examples of this macromolecule.', options, ['Lipids'], 'Fats, oils, and butter are lipid examples.', 'easy', 'lipids,example');
  addQuestion_(rows, 'R1_PROT_001', 1, 'Sort the Clue', 'single_choice', 'monomer', 'Proteins', 'This macromolecule is made from amino acids.', options, ['Proteins'], 'Proteins are made from amino acids.', 'easy', 'proteins,building-block');
  addQuestion_(rows, 'R1_PROT_002', 1, 'Sort the Clue', 'single_choice', 'function', 'Proteins', 'This macromolecule helps build muscle.', options, ['Proteins'], 'Proteins help build muscle.', 'easy', 'proteins,function');
  addQuestion_(rows, 'R1_PROT_003', 1, 'Sort the Clue', 'single_choice', 'function', 'Proteins', 'Enzymes belong to this macromolecule group.', options, ['Proteins'], 'Enzymes are proteins that speed up reactions.', 'easy', 'proteins,enzymes');
  addQuestion_(rows, 'R1_PROT_004', 1, 'Sort the Clue', 'single_choice', 'function', 'Proteins', 'Antibodies belong to this macromolecule group.', options, ['Proteins'], 'Antibodies are proteins that help fight pathogens.', 'easy', 'proteins,antibodies');
  addQuestion_(rows, 'R1_NA_001', 1, 'Sort the Clue', 'single_choice', 'monomer', 'Nucleic Acids', 'This macromolecule is made from nucleotides.', options, ['Nucleic Acids'], 'Nucleic acids are made from nucleotides.', 'easy', 'nucleic-acids,building-block');
  addQuestion_(rows, 'R1_NA_002', 1, 'Sort the Clue', 'single_choice', 'example', 'Nucleic Acids', 'DNA and RNA are examples of this macromolecule.', options, ['Nucleic Acids'], 'DNA and RNA are nucleic acids.', 'easy', 'nucleic-acids,example');
  addQuestion_(rows, 'R1_NA_003', 1, 'Sort the Clue', 'single_choice', 'function', 'Nucleic Acids', 'This macromolecule stores genetic information.', options, ['Nucleic Acids'], 'Nucleic acids store genetic information.', 'easy', 'nucleic-acids,function');

  addQuestion_(rows, 'R2_CARB_001', 2, 'Build the Macromolecule', 'multi_select', 'mixed', 'Carbohydrates', 'Build Carbohydrates. Select all clues that belong with carbohydrates.', ['Simple sugars', 'Immediate energy', 'Bread and pasta', 'Fatty acids', 'Amino acids', 'DNA and RNA'], ['Simple sugars', 'Immediate energy', 'Bread and pasta'], 'Carbohydrates are made from simple sugars and are used for immediate energy.', 'easy', 'carbohydrates,mixed');
  addQuestion_(rows, 'R2_CARB_002', 2, 'Build the Macromolecule', 'multi_select', 'elements', 'Carbohydrates', 'Which elements make up carbohydrates?', ['Carbon', 'Hydrogen', 'Oxygen', 'Nitrogen', 'Phosphorus'], ['Carbon', 'Hydrogen', 'Oxygen'], 'Carbohydrates contain carbon, hydrogen, and oxygen.', 'easy', 'carbohydrates,elements');
  addQuestion_(rows, 'R2_LIPID_001', 2, 'Build the Macromolecule', 'multi_select', 'mixed', 'Lipids', 'Build Lipids. Select all clues that belong with lipids.', ['Fatty acids', 'Long-term energy', 'Insulation', 'Fats and oils', 'Simple sugars', 'DNA'], ['Fatty acids', 'Long-term energy', 'Insulation', 'Fats and oils'], 'Lipids include fats and oils and store long-term energy.', 'easy', 'lipids,mixed');
  addQuestion_(rows, 'R2_LIPID_002', 2, 'Build the Macromolecule', 'multi_select', 'elements', 'Lipids', 'Which elements make up lipids?', ['Carbon', 'Hydrogen', 'Oxygen', 'Nitrogen', 'Phosphorus'], ['Carbon', 'Hydrogen', 'Oxygen'], 'Lipids contain carbon, hydrogen, and oxygen in our class chart.', 'easy', 'lipids,elements');
  addQuestion_(rows, 'R2_PROT_001', 2, 'Build the Macromolecule', 'multi_select', 'mixed', 'Proteins', 'Build Proteins. Select all clues that belong with proteins.', ['Amino acids', 'Builds muscle', 'Enzymes', 'Antibodies', 'Simple sugars', 'Fats and oils'], ['Amino acids', 'Builds muscle', 'Enzymes', 'Antibodies'], 'Proteins are made of amino acids and include enzymes and antibodies.', 'easy', 'proteins,mixed');
  addQuestion_(rows, 'R2_PROT_002', 2, 'Build the Macromolecule', 'multi_select', 'elements', 'Proteins', 'Which elements make up proteins?', ['Carbon', 'Hydrogen', 'Oxygen', 'Nitrogen', 'Phosphorus'], ['Carbon', 'Hydrogen', 'Oxygen', 'Nitrogen'], 'Proteins contain carbon, hydrogen, oxygen, and nitrogen.', 'easy', 'proteins,elements');
  addQuestion_(rows, 'R2_NA_001', 2, 'Build the Macromolecule', 'multi_select', 'mixed', 'Nucleic Acids', 'Build Nucleic Acids. Select all clues that belong with nucleic acids.', ['Nucleotides', 'DNA', 'RNA', 'Genetic information', 'Fatty acids', 'Builds muscle'], ['Nucleotides', 'DNA', 'RNA', 'Genetic information'], 'Nucleic acids include DNA and RNA and store genetic information.', 'easy', 'nucleic-acids,mixed');
  addQuestion_(rows, 'R2_NA_002', 2, 'Build the Macromolecule', 'multi_select', 'elements', 'Nucleic Acids', 'Which elements make up nucleic acids?', ['Carbon', 'Hydrogen', 'Oxygen', 'Nitrogen', 'Phosphorus'], ['Carbon', 'Hydrogen', 'Oxygen', 'Nitrogen', 'Phosphorus'], 'Nucleic acids contain carbon, hydrogen, oxygen, nitrogen, and phosphorus.', 'easy', 'nucleic-acids,elements');
  addQuestion_(rows, 'R2_MIX_001', 2, 'Build the Macromolecule', 'multi_select', 'monomer', 'Mixed', 'Select the building blocks from the list.', ['Simple sugars', 'Fatty acids', 'Amino acids', 'Nucleotides', 'Bread', 'Butter', 'Meat'], ['Simple sugars', 'Fatty acids', 'Amino acids', 'Nucleotides'], 'These are the building blocks from the four macromolecule groups.', 'medium', 'mixed,building-block');
  addQuestion_(rows, 'R2_MIX_002', 2, 'Build the Macromolecule', 'multi_select', 'example', 'Mixed', 'Select only examples of lipids.', ['Fats', 'Oils', 'Butter', 'Bread', 'Pasta', 'DNA'], ['Fats', 'Oils', 'Butter'], 'Fats, oils, and butter are lipid examples.', 'easy', 'lipids,example');
  addQuestion_(rows, 'R2_MIX_003', 2, 'Build the Macromolecule', 'multi_select', 'function', 'Mixed', 'Select only protein clues.', ['Builds muscle', 'Makes enzymes', 'Makes antibodies', 'Long-term energy storage', 'Genetic information'], ['Builds muscle', 'Makes enzymes', 'Makes antibodies'], 'Proteins build muscle and include enzymes and antibodies.', 'medium', 'proteins,function');
  addQuestion_(rows, 'R2_MIX_004', 2, 'Build the Macromolecule', 'multi_select', 'example', 'Mixed', 'Select only examples of carbohydrates.', ['Bread', 'Pasta', 'Sugars', 'Butter', 'Oil', 'RNA'], ['Bread', 'Pasta', 'Sugars'], 'Bread, pasta, and sugars are carbohydrate examples in our class chart.', 'easy', 'carbohydrates,example');

  addQuestion_(rows, 'R3_CARB_001', 3, 'Real-World Examples', 'single_choice', 'example', 'Carbohydrates', 'A student eats pasta before practice for quick energy. Which macromolecule is this mostly showing?', options, ['Carbohydrates'], 'Pasta is most connected to carbohydrates and quick energy.', 'easy', 'carbohydrates,application');
  addQuestion_(rows, 'R3_CARB_002', 3, 'Real-World Examples', 'single_choice', 'example', 'Carbohydrates', 'Bread is most connected to which macromolecule in our class chart?', options, ['Carbohydrates'], 'Bread is a carbohydrate example in our class chart.', 'easy', 'carbohydrates,example');
  addQuestion_(rows, 'R3_CARB_003', 3, 'Real-World Examples', 'single_choice', 'example', 'Carbohydrates', 'Sugars are examples of which macromolecule?', options, ['Carbohydrates'], 'Sugars are carbohydrates.', 'easy', 'carbohydrates,example');
  addQuestion_(rows, 'R3_LIPID_001', 3, 'Real-World Examples', 'single_choice', 'example', 'Lipids', 'Butter is most connected to which macromolecule?', options, ['Lipids'], 'Butter is a lipid example.', 'easy', 'lipids,example');
  addQuestion_(rows, 'R3_LIPID_002', 3, 'Real-World Examples', 'single_choice', 'example', 'Lipids', 'Oils are examples of which macromolecule?', options, ['Lipids'], 'Oils are lipids.', 'easy', 'lipids,example');
  addQuestion_(rows, 'R3_LIPID_003', 3, 'Real-World Examples', 'single_choice', 'application', 'Lipids', 'An animal stores fat to use energy later. Which macromolecule is involved?', options, ['Lipids'], 'Lipids are used for long-term energy storage.', 'easy', 'lipids,application');
  addQuestion_(rows, 'R3_PROT_001', 3, 'Real-World Examples', 'single_choice', 'example', 'Proteins', 'Meat is most connected to which macromolecule in our class chart?', options, ['Proteins'], 'Meat is a protein example in our class chart.', 'easy', 'proteins,example');
  addQuestion_(rows, 'R3_PROT_002', 3, 'Real-World Examples', 'single_choice', 'example', 'Proteins', 'Nuts and beans are most connected to which macromolecule in our class chart?', options, ['Proteins'], 'Nuts and beans can be protein examples.', 'easy', 'proteins,example');
  addQuestion_(rows, 'R3_PROT_003', 3, 'Real-World Examples', 'single_choice', 'application', 'Proteins', 'A person is trying to build muscle after workouts. Which macromolecule is most connected to muscle building?', options, ['Proteins'], 'Proteins help build muscle.', 'easy', 'proteins,application');
  addQuestion_(rows, 'R3_NA_001', 3, 'Real-World Examples', 'single_choice', 'example', 'Nucleic Acids', 'DNA is an example of which macromolecule?', options, ['Nucleic Acids'], 'DNA is a nucleic acid.', 'easy', 'nucleic-acids,example');
  addQuestion_(rows, 'R3_NA_002', 3, 'Real-World Examples', 'single_choice', 'example', 'Nucleic Acids', 'RNA is an example of which macromolecule?', options, ['Nucleic Acids'], 'RNA is a nucleic acid.', 'easy', 'nucleic-acids,example');
  addQuestion_(rows, 'R3_NA_003', 3, 'Real-World Examples', 'single_choice', 'application', 'Nucleic Acids', 'A molecule carries genetic instructions. Which macromolecule group does it belong to?', options, ['Nucleic Acids'], 'Nucleic acids store genetic information.', 'easy', 'nucleic-acids,application');

  addQuestion_(rows, 'R4_CARB_001', 4, 'Application Challenge', 'single_choice', 'application', 'Carbohydrates', 'A runner needs quick energy before a race. Which macromolecule would be most useful?', options, ['Carbohydrates'], 'Carbohydrates provide quick energy.', 'easy', 'carbohydrates,application');
  addQuestion_(rows, 'R4_CARB_002', 4, 'Application Challenge', 'single_choice', 'application', 'Carbohydrates', 'A plant stores extra sugar as starch. Starch is connected to which macromolecule?', options, ['Carbohydrates'], 'Starch is a carbohydrate used for short-term energy storage in plants.', 'easy', 'carbohydrates,application');
  addQuestion_(rows, 'R4_LIPID_001', 4, 'Application Challenge', 'single_choice', 'application', 'Lipids', 'An animal needs stored energy for later. Which macromolecule is best for long-term storage?', options, ['Lipids'], 'Lipids store energy long term.', 'easy', 'lipids,application');
  addQuestion_(rows, 'R4_LIPID_002', 4, 'Application Challenge', 'single_choice', 'application', 'Lipids', 'A layer of fat helps protect and insulate an animal. Which macromolecule is involved?', options, ['Lipids'], 'Lipids help with insulation and protection.', 'easy', 'lipids,application');
  addQuestion_(rows, 'R4_PROT_001', 4, 'Application Challenge', 'single_choice', 'application', 'Proteins', 'A cell needs an enzyme to speed up a chemical reaction. Which macromolecule is the enzyme?', options, ['Proteins'], 'Enzymes are proteins.', 'easy', 'proteins,application');
  addQuestion_(rows, 'R4_PROT_002', 4, 'Application Challenge', 'single_choice', 'application', 'Proteins', 'The immune system uses antibodies to fight pathogens. Which macromolecule are antibodies?', options, ['Proteins'], 'Antibodies are proteins.', 'easy', 'proteins,application');
  addQuestion_(rows, 'R4_PROT_003', 4, 'Application Challenge', 'single_choice', 'application', 'Proteins', 'A cell needs amino acids to build a molecule. Which macromolecule is being built?', options, ['Proteins'], 'Amino acids build proteins.', 'easy', 'proteins,application');
  addQuestion_(rows, 'R4_NA_001', 4, 'Application Challenge', 'single_choice', 'application', 'Nucleic Acids', 'A cell needs instructions for building proteins. Which macromolecule stores those instructions?', options, ['Nucleic Acids'], 'Nucleic acids store instructions for building proteins.', 'easy', 'nucleic-acids,application');
  addQuestion_(rows, 'R4_NA_002', 4, 'Application Challenge', 'single_choice', 'application', 'Nucleic Acids', 'A molecule is made of nucleotides and includes DNA. Which macromolecule group is it?', options, ['Nucleic Acids'], 'DNA is a nucleic acid made of nucleotides.', 'easy', 'nucleic-acids,application');
  addQuestion_(rows, 'R4_MIX_001', 4, 'Application Challenge', 'multi_select', 'application', 'Mixed', 'A student wants to sort foods by macromolecule. Select the carbohydrate examples from our class chart.', ['Bread', 'Pasta', 'Sugars', 'Butter', 'Oil', 'DNA'], ['Bread', 'Pasta', 'Sugars'], 'Bread, pasta, and sugars are carbohydrate examples in our class chart.', 'medium', 'carbohydrates,application');
  addQuestion_(rows, 'R4_MIX_002', 4, 'Application Challenge', 'multi_select', 'application', 'Mixed', 'A student wants to sort foods by macromolecule. Select the lipid examples.', ['Fats', 'Oils', 'Butter', 'Bread', 'Pasta', 'RNA'], ['Fats', 'Oils', 'Butter'], 'Fats, oils, and butter are lipids.', 'medium', 'lipids,application');
  addQuestion_(rows, 'R4_MIX_003', 4, 'Application Challenge', 'multi_select', 'application', 'Mixed', 'A student wants to sort protein clues. Select the protein clues.', ['Amino acids', 'Enzymes', 'Antibodies', 'Builds muscle', 'Fatty acids', 'DNA'], ['Amino acids', 'Enzymes', 'Antibodies', 'Builds muscle'], 'Proteins are made of amino acids and include enzymes and antibodies.', 'medium', 'proteins,application');

  return rows;
}

function addQuestion_(rows, cardId, roundId, roundName, interactionType, skillType, target, prompt, options, correct, explanation, difficulty, tags) {
  rows.push([
    cardId,
    'TRUE',
    roundId,
    roundName,
    interactionType,
    skillType,
    target,
    prompt,
    JSON.stringify(options),
    JSON.stringify(correct),
    explanation,
    difficulty,
    tags
  ]);
}

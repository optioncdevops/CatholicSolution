export type ContentResource = {
  id: string;
  posted: string;
  title: string;
  displayTitle: string;
  subtitle: string;
};

export const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
] as const;

export const categories = [
  'Fill-in-the-Blanks',
  'Popes',
  'Prayers',
  'Seasons and Feasts',
  'Spelling Activities',
  'Word Scramblers',
  'Workbooks',
  'Writing Papers',
  'The Pontifical Mission Societies USA',
] as const;

export const contentResources: ContentResource[] = [
  { id:'aug-01-color', posted:'08/01/2026', title:'Saint Alphonsus Maria de Liguori (Coloring Page)', displayTitle:'SAINT ALPHONSUS MARIA DE LIGUORI', subtitle:'Feast Day — August 1' },
  { id:'aug-01-student', posted:'08/01/2026', title:'Saint Alphonsus Maria de Liguori (Word Search - Student)', displayTitle:'SAINT ALPHONSUS — WORD SEARCH', subtitle:'Student Edition' },
  { id:'aug-01-teacher', posted:'08/01/2026', title:'Saint Alphonsus Maria de Liguori (Word Search - Teacher)', displayTitle:'SAINT ALPHONSUS — WORD SEARCH', subtitle:'Teacher Edition' },
  { id:'aug-02-color', posted:'08/02/2026', title:'Saint Eusebius of Vercelli (Coloring Page)', displayTitle:'SAINT EUSEBIUS OF VERCELLI', subtitle:'Feast Day — August 2' },
  { id:'aug-02-student', posted:'08/02/2026', title:'Saint Eusebius of Vercelli (Word Search - Student)', displayTitle:'SAINT EUSEBIUS — WORD SEARCH', subtitle:'Student Edition' },
  { id:'aug-02-teacher', posted:'08/02/2026', title:'Saint Eusebius of Vercelli (Word Search - Teacher)', displayTitle:'SAINT EUSEBIUS — WORD SEARCH', subtitle:'Teacher Edition' },
  { id:'aug-03-color', posted:'08/03/2026', title:'Saint Peter of Anagni (Coloring Page)', displayTitle:'SAINT PETER OF ANAGNI', subtitle:'Feast Day — August 3' },
  { id:'aug-03-student', posted:'08/03/2026', title:'Saint Peter of Anagni (Word Search - Student)', displayTitle:'SAINT PETER — WORD SEARCH', subtitle:'Student Edition' },
  { id:'aug-03-teacher', posted:'08/03/2026', title:'Saint Peter of Anagni (Word Search - Teacher)', displayTitle:'SAINT PETER — WORD SEARCH', subtitle:'Teacher Edition' },
  { id:'aug-04-color', posted:'08/04/2026', title:'Saint John Mary Vianney (Coloring Page)', displayTitle:'SAINT JOHN MARY VIANNEY', subtitle:'Feast Day — August 4' },
  { id:'aug-04-student', posted:'08/04/2026', title:'Saint John Mary Vianney (Word Search - Student)', displayTitle:'SAINT JOHN VIANNEY — WORD SEARCH', subtitle:'Student Edition' },
  { id:'aug-04-teacher', posted:'08/04/2026', title:'Saint John Mary Vianney (Word Search - Teacher)', displayTitle:'SAINT JOHN VIANNEY — WORD SEARCH', subtitle:'Teacher Edition' },
  { id:'aug-05-color', posted:'08/05/2026', title:'Saint Afra (Coloring Page)', displayTitle:'SAINT AFRA', subtitle:'Feast Day — August 5' },
  { id:'aug-05-student', posted:'08/05/2026', title:'Saint Afra (Word Search - Student)', displayTitle:'SAINT AFRA — WORD SEARCH', subtitle:'Student Edition' },
  { id:'aug-05-teacher', posted:'08/05/2026', title:'Saint Afra (Word Search - Teacher)', displayTitle:'SAINT AFRA — WORD SEARCH', subtitle:'Teacher Edition' },
  { id:'aug-06-color', posted:'08/06/2026', title:'Saint Hormisdas, Pope (Coloring Page)', displayTitle:'SAINT HORMISDAS, POPE', subtitle:'Feast Day — August 6' },
];

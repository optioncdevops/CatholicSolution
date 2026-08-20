export type ClassRecord = {
  id: string;
  name: string;
  section: string;
  course: string;
  teacher: string;
  enrollment: number;
  skills: number;
  homeroom: boolean;
  reportCards: boolean;
  progressReport: boolean;
  grade: string;
};

export type LessonRecord = {
  id: string;
  title: string;
  unit: string;
  course: string;
  grade: string;
  teacher: string;
  startDate: string;
  endDate: string;
  weekStart: string;
  duration: number;
  status: 'Draft' | 'Ready' | 'Shared';
  prepared: boolean;
};

export type UnitPlanRecord = {
  id: string;
  title: string;
  course: string;
  grade: string;
  dateRange: string;
  lessons: Array<{ id: string; title: string; date: string; status: 'Prepared' | 'Planned' | 'Not created' }>;
};

export const classes: ClassRecord[] = [
  { id:'religion-6-b', name:'Catechetics (Religious Education) 6 - B', section:'B', course:'Catechetics 6', teacher:'Daniel Joseph', enrollment:24, skills:5, homeroom:false, reportCards:true, progressReport:true, grade:'Sixth' },
  { id:'handwriting-6-b', name:'Handwriting 6 - B', section:'B', course:'Handwriting 6', teacher:'Daniel Joseph', enrollment:24, skills:2, homeroom:false, reportCards:true, progressReport:true, grade:'Sixth' },
  { id:'health-6-b', name:'Health 6 - B', section:'B', course:'Health 6', teacher:'Meera Shah', enrollment:23, skills:4, homeroom:false, reportCards:true, progressReport:true, grade:'Sixth' },
  { id:'homeroom-6-b', name:'Homeroom 6 - B', section:'B', course:'Staff Homeroom', teacher:'Meera Shah', enrollment:24, skills:0, homeroom:true, reportCards:false, progressReport:true, grade:'Sixth' },
  { id:'newspaper-6', name:'Newspaper 6', section:'', course:'Newspaper 6', teacher:'Olivia Bennett', enrollment:9, skills:3, homeroom:false, reportCards:false, progressReport:false, grade:'Sixth' },
  { id:'newspaper-7', name:'Newspaper 7 - B', section:'B', course:'Newspaper 7', teacher:'Olivia Bennett', enrollment:8, skills:3, homeroom:false, reportCards:false, progressReport:false, grade:'Seventh' },
  { id:'reading-6-b', name:'Reading 6 - B', section:'B', course:'Reading 6', teacher:'Daniel Joseph', enrollment:24, skills:5, homeroom:false, reportCards:true, progressReport:true, grade:'Sixth' },
  { id:'science-7-b', name:'Science 7 - B', section:'B', course:'Science 7', teacher:'Daniel Joseph', enrollment:24, skills:7, homeroom:false, reportCards:true, progressReport:true, grade:'Seventh' },
  { id:'spelling-6-b', name:'Spelling 6 - B', section:'B', course:'Spelling 6', teacher:'Meera Shah', enrollment:24, skills:2, homeroom:false, reportCards:true, progressReport:true, grade:'Sixth' },
  { id:'technology-6-b', name:'Technology 6 - B', section:'B', course:'Technology 6', teacher:'Carl Lapp', enrollment:22, skills:6, homeroom:false, reportCards:false, progressReport:false, grade:'Sixth' },
];

const baseLessons: LessonRecord[] = [
  { id:'lp-101', title:'The Beatitudes', unit:'Discipleship', course:'Catechetics 6', grade:'Sixth', teacher:'Daniel Joseph', startDate:'2026-08-10', endDate:'2026-08-10', weekStart:'2026-08-10', duration:45, status:'Ready', prepared:true },
  { id:'lp-102', title:'Works of Mercy', unit:'Discipleship', course:'Catechetics 6', grade:'Sixth', teacher:'Daniel Joseph', startDate:'2026-08-11', endDate:'2026-08-11', weekStart:'2026-08-10', duration:45, status:'Ready', prepared:true },
  { id:'lp-103', title:'Narrative Point of View', unit:'Narrative Reading', course:'Reading 6', grade:'Sixth', teacher:'Daniel Joseph', startDate:'2026-08-12', endDate:'2026-08-12', weekStart:'2026-08-10', duration:50, status:'Shared', prepared:false },
  { id:'lp-104', title:'Health & Wellness Choices', unit:'Healthy Habits', course:'Health 6', grade:'Sixth', teacher:'Meera Shah', startDate:'2026-08-13', endDate:'2026-08-13', weekStart:'2026-08-10', duration:45, status:'Ready', prepared:false },
  { id:'lp-105', title:'Photosynthesis', unit:'Plant Systems', course:'Science 7', grade:'Seventh', teacher:'Daniel Joseph', startDate:'2026-08-10', endDate:'2026-08-14', weekStart:'2026-08-10', duration:45, status:'Ready', prepared:true },
  { id:'lp-106', title:'Scientific Observation', unit:'Scientific Method', course:'Science 7', grade:'Seventh', teacher:'Daniel Joseph', startDate:'2026-08-11', endDate:'2026-08-11', weekStart:'2026-08-10', duration:45, status:'Ready', prepared:true },
  { id:'lp-107', title:'Digital Citizenship', unit:'Responsible Technology', course:'Technology 6', grade:'Sixth', teacher:'Carl Lapp', startDate:'2026-08-12', endDate:'2026-08-12', weekStart:'2026-08-10', duration:45, status:'Draft', prepared:false },
  { id:'lp-108', title:'Keyboarding Fluency', unit:'Productivity Skills', course:'Technology 6', grade:'Sixth', teacher:'Carl Lapp', startDate:'2026-08-14', endDate:'2026-08-14', weekStart:'2026-08-10', duration:45, status:'Ready', prepared:false },
  { id:'lp-109', title:'Spelling Patterns: -tion / -sion', unit:'Word Study', course:'Spelling 6', grade:'Sixth', teacher:'Meera Shah', startDate:'2026-08-10', endDate:'2026-08-10', weekStart:'2026-08-10', duration:35, status:'Ready', prepared:false },
  { id:'lp-110', title:'School Newspaper Story Planning', unit:'Student Journalism', course:'Newspaper 7', grade:'Seventh', teacher:'Olivia Bennett', startDate:'2026-08-13', endDate:'2026-08-13', weekStart:'2026-08-10', duration:55, status:'Shared', prepared:false },
];

export const lessons = baseLessons;

export const units: UnitPlanRecord[] = [
  { id:'unit-plant-systems', title:'Plant Systems', course:'Science 7', grade:'Seventh', dateRange:'Aug 10–28, 2026', lessons:[
    { id:'lp-105', title:'Photosynthesis', date:'Aug 10', status:'Prepared' },
    { id:'lp-106', title:'Scientific Observation', date:'Aug 11', status:'Prepared' },
    { id:'lp-111', title:'Plant Respiration', date:'Aug 17', status:'Planned' },
    { id:'lp-112', title:'Transportation in Plants', date:'Aug 18', status:'Planned' },
    { id:'lp-113', title:'Plant Systems Assessment', date:'Aug 28', status:'Not created' },
  ]},
  { id:'unit-discipleship', title:'Discipleship', course:'Catechetics 6', grade:'Sixth', dateRange:'Aug 10–21, 2026', lessons:[
    { id:'lp-101', title:'The Beatitudes', date:'Aug 10', status:'Prepared' },
    { id:'lp-102', title:'Works of Mercy', date:'Aug 11', status:'Prepared' },
    { id:'lp-114', title:'Living the Gospel', date:'Aug 18', status:'Planned' },
  ]},
];

export const lessonSections = [
  'Lesson Summary','Lesson Objective(s)','Standards','Prerequisite Knowledge/Skills','Vocabulary',
  'Cross-curricular Connections','Anticipatory Set/Bellwork','Introduction','Instruction Methods/Procedures',
  'Presentation/Direct Instruction','Guided Practice','Independent Practice','Activities','Differentiated Instruction',
  'Lesson Assessment','Materials and Supplies','Resources','Closure/Exit Ticket','Teacher Reflection',
] as const;

export const lessonSectionDefaults: Record<string,string> = {
  'Lesson Summary':'Introduce photosynthesis, the process plants use to convert light energy into stored chemical energy.',
  'Lesson Objective(s)':'Students will describe the inputs, outputs, and importance of photosynthesis using evidence from a model.',
  'Standards':'MS-LS1-6 · Construct a scientific explanation based on evidence for the role of photosynthesis.',
  'Prerequisite Knowledge/Skills':'Students can identify basic plant structures and distinguish matter from energy.',
  'Vocabulary':'Photosynthesis · chlorophyll · carbon dioxide · glucose · oxygen',
  'Cross-curricular Connections':'Connect energy transfer to food chains and environmental stewardship.',
  'Anticipatory Set/Bellwork':'Display a plant in light and a covered plant. Ask students to predict which one will grow better and why.',
  'Introduction':'Use a short visual model to connect sunlight, water, and carbon dioxide to plant growth.',
  'Instruction Methods/Procedures':'Model the process, check for understanding, then transition to guided diagram analysis.',
  'Presentation/Direct Instruction':'Explicitly teach the photosynthesis equation and the role of chlorophyll.',
  'Guided Practice':'Students complete a labeled diagram with teacher prompts and peer discussion.',
  'Independent Practice':'Students explain photosynthesis in their own words and identify inputs/outputs.',
  'Activities':'Leaf observation, diagram annotation, and evidence-based explanation.',
  'Differentiated Instruction':'Provide vocabulary cards, sentence frames, and extension questions as needed.',
  'Lesson Assessment':'Exit ticket plus XtraCoach adaptive concept check.',
  'Materials and Supplies':'Plant sample, projector, printed diagrams, colored pencils, science notebooks.',
  'Resources':'Catholic Content stewardship reflection · Science 7 textbook chapter 4.',
  'Closure/Exit Ticket':'One-minute response: Why is photosynthesis essential to most life on Earth?',
  'Teacher Reflection':'Review misconceptions from exit tickets and adjust the next lesson.',
};

export const templates = [
  { id:'tpl-1', name:'Direct Instruction + Guided Practice', grade:'K–8', subject:'All subjects', updated:'Aug 8, 2026' },
  { id:'tpl-2', name:'Inquiry Science Lesson', grade:'5–8', subject:'Science', updated:'Aug 6, 2026' },
  { id:'tpl-3', name:'Faith Integration Lesson', grade:'K–8', subject:'Religion / Cross-curricular', updated:'Aug 4, 2026' },
  { id:'tpl-4', name:'Literacy Workshop', grade:'3–8', subject:'English Language Arts', updated:'Jul 30, 2026' },
];

export const sharedPlans = [
  { id:'shared-1', title:'The Corporal Works of Mercy', owner:'Anna Rodrigues', course:'Catechetics 6', shared:'Today' },
  { id:'shared-2', title:'Ecosystem Energy Transfer', owner:'Michael Alexander', course:'Science 7', shared:'Yesterday' },
  { id:'shared-3', title:'Evidence-Based Paragraphs', owner:'Meera Shah', course:'Reading 6', shared:'Aug 10' },
];

export const coachQuestions = {
  1: ['What gas do plants take in during photosynthesis?','Where does the gas used in photosynthesis come from?','Which gas do plants release after they make food?'],
  2: ['Explain how sunlight helps in photosynthesis.','What part of the plant captures sunlight?','Why can photosynthesis not happen in the dark?'],
  3: ['Why is photosynthesis essential for the food chain?','What could happen to animals if plants stopped photosynthesis?','How does energy move from the sun to a predator?'],
};

export const reportStudents = [
  { id:'stu-001', name:'Ava Martin', stage:'Mastery', concepts:3, lastAccessed:'Aug 13 · 9:42 AM', effort:'5 learning checks' },
  { id:'stu-002', name:'Noah Williams', stage:'Level 2', concepts:1, lastAccessed:'Aug 13 · 9:31 AM', effort:'4 learning checks' },
  { id:'stu-003', name:'Sophia Brown', stage:'Level 1', concepts:0, lastAccessed:'Aug 12 · 2:16 PM', effort:'2 learning checks' },
  { id:'stu-004', name:'Liam Davis', stage:'Level 3', concepts:2, lastAccessed:'Aug 12 · 1:55 PM', effort:'6 learning checks' },
  { id:'stu-005', name:'Emma Wilson', stage:'Mastery', concepts:3, lastAccessed:'Aug 12 · 11:08 AM', effort:'4 learning checks' },
];

export const lessonGrades = [...new Set(classes.map((item) => item.grade))];
export const lessonCourses = [...new Set(classes.map((item) => item.course))];
export const lessonTeachers = [...new Set(classes.map((item) => item.teacher))];

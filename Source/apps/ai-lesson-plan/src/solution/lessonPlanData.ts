export type LessonPlanRecord = {
  id: string;
  term: string;
  weekStart: string;
  course: string;
  grade: string;
  teacher: string;
  lessons: Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday', string>;
};

const week = (id: string, course: string, grade: string, teacher: string, lessons: LessonPlanRecord['lessons']): LessonPlanRecord => ({
  id, term: 'Trimester 1', weekStart: '2026-08-10', course, grade, teacher, lessons,
});

export const lessonPlanRecords: LessonPlanRecord[] = [
  week('lp-101','Art 1','First','Olivia Bennett',{monday:'Color & shape exploration',tuesday:'Primary color mixing',wednesday:'Texture collage',thursday:'Faith symbols in art',friday:'Mini gallery reflection'}),
  week('lp-102','Religion 6','Sixth','Daniel Joseph',{monday:'The Beatitudes',tuesday:'Works of Mercy',wednesday:'Scripture reflection',thursday:'Saint Maximilian Kolbe',friday:'Service-learning journal'}),
  week('lp-103','English Language Arts','Seventh','Meera Shah',{monday:'Narrative point of view',tuesday:'Theme & evidence',wednesday:'Vocabulary workshop',thursday:'Writing conference',friday:'Reading response'}),
  week('lp-104','Mathematics 5','Fifth','Anna Rodrigues',{monday:'Fraction review',tuesday:'Equivalent fractions',wednesday:'Comparing fractions',thursday:'Word problems',friday:'Skills check'}),
  week('lp-105','Science 8','Eighth','Michael Alexander',{monday:'Cells & systems',tuesday:'Microscope lab',wednesday:'Cell transport',thursday:'Lab analysis',friday:'Exit assessment'}),
  week('lp-106','Social Studies 4','Fourth','Rafael Andani',{monday:'Local government',tuesday:'Community services',wednesday:'Civic responsibility',thursday:'Map activity',friday:'Community project'}),
  week('lp-107','Computer Science','Eighth','Carl Lapp',{monday:'Algorithms',tuesday:'Flowcharts',wednesday:'Conditionals',thursday:'Debugging lab',friday:'Code review'}),
  week('lp-108','Music 3','Third','Grace Thomas',{monday:'Rhythm patterns',tuesday:'Tempo & dynamics',wednesday:'Liturgical music',thursday:'Ensemble practice',friday:'Performance reflection'}),
];

export const lessonGrades = [...new Set(lessonPlanRecords.map((item) => item.grade))];
export const lessonCourses = [...new Set(lessonPlanRecords.map((item) => item.course))];
export const lessonTeachers = [...new Set(lessonPlanRecords.map((item) => item.teacher))];

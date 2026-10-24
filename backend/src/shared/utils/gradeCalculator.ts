/**
 * Unified Academic Letter Grading System for EduCore
 */
export function calculateLetterGrade(
  marksObtained: number,
  maxMarks: number,
  isAbsent: boolean,
  passMarks: number = 40
): string {
  if (isAbsent || marksObtained < passMarks) {
    return 'F';
  }

  const percentage = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;

  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'D';
}

export interface GradeInfo {
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  description: string;
  badgeClass: string;
}

export function calculateGrade(
  marksObtained: number,
  maxMarks: number,
  isAbsent: boolean,
  passMarks: number = 40
): GradeInfo {
  if (isAbsent) {
    return {
      grade: 'F',
      description: 'Absent',
      badgeClass: 'bg-neutral-100 text-neutral-600 border-neutral-300',
    };
  }

  if (marksObtained < passMarks) {
    return {
      grade: 'F',
      description: 'Fail',
      badgeClass: 'bg-red-100 text-red-700 border-red-200',
    };
  }

  const percentage = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;

  if (percentage >= 90) {
    return {
      grade: 'A+',
      description: 'Outstanding',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  }

  if (percentage >= 80) {
    return {
      grade: 'A',
      description: 'Excellent',
      badgeClass: 'bg-green-100 text-green-800 border-green-300',
    };
  }

  if (percentage >= 70) {
    return {
      grade: 'B+',
      description: 'Very Good',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    };
  }

  if (percentage >= 60) {
    return {
      grade: 'B',
      description: 'Good',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    };
  }

  if (percentage >= 50) {
    return {
      grade: 'C',
      description: 'Satisfactory',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  }

  return {
    grade: 'D',
    description: 'Pass',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
  };
}

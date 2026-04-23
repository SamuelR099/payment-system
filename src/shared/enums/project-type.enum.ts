export enum ProjectType {
  DEVELOPMENT = 'development',
  DESIGN = 'design',
  TESTING = 'testing',
  DOCUMENTATION = 'documentation',
  MEETING = 'meeting',
  RESEARCH = 'research',
  MAINTENANCE = 'maintenance',
  SUPPORT = 'support',
  DEPLOYMENT = 'deployment',
  REVIEW = 'review',
  CUSTOM = 'custom', // For free text projects
}

export const PROJECT_TYPE_LABELS = {
  [ProjectType.DEVELOPMENT]: 'Development',
  [ProjectType.DESIGN]: 'Design',
  [ProjectType.TESTING]: 'Testing',
  [ProjectType.DOCUMENTATION]: 'Documentation',
  [ProjectType.MEETING]: 'Meeting',
  [ProjectType.RESEARCH]: 'Research',
  [ProjectType.MAINTENANCE]: 'Maintenance',
  [ProjectType.SUPPORT]: 'Support',
  [ProjectType.DEPLOYMENT]: 'Deployment',
  [ProjectType.REVIEW]: 'Review',
  [ProjectType.CUSTOM]: 'Custom Project',
};

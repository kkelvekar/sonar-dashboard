
export interface SortOption {
  text: string;
  value: string;
}

export const SortOptions: SortOption[] = [
  { text: 'Vulnerabilities', value: 'vulnerabilities' },
  { text: 'Security Hotspots', value: 'security_hotspots' }, // Adjusted to match metric name
  { text: 'Code Smells', value: 'code_smells' },
  { text: 'Coverage', value: 'coverage' },
  { text: 'Duplication', value: 'duplicated_lines_density' },
  { text: 'Lines of code', value: 'lineOfCode' }
];


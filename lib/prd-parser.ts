/**
 * Enhanced PRD Parser and Requirement Extraction Engine
 * Supports multiple formats and intelligent content analysis
 */

import { PRDSection, RequirementSet, Requirement, Constraint, Assumption, PersonaType } from './workflow-generator';

export { RequirementSet };

export interface PRDMetadata {
  title: string;
  version: string;
  author: string;
  createdDate: Date;
  lastModified: Date;
  stakeholders: string[];
  businessValue: string;
  successMetrics: string[];
}

export interface ParsedPRD {
  metadata: PRDMetadata;
  sections: PRDSection[];
  requirements: RequirementSet;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedEffort: {
    hours: number;
    confidence: number;
  };
  recommendedPersona: PersonaType;
}

export class PRDParser {
  private sectionPatterns = {
    headers: [
      /^#{1,6}\s+(.+)$/,           // Markdown headers
      /^([A-Z][A-Za-z\s]+):?\s*$/, // Title case headers
      /^\d+\.\s+(.+)$/,            // Numbered sections
      /^[A-Z\s]+$/                 // ALL CAPS headers
    ],
    acceptanceCriteria: [
      /^[-\*\+]\s*(given|when|then|accept|criteria|scenario)/i,
      /^ac\d*:?\s*/i,
      /^acceptance\s+criteria/i
    ],
    userStories: [
      /^as\s+a\s+.+i\s+want\s+.+so\s+that/i,
      /^user\s+story/i,
      /^story\s*:/i
    ],
    requirements: [
      /^req\d*:?\s*/i,
      /^requirement\s*:/i,
      /^shall\s+/i,
      /^must\s+/i,
      /^should\s+/i
    ],
    constraints: [
      /^constraint\s*:/i,
      /^limitation\s*:/i,
      /^restriction\s*:/i
    ],
    assumptions: [
      /^assumption\s*:/i,
      /^assume\s+/i,
      /^given\s+that/i
    ]
  };

  private complexityIndicators = {
    simple: ['single', 'basic', 'simple', 'straightforward', 'minimal'],
    moderate: ['multiple', 'several', 'integration', 'workflow', 'process'],
    complex: ['enterprise', 'scalable', 'distributed', 'microservice', 'real-time', 'machine learning', 'ai']
  };

  private personaKeywords = {
    frontend: ['ui', 'ux', 'interface', 'component', 'responsive', 'mobile', 'web', 'design', 'accessibility'],
    backend: ['api', 'server', 'database', 'service', 'endpoint', 'authentication', 'authorization', 'data'],
    security: ['security', 'auth', 'encryption', 'privacy', 'compliance', 'gdpr', 'vulnerability', 'threat'],
    architect: ['architecture', 'system', 'design', 'pattern', 'scalability', 'integration', 'microservice'],
    devops: ['deployment', 'ci/cd', 'infrastructure', 'docker', 'kubernetes', 'monitoring', 'observability'],
    qa: ['testing', 'quality', 'validation', 'verification', 'test', 'bug', 'defect'],
    performance: ['performance', 'optimization', 'speed', 'latency', 'throughput', 'scalability', 'load'],
    analyzer: ['analysis', 'investigation', 'troubleshoot', 'debug', 'diagnose', 'root cause'],
    refactorer: ['refactor', 'cleanup', 'technical debt', 'maintainability', 'code quality'],
    mentor: ['documentation', 'guide', 'tutorial', 'learning', 'knowledge transfer'],
    scribe: ['document', 'specification', 'manual', 'wiki', 'changelog', 'release notes']
  };

  /**
   * Parse PRD from various input formats
   */
  async parsePRD(input: string | File): Promise<ParsedPRD> {
    const content = typeof input === 'string' ? input : await this.readFile(input);

    // Extract metadata
    const metadata = this.extractMetadata(content);

    // Parse sections with enhanced detection
    const sections = this.parseSections(content);

    // Extract structured requirements
    const requirements = this.extractRequirements(sections, content);

    // Analyze complexity and effort
    const complexity = this.analyzeComplexity(content, requirements);
    const estimatedEffort = this.estimateEffort(requirements, complexity);

    // Recommend primary persona
    const recommendedPersona = this.recommendPersona(content, requirements);

    return {
      metadata,
      sections,
      requirements,
      complexity,
      estimatedEffort,
      recommendedPersona
    };
  }

  /**
   * Extract metadata from PRD content
   */
  private extractMetadata(content: string): PRDMetadata {
    const lines = content.split('\n');
    const metadata: Partial<PRDMetadata> = {};

    // Extract title (usually first header or line)
    const titleMatch = lines.find(line => this.matchesPattern(line, this.sectionPatterns.headers));
    metadata.title = titleMatch ? this.extractHeader(titleMatch) : 'Untitled Feature';

    // Extract version info
    const versionMatch = content.match(/version\s*:?\s*([^\n]+)/i);
    metadata.version = versionMatch ? versionMatch[1].trim() : '1.0';

    // Extract author
    const authorMatch = content.match(/author\s*:?\s*([^\n]+)/i);
    metadata.author = authorMatch ? authorMatch[1].trim() : 'Unknown';

    // Extract dates
    const dateMatch = content.match(/date\s*:?\s*([^\n]+)/i);
    metadata.createdDate = dateMatch ? new Date(dateMatch[1]) : new Date();
    metadata.lastModified = new Date();

    // Extract stakeholders
    const stakeholderMatch = content.match(/stakeholders?\s*:?\s*([^\n]+)/i);
    metadata.stakeholders = stakeholderMatch
      ? stakeholderMatch[1].split(',').map(s => s.trim())
      : [];

    // Extract business value
    const businessValueMatch = content.match(/business\s+value\s*:?\s*([^\n]+)/i);
    metadata.businessValue = businessValueMatch ? businessValueMatch[1].trim() : '';

    // Extract success metrics
    const metricsSection = this.extractSection(content, 'success metrics', 'metrics', 'kpi');
    metadata.successMetrics = metricsSection
      ? this.extractListItems(metricsSection)
      : [];

    return metadata as PRDMetadata;
  }

  /**
   * Parse content into structured sections
   */
  private parseSections(content: string): PRDSection[] {
    const sections: PRDSection[] = [];
    const lines = content.split('\n');
    let currentSection: Partial<PRDSection> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      // Check if this line is a section header
      if (this.isSectionHeader(line)) {
        // Save previous section
        if (currentSection?.title && currentSection?.content) {
          sections.push(this.completePRDSection(currentSection));
        }

        // Start new section
        currentSection = {
          title: this.extractHeader(line),
          content: '',
          priority: this.determinePriority(line),
          dependencies: [],
          acceptanceCriteria: []
        };
      } else if (currentSection) {
        // Check for acceptance criteria
        if (this.isAcceptanceCriteria(line)) {
          if (!currentSection.acceptanceCriteria) {
            currentSection.acceptanceCriteria = [];
          }
          currentSection.acceptanceCriteria.push(this.extractCriteria(line));
        } else {
          // Add to section content
          currentSection.content = (currentSection.content || '') + line + '\n';
        }
      }
    }

    // Add final section
    if (currentSection?.title && currentSection?.content) {
      sections.push(this.completePRDSection(currentSection));
    }

    return sections;
  }

  /**
   * Extract structured requirements from sections and content
   */
  private extractRequirements(sections: PRDSection[], content: string): RequirementSet {
    const functional: Requirement[] = [];
    const nonFunctional: Requirement[] = [];
    const technical: Requirement[] = [];
    const constraints: Constraint[] = [];
    const assumptions: Assumption[] = [];

    // Process each section
    for (const section of sections) {
      const sectionType = this.classifySection(section);
      const requirements = this.extractRequirementsFromSection(section);

      requirements.forEach(req => {
        switch (sectionType) {
          case 'functional':
            functional.push({ ...req, type: 'functional' });
            break;
          case 'nonFunctional':
            nonFunctional.push({ ...req, type: 'nonFunctional' });
            break;
          case 'technical':
            technical.push({ ...req, type: 'technical' });
            break;
        }
      });
    }

    // Extract constraints
    const constraintMatches = content.matchAll(/constraint\s*:?\s*([^\n]+)/gi);
    for (const match of constraintMatches) {
      constraints.push({
        id: this.generateId('constraint'),
        type: this.classifyConstraint(match[1]),
        description: match[1].trim(),
        impact: this.assessConstraintImpact(match[1])
      });
    }

    // Extract assumptions
    const assumptionMatches = content.matchAll(/assumption\s*:?\s*([^\n]+)/gi);
    for (const match of assumptionMatches) {
      assumptions.push({
        id: this.generateId('assumption'),
        description: match[1].trim(),
        validationRequired: this.requiresValidation(match[1]),
        owner: this.assignAssumptionOwner(match[1])
      });
    }

    return {
      functional,
      nonFunctional,
      technical,
      constraints,
      assumptions
    };
  }

  /**
   * Analyze content complexity
   */
  private analyzeComplexity(content: string, requirements: RequirementSet): 'simple' | 'moderate' | 'complex' {
    const lower = content.toLowerCase();
    let score = 0;

    // Check complexity indicators
    Object.entries(this.complexityIndicators).forEach(([level, indicators]) => {
      const matches = indicators.filter(indicator => lower.includes(indicator)).length;
      switch (level) {
        case 'simple':
          score -= matches * 1;
          break;
        case 'moderate':
          score += matches * 2;
          break;
        case 'complex':
          score += matches * 3;
          break;
      }
    });

    // Factor in requirement count
    const totalRequirements = requirements.functional.length +
                             requirements.nonFunctional.length +
                             requirements.technical.length;

    if (totalRequirements > 20) score += 3;
    else if (totalRequirements > 10) score += 1;

    // Factor in constraints and assumptions
    score += requirements.constraints.length * 0.5;
    score += requirements.assumptions.length * 0.3;

    // Determine complexity level
    if (score <= 0) return 'simple';
    if (score <= 5) return 'moderate';
    return 'complex';
  }

  /**
   * Estimate development effort
   */
  private estimateEffort(requirements: RequirementSet, complexity: 'simple' | 'moderate' | 'complex'): { hours: number; confidence: number } {
    const baseHours = {
      simple: 20,
      moderate: 80,
      complex: 200
    };

    let hours = baseHours[complexity];

    // Adjust based on requirement types
    hours += requirements.functional.length * 8;
    hours += requirements.nonFunctional.length * 4;
    hours += requirements.technical.length * 6;
    hours += requirements.constraints.length * 2;

    // Adjust based on high-priority requirements
    const highPriorityCount = [
      ...requirements.functional,
      ...requirements.nonFunctional,
      ...requirements.technical
    ].filter(req => req.priority === 'high').length;

    hours += highPriorityCount * 4;

    // Confidence decreases with complexity and constraint count
    let confidence = 0.8;
    if (complexity === 'complex') confidence -= 0.2;
    if (requirements.constraints.length > 5) confidence -= 0.1;
    if (requirements.assumptions.length > 3) confidence -= 0.1;

    return {
      hours: Math.round(hours),
      confidence: Math.max(0.3, confidence)
    };
  }

  /**
   * Recommend primary persona based on content analysis
   */
  private recommendPersona(content: string, requirements: RequirementSet): PersonaType {
    const lower = content.toLowerCase();
    const scores = new Map<PersonaType, number>();

    // Initialize scores
    Object.keys(this.personaKeywords).forEach(persona => {
      scores.set(persona as PersonaType, 0);
    });

    // Score based on keyword matches
    Object.entries(this.personaKeywords).forEach(([persona, keywords]) => {
      const matchCount = keywords.filter(keyword => lower.includes(keyword)).length;
      scores.set(persona as PersonaType, matchCount);
    });

    // Boost scores based on requirement analysis
    const allRequirementText = [
      ...requirements.functional,
      ...requirements.nonFunctional,
      ...requirements.technical
    ].map(req => req.content.toLowerCase()).join(' ');

    // UI/Frontend boost
    if (allRequirementText.includes('user interface') || allRequirementText.includes('responsive')) {
      scores.set('frontend', (scores.get('frontend') || 0) + 3);
    }

    // API/Backend boost
    if (allRequirementText.includes('api') || allRequirementText.includes('database')) {
      scores.set('backend', (scores.get('backend') || 0) + 3);
    }

    // Security boost for compliance requirements
    if (requirements.constraints.some(c => c.type === 'business' && c.description.toLowerCase().includes('compliance'))) {
      scores.set('security', (scores.get('security') || 0) + 4);
    }

    // Architecture boost for complex integrations
    if (requirements.technical.length > 5) {
      scores.set('architect', (scores.get('architect') || 0) + 2);
    }

    // Find highest scoring persona
    const sortedScores = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0);

    return sortedScores.length > 0 ? sortedScores[0][0] : 'architect';
  }

  // Helper methods
  private async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private matchesPattern(text: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(text));
  }

  private isSectionHeader(line: string): boolean {
    return this.matchesPattern(line, this.sectionPatterns.headers);
  }

  private extractHeader(line: string): string {
    for (const pattern of this.sectionPatterns.headers) {
      const match = line.match(pattern);
      if (match) {
        return match[1] || match[0].replace(/^#+\s*/, '').replace(/:$/, '').trim();
      }
    }
    return line.trim();
  }

  private determinePriority(content: string): 'high' | 'medium' | 'low' {
    const lower = content.toLowerCase();
    if (lower.includes('critical') || lower.includes('must') || lower.includes('essential')) {
      return 'high';
    }
    if (lower.includes('should') || lower.includes('important') || lower.includes('preferred')) {
      return 'medium';
    }
    return 'low';
  }

  private isAcceptanceCriteria(line: string): boolean {
    return this.matchesPattern(line, this.sectionPatterns.acceptanceCriteria);
  }

  private extractCriteria(line: string): string {
    return line.replace(/^[-\*\+]\s*/, '').replace(/^(given|when|then|accept|criteria|scenario)\s*:?\s*/i, '').trim();
  }

  private completePRDSection(section: Partial<PRDSection>): PRDSection {
    return {
      title: section.title || '',
      content: section.content || '',
      priority: section.priority || 'medium',
      dependencies: section.dependencies || [],
      acceptanceCriteria: section.acceptanceCriteria || []
    };
  }

  private extractSection(content: string, ...sectionNames: string[]): string | null {
    for (const name of sectionNames) {
      const regex = new RegExp(`^#{1,6}\\s*${name}\\s*$.*?(?=^#{1,6}|$)`, 'ims');
      const match = content.match(regex);
      if (match) return match[0];
    }
    return null;
  }

  private extractListItems(content: string): string[] {
    const lines = content.split('\n');
    return lines
      .filter(line => /^[-\*\+]\s/.test(line.trim()))
      .map(line => line.replace(/^[-\*\+]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  private classifySection(section: PRDSection): 'functional' | 'nonFunctional' | 'technical' {
    const title = section.title.toLowerCase();
    const content = section.content.toLowerCase();

    // Non-functional indicators
    if (title.includes('performance') || title.includes('security') ||
        title.includes('scalability') || title.includes('usability')) {
      return 'nonFunctional';
    }

    // Technical indicators
    if (title.includes('technical') || title.includes('architecture') ||
        title.includes('implementation') || title.includes('integration')) {
      return 'technical';
    }

    // Check content for technical terms
    const technicalTerms = ['api', 'database', 'server', 'framework', 'library', 'protocol'];
    if (technicalTerms.some(term => content.includes(term))) {
      return 'technical';
    }

    // Default to functional
    return 'functional';
  }

  private extractRequirementsFromSection(section: PRDSection): Omit<Requirement, 'type'>[] {
    const requirements: Omit<Requirement, 'type'>[] = [];

    // Extract from acceptance criteria
    section.acceptanceCriteria?.forEach((criteria, index) => {
      requirements.push({
        id: this.generateId('req'),
        content: criteria,
        priority: section.priority,
        source: section.title,
        acceptanceCriteria: [criteria]
      });
    });

    // Extract from content using requirement patterns
    const lines = section.content.split('\n');
    lines.forEach(line => {
      if (this.matchesPattern(line, this.sectionPatterns.requirements)) {
        const content = line.replace(/^(req\d*:?\s*|requirement\s*:?\s*|shall\s+|must\s+|should\s+)/i, '').trim();
        if (content) {
          requirements.push({
            id: this.generateId('req'),
            content,
            priority: this.determinePriority(line),
            source: section.title,
            acceptanceCriteria: []
          });
        }
      }
    });

    return requirements;
  }

  private classifyConstraint(description: string): 'technical' | 'business' | 'timeline' | 'resource' {
    const lower = description.toLowerCase();
    if (lower.includes('technical') || lower.includes('technology') || lower.includes('platform')) {
      return 'technical';
    }
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('resource')) {
      return 'resource';
    }
    if (lower.includes('time') || lower.includes('deadline') || lower.includes('schedule')) {
      return 'timeline';
    }
    return 'business';
  }

  private assessConstraintImpact(description: string): 'high' | 'medium' | 'low' {
    const lower = description.toLowerCase();
    if (lower.includes('critical') || lower.includes('blocking') || lower.includes('must not')) {
      return 'high';
    }
    if (lower.includes('should not') || lower.includes('preferred') || lower.includes('limited')) {
      return 'medium';
    }
    return 'low';
  }

  private requiresValidation(description: string): boolean {
    const lower = description.toLowerCase();
    return lower.includes('assume') || lower.includes('expect') || lower.includes('believe');
  }

  private assignAssumptionOwner(description: string): PersonaType {
    const lower = description.toLowerCase();
    if (lower.includes('technical') || lower.includes('system')) return 'architect';
    if (lower.includes('user') || lower.includes('interface')) return 'frontend';
    if (lower.includes('data') || lower.includes('api')) return 'backend';
    if (lower.includes('security') || lower.includes('compliance')) return 'security';
    return 'architect';
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

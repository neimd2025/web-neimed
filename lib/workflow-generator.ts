/**
 * SuperClaude Workflow Generator
 * Implementation of /sc:workflow command for comprehensive feature development planning
 */

export interface PRDSection {
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
  acceptanceCriteria?: string[];
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  persona: PersonaType;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedHours: number;
  dependencies: string[];
  acceptanceCriteria: string[];
  phase: WorkflowPhase;
  tags: string[];
  mcpServers: MCPServer[];
  tools: string[];
}

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  tasks: WorkflowTask[];
  milestones: string[];
  deliverables: string[];
  risks: RiskAssessment[];
}

export interface WorkflowStrategy {
  name: 'systematic' | 'agile' | 'mvp';
  description: string;
  phases: WorkflowPhase[];
  parallelWorkStreams: WorkflowTask[][];
  criticalPath: string[];
}

export interface RiskAssessment {
  id: string;
  type: 'technical' | 'timeline' | 'security' | 'business';
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  owner: PersonaType;
}

export interface DependencyMap {
  internal: { from: string; to: string; type: 'blocking' | 'related' }[];
  external: { service: string; type: 'api' | 'library' | 'infrastructure'; critical: boolean }[];
  technical: { technology: string; version?: string; rationale: string }[];
  team: { skill: string; required: boolean; timeline: string }[];
}

export type PersonaType =
  | 'architect'
  | 'frontend'
  | 'backend'
  | 'security'
  | 'devops'
  | 'qa'
  | 'performance'
  | 'mentor'
  | 'analyzer'
  | 'refactorer'
  | 'scribe';

export type MCPServer = 'context7' | 'sequential' | 'magic' | 'playwright';

export type OutputFormat = 'roadmap' | 'tasks' | 'detailed';

export interface WorkflowGeneratorOptions {
  strategy: WorkflowStrategy['name'];
  outputFormat: OutputFormat;
  persona?: PersonaType;
  includeEstimates: boolean;
  includeDependencies: boolean;
  includeRisks: boolean;
  identifyParallel: boolean;
  createMilestones: boolean;
  mcpServers: MCPServer[];
}

export class WorkflowGenerator {
  private strategies: Map<string, WorkflowStrategy> = new Map();
  private personaTemplates: Map<PersonaType, WorkflowTemplate> = new Map();
  private riskAnalyzer: RiskAnalyzer;
  private dependencyMapper: DependencyMapper;
  private outputFormatter: OutputFormatter;

  constructor() {
    this.riskAnalyzer = new RiskAnalyzer();
    this.dependencyMapper = new DependencyMapper();
    this.outputFormatter = new OutputFormatter();
    this.initializeStrategies();
    this.initializePersonaTemplates();
  }

  /**
   * Main entry point for workflow generation
   */
  async generateWorkflow(
    input: string | PRDSection[],
    options: WorkflowGeneratorOptions
  ): Promise<GeneratedWorkflow> {
    const prdSections = typeof input === 'string'
      ? await this.parsePRD(input)
      : input;

    const requirements = await this.extractRequirements(prdSections);
    const strategy = this.getStrategy(options.strategy);
    const persona = this.detectPrimaryPersona(requirements, options.persona);

    // Build workflow phases based on strategy
    const phases = await this.buildPhases(requirements, strategy, persona);

    // Enhance with analysis modules
    if (options.includeDependencies) {
      phases.forEach(phase => {
        phase.tasks.forEach(task => {
          task.dependencies = this.dependencyMapper.analyzeDependencies(task, phases);
        });
      });
    }

    if (options.includeRisks) {
      phases.forEach(phase => {
        phase.risks = this.riskAnalyzer.assessRisks(phase, requirements);
      });
    }

    if (options.identifyParallel) {
      strategy.parallelWorkStreams = this.identifyParallelWork(phases);
    }

    const workflow: GeneratedWorkflow = {
      id: this.generateId(),
      title: this.extractTitle(requirements),
      strategy: options.strategy,
      primaryPersona: persona,
      phases,
      dependencies: options.includeDependencies ? this.dependencyMapper.createMap(phases) : undefined,
      risks: options.includeRisks ? this.riskAnalyzer.getAllRisks(phases) : undefined,
      parallelWorkStreams: options.identifyParallel ? strategy.parallelWorkStreams : undefined,
      estimatedDuration: this.calculateDuration(phases),
      createdAt: new Date(),
      mcpIntegration: this.planMCPIntegration(phases, options.mcpServers)
    };

    return this.outputFormatter.format(workflow, options.outputFormat);
  }

  /**
   * Parse PRD from string input
   */
  private async parsePRD(input: string): Promise<PRDSection[]> {
    // Enhanced PRD parsing with section detection
    const sections: PRDSection[] = [];
    const lines = input.split('\n');
    let currentSection: Partial<PRDSection> = {};

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect section headers
      if (this.isSectionHeader(trimmed)) {
        if (currentSection.title && currentSection.content) {
          sections.push(this.completePRDSection(currentSection));
        }
        currentSection = {
          title: this.extractSectionTitle(trimmed),
          content: '',
          priority: this.determinePriority(trimmed)
        };
      } else if (this.isAcceptanceCriteria(trimmed)) {
        if (!currentSection.acceptanceCriteria) {
          currentSection.acceptanceCriteria = [];
        }
        currentSection.acceptanceCriteria.push(this.extractCriteria(trimmed));
      } else if (trimmed) {
        currentSection.content = (currentSection.content || '') + trimmed + '\n';
      }
    }

    // Add final section
    if (currentSection.title && currentSection.content) {
      sections.push(this.completePRDSection(currentSection));
    }

    return sections;
  }

  /**
   * Extract structured requirements from PRD sections
   */
  private async extractRequirements(sections: PRDSection[]): Promise<RequirementSet> {
    const functional = sections.filter(s => this.isFunctionalRequirement(s));
    const nonFunctional = sections.filter(s => this.isNonFunctionalRequirement(s));
    const technical = sections.filter(s => this.isTechnicalRequirement(s));

    return {
      functional: functional.map(s => this.convertToRequirement(s)),
      nonFunctional: nonFunctional.map(s => this.convertToRequirement(s)),
      technical: technical.map(s => this.convertToRequirement(s)),
      constraints: this.extractConstraints(sections),
      assumptions: this.extractAssumptions(sections)
    };
  }

  /**
   * Detect primary persona based on requirements analysis
   */
  private detectPrimaryPersona(requirements: RequirementSet, override?: PersonaType): PersonaType {
    if (override) return override;

    const scores = new Map<PersonaType, number>();

    // Analyze requirement content for persona indicators
    const allContent = [
      ...requirements.functional,
      ...requirements.nonFunctional,
      ...requirements.technical
    ].map(r => r.content.toLowerCase()).join(' ');

    // Frontend indicators
    if (this.containsKeywords(allContent, ['ui', 'component', 'responsive', 'accessibility', 'user interface'])) {
      scores.set('frontend', (scores.get('frontend') || 0) + 3);
    }

    // Backend indicators
    if (this.containsKeywords(allContent, ['api', 'database', 'server', 'authentication', 'service'])) {
      scores.set('backend', (scores.get('backend') || 0) + 3);
    }

    // Security indicators
    if (this.containsKeywords(allContent, ['security', 'auth', 'encryption', 'privacy', 'compliance'])) {
      scores.set('security', (scores.get('security') || 0) + 4);
    }

    // Architecture indicators
    if (this.containsKeywords(allContent, ['architecture', 'system', 'scalability', 'integration', 'design pattern'])) {
      scores.set('architect', (scores.get('architect') || 0) + 2);
    }

    // Return highest scoring persona or default to architect
    const sortedScores = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
    return sortedScores.length > 0 ? sortedScores[0][0] : 'architect';
  }

  /**
   * Build workflow phases based on strategy and requirements
   */
  private async buildPhases(
    requirements: RequirementSet,
    strategy: WorkflowStrategy,
    persona: PersonaType
  ): Promise<WorkflowPhase[]> {
    const template = this.personaTemplates.get(persona);
    const basePhases = strategy.phases;

    return basePhases.map(phase => {
      const enhancedTasks = this.enhanceTasksWithPersona(phase.tasks, persona, template);
      const mcpIntegratedTasks = this.integrateMCPServers(enhancedTasks, requirements);

      return {
        ...phase,
        tasks: mcpIntegratedTasks,
        risks: [],
        deliverables: this.generateDeliverables(phase, requirements)
      };
    });
  }

  /**
   * Initialize workflow strategies
   */
  private initializeStrategies(): void {
    this.strategies.set('systematic', {
      name: 'systematic',
      description: 'Comprehensive, sequential approach with thorough analysis',
      phases: [
        {
          id: 'requirements',
          name: 'Requirements Analysis',
          description: 'Deep dive into PRD structure and acceptance criteria',
          duration: '1-2 weeks',
          tasks: [],
          milestones: ['Requirements validated', 'Acceptance criteria defined'],
          deliverables: ['Requirements document', 'Acceptance criteria matrix'],
          risks: []
        },
        {
          id: 'architecture',
          name: 'Architecture Planning',
          description: 'System design and component architecture',
          duration: '1-2 weeks',
          tasks: [],
          milestones: ['Architecture approved', 'Technology stack selected'],
          deliverables: ['Architecture document', 'Technology selection rationale'],
          risks: []
        },
        {
          id: 'implementation',
          name: 'Implementation Phases',
          description: 'Sequential development with clear deliverables',
          duration: '4-8 weeks',
          tasks: [],
          milestones: ['Core functionality complete', 'Integration testing passed'],
          deliverables: ['Working software', 'Test suite'],
          risks: []
        },
        {
          id: 'validation',
          name: 'Testing & Deployment',
          description: 'Comprehensive testing and production rollout',
          duration: '1-2 weeks',
          tasks: [],
          milestones: ['All tests passed', 'Production deployment successful'],
          deliverables: ['Test reports', 'Deployment documentation'],
          risks: []
        }
      ],
      parallelWorkStreams: [],
      criticalPath: ['requirements', 'architecture', 'implementation', 'validation']
    });

    this.strategies.set('agile', {
      name: 'agile',
      description: 'Iterative development with continuous feedback',
      phases: [
        {
          id: 'epic-breakdown',
          name: 'Epic Breakdown',
          description: 'Convert PRD into user stories and epics',
          duration: '1 week',
          tasks: [],
          milestones: ['Epics defined', 'Sprint backlog created'],
          deliverables: ['User stories', 'Sprint backlog'],
          risks: []
        },
        {
          id: 'sprint-cycles',
          name: 'Sprint Development',
          description: 'Iterative 2-week sprints with regular demos',
          duration: '6-12 weeks',
          tasks: [],
          milestones: ['Sprint demos', 'Stakeholder feedback incorporated'],
          deliverables: ['Working increments', 'Demo artifacts'],
          risks: []
        },
        {
          id: 'release',
          name: 'Release & Retrospective',
          description: 'Production release with retrospective learning',
          duration: '1 week',
          tasks: [],
          milestones: ['Production release', 'Retrospective complete'],
          deliverables: ['Released product', 'Retrospective insights'],
          risks: []
        }
      ],
      parallelWorkStreams: [],
      criticalPath: ['epic-breakdown', 'sprint-cycles', 'release']
    });

    this.strategies.set('mvp', {
      name: 'mvp',
      description: 'Rapid delivery focusing on core value proposition',
      phases: [
        {
          id: 'core-definition',
          name: 'MVP Definition',
          description: 'Identify core features and validation metrics',
          duration: '3-5 days',
          tasks: [],
          milestones: ['MVP scope locked', 'Success metrics defined'],
          deliverables: ['MVP specification', 'Success criteria'],
          risks: []
        },
        {
          id: 'rapid-development',
          name: 'Rapid Development',
          description: 'Fast implementation with acceptable technical debt',
          duration: '2-4 weeks',
          tasks: [],
          milestones: ['Core features complete', 'Basic testing passed'],
          deliverables: ['MVP product', 'Basic documentation'],
          risks: []
        },
        {
          id: 'validation',
          name: 'Market Validation',
          description: 'User testing and feedback collection',
          duration: '1-2 weeks',
          tasks: [],
          milestones: ['User feedback collected', 'Iteration plan created'],
          deliverables: ['User feedback report', 'Next iteration roadmap'],
          risks: []
        }
      ],
      parallelWorkStreams: [],
      criticalPath: ['core-definition', 'rapid-development', 'validation']
    });
  }

  /**
   * Initialize persona-specific workflow templates
   */
  private initializePersonaTemplates(): void {
    // Frontend persona template
    this.personaTemplates.set('frontend', {
      focusAreas: ['UI/UX', 'Performance', 'Accessibility', 'Responsive Design'],
      preferredTools: ['magic', 'playwright'],
      qualityGates: ['Accessibility audit', 'Performance testing', 'Cross-browser validation'],
      taskModifiers: {
        complexity: 1.2, // UI tasks often more complex due to design requirements
        estimation: 1.1   // Add buffer for design iteration
      }
    });

    // Backend persona template
    this.personaTemplates.set('backend', {
      focusAreas: ['API Design', 'Database', 'Security', 'Performance'],
      preferredTools: ['context7', 'sequential'],
      qualityGates: ['Security audit', 'Performance testing', 'API documentation'],
      taskModifiers: {
        complexity: 1.1,
        estimation: 1.0
      }
    });

    // Add other persona templates...
  }

  // Helper methods
  private generateId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isSectionHeader(line: string): boolean {
    return /^#{1,6}\s/.test(line) || /^[A-Z][A-Za-z\s]+:$/.test(line);
  }

  private extractSectionTitle(line: string): string {
    return line.replace(/^#{1,6}\s*/, '').replace(/:$/, '').trim();
  }

  private determinePriority(line: string): 'high' | 'medium' | 'low' {
    const lower = line.toLowerCase();
    if (lower.includes('critical') || lower.includes('must')) return 'high';
    if (lower.includes('should') || lower.includes('important')) return 'medium';
    return 'low';
  }

  private isAcceptanceCriteria(line: string): boolean {
    return /^[-\*]\s*(given|when|then|accept|criteria)/i.test(line.trim());
  }

  private extractCriteria(line: string): string {
    return line.replace(/^[-\*]\s*/, '').trim();
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

  private containsKeywords(content: string, keywords: string[]): boolean {
    return keywords.some(keyword => content.includes(keyword));
  }

  private getStrategy(name: string): WorkflowStrategy {
    return this.strategies.get(name) || this.strategies.get('systematic')!;
  }

  /**
   * Identify tasks that can be executed in parallel
   */
  private identifyParallelWork(phases: WorkflowPhase[]): WorkflowTask[][] {
    const parallelStreams: WorkflowTask[][] = [];
    const allTasks = phases.flatMap(phase => phase.tasks);

    // Group tasks by persona and complexity
    const taskGroups = new Map<string, WorkflowTask[]>();

    allTasks.forEach(task => {
      const key = `${task.persona}-${task.complexity}`;
      if (!taskGroups.has(key)) {
        taskGroups.set(key, []);
      }
      taskGroups.get(key)!.push(task);
    });

    // Create parallel streams for tasks that can run simultaneously
    taskGroups.forEach((tasks, key) => {
      if (tasks.length > 1) {
        // Check if tasks have dependencies that would prevent parallel execution
        const independentTasks = tasks.filter(task =>
          task.dependencies.length === 0 ||
          task.dependencies.every(dep =>
            !allTasks.some(otherTask =>
              otherTask.id === dep &&
              otherTask.phase.id === task.phase.id
            )
          )
        );

        if (independentTasks.length > 1) {
          parallelStreams.push(independentTasks);
        }
      }
    });

    // Also identify cross-phase parallel opportunities
    const crossPhaseParallel = this.identifyCrossPhaseParallel(phases);
    parallelStreams.push(...crossPhaseParallel);

    return parallelStreams;
  }

  /**
   * Identify tasks that can run in parallel across different phases
   */
  private identifyCrossPhaseParallel(phases: WorkflowPhase[]): WorkflowTask[][] {
    const crossPhaseStreams: WorkflowTask[][] = [];

    for (let i = 0; i < phases.length - 1; i++) {
      const currentPhase = phases[i];
      const nextPhase = phases[i + 1];

      // Find tasks in next phase that don't depend on current phase tasks
      const independentNextTasks = nextPhase.tasks.filter(nextTask =>
        !nextTask.dependencies.some(dep =>
          currentPhase.tasks.some(currentTask => currentTask.id === dep)
        )
      );

      if (independentNextTasks.length > 0) {
        // Find current phase tasks that can run in parallel with next phase tasks
        const parallelCurrentTasks = currentPhase.tasks.filter(currentTask =>
          !independentNextTasks.some(nextTask =>
            nextTask.dependencies.includes(currentTask.id)
          )
        );

        if (parallelCurrentTasks.length > 0) {
          crossPhaseStreams.push([...parallelCurrentTasks, ...independentNextTasks]);
        }
      }
    }

    return crossPhaseStreams;
  }

  /**
   * Extract constraints from PRD sections
   */
  private extractConstraints(sections: PRDSection[]): Constraint[] {
    const constraints: Constraint[] = [];

    sections.forEach(section => {
      const content = section.content.toLowerCase();

      // Technical constraints
      if (this.containsKeywords(content, ['performance', 'scalability', 'security', 'compatibility'])) {
        constraints.push({
          id: this.generateId(),
          type: 'technical',
          description: section.content,
          impact: section.priority
        });
      }

      // Business constraints
      if (this.containsKeywords(content, ['budget', 'timeline', 'deadline', 'resource', 'team'])) {
        constraints.push({
          id: this.generateId(),
          type: 'business',
          description: section.content,
          impact: section.priority
        });
      }

      // Timeline constraints
      if (this.containsKeywords(content, ['deadline', 'milestone', 'delivery', 'launch'])) {
        constraints.push({
          id: this.generateId(),
          type: 'timeline',
          description: section.content,
          impact: section.priority
        });
      }

      // Resource constraints
      if (this.containsKeywords(content, ['team', 'skill', 'expertise', 'capacity'])) {
        constraints.push({
          id: this.generateId(),
          type: 'resource',
          description: section.content,
          impact: section.priority
        });
      }
    });

    return constraints;
  }

  /**
   * Extract assumptions from PRD sections
   */
  private extractAssumptions(sections: PRDSection[]): Assumption[] {
    const assumptions: Assumption[] = [];

    sections.forEach(section => {
      const content = section.content.toLowerCase();

      if (this.containsKeywords(content, ['assume', 'assumption', 'expect', 'believe'])) {
        assumptions.push({
          id: this.generateId(),
          description: section.content,
          validationRequired: true,
          owner: this.detectPrimaryPersona({ functional: [], nonFunctional: [], technical: [], constraints: [], assumptions: [] })
        });
      }
    });

    return assumptions;
  }

  /**
   * Convert PRD section to requirement
   */
  private convertToRequirement(section: PRDSection): Requirement {
    return {
      id: this.generateId(),
      type: this.determineRequirementType(section),
      content: section.content,
      priority: section.priority,
      source: section.title,
      acceptanceCriteria: section.acceptanceCriteria || []
    };
  }

  /**
   * Determine requirement type based on content
   */
  private determineRequirementType(section: PRDSection): 'functional' | 'nonFunctional' | 'technical' {
    const content = section.content.toLowerCase();

    if (this.isFunctionalRequirement(section)) {
      return 'functional';
    } else if (this.isNonFunctionalRequirement(section)) {
      return 'nonFunctional';
    } else if (this.isTechnicalRequirement(section)) {
      return 'technical';
    }

    // Default to functional if unclear
    return 'functional';
  }

  /**
   * Check if section is a functional requirement
   */
  private isFunctionalRequirement(section: PRDSection): boolean {
    const content = section.content.toLowerCase();
    const title = section.title.toLowerCase();

    return this.containsKeywords(content, ['user', 'action', 'feature', 'function', 'behavior']) ||
           this.containsKeywords(title, ['feature', 'function', 'user story', 'requirement']);
  }

  /**
   * Check if section is a non-functional requirement
   */
  private isNonFunctionalRequirement(section: PRDSection): boolean {
    const content = section.content.toLowerCase();
    const title = section.title.toLowerCase();

    return this.containsKeywords(content, ['performance', 'security', 'usability', 'reliability', 'scalability']) ||
           this.containsKeywords(title, ['performance', 'security', 'quality', 'constraint']);
  }

  /**
   * Check if section is a technical requirement
   */
  private isTechnicalRequirement(section: PRDSection): boolean {
    const content = section.content.toLowerCase();
    const title = section.title.toLowerCase();

    return this.containsKeywords(content, ['technology', 'platform', 'framework', 'architecture', 'infrastructure']) ||
           this.containsKeywords(title, ['technical', 'architecture', 'platform', 'technology']);
  }

  /**
   * Enhance tasks with persona-specific modifications
   */
  private enhanceTasksWithPersona(tasks: WorkflowTask[], persona: PersonaType, template?: WorkflowTemplate): WorkflowTask[] {
    return tasks.map(task => ({
      ...task,
      persona,
      complexity: this.adjustComplexity(task.complexity, template),
      estimatedHours: this.adjustEstimation(task.estimatedHours, template)
    }));
  }

  /**
   * Adjust task complexity based on persona template
   */
  private adjustComplexity(complexity: 'simple' | 'moderate' | 'complex', template?: WorkflowTemplate): 'simple' | 'moderate' | 'complex' {
    if (!template) return complexity;

    const modifier = template.taskModifiers.complexity;
    const complexityLevels = ['simple', 'moderate', 'complex'];
    const currentIndex = complexityLevels.indexOf(complexity);
    const newIndex = Math.max(0, Math.min(2, currentIndex + modifier));

    return complexityLevels[newIndex] as 'simple' | 'moderate' | 'complex';
  }

  /**
   * Adjust task estimation based on persona template
   */
  private adjustEstimation(hours: number, template?: WorkflowTemplate): number {
    if (!template) return hours;

    return Math.max(0.5, hours * template.taskModifiers.estimation);
  }

  /**
   * Integrate MCP servers into tasks
   */
  private integrateMCPServers(tasks: WorkflowTask[], requirements: RequirementSet): WorkflowTask[] {
    return tasks.map(task => ({
      ...task,
      mcpServers: this.selectMCPServers(task, requirements)
    }));
  }

  /**
   * Select appropriate MCP servers for a task
   */
  private selectMCPServers(task: WorkflowTask, requirements: RequirementSet): MCPServer[] {
    const servers: MCPServer[] = [];

    // Add servers based on task type and requirements
    if (task.persona === 'frontend') {
      servers.push('context7');
    }

    if (task.complexity === 'complex') {
      servers.push('sequential');
    }

    if (requirements.technical.length > 0) {
      servers.push('magic');
    }

    if (task.tags.includes('testing') || task.tags.includes('validation')) {
      servers.push('playwright');
    }

    return servers;
  }

  /**
   * Generate deliverables for a phase
   */
  private generateDeliverables(phase: WorkflowPhase, requirements: RequirementSet): string[] {
    const deliverables: string[] = [];

    switch (phase.id) {
      case 'requirements':
        deliverables.push('Requirements document', 'Acceptance criteria matrix');
        break;
      case 'architecture':
        deliverables.push('Architecture document', 'Technology selection rationale');
        break;
      case 'development':
        deliverables.push('Source code', 'Unit tests', 'Integration tests');
        break;
      case 'testing':
        deliverables.push('Test reports', 'Bug reports', 'Performance metrics');
        break;
      case 'deployment':
        deliverables.push('Deployment guide', 'Configuration files', 'Monitoring setup');
        break;
    }

    return deliverables;
  }

  /**
   * Plan MCP integration for the workflow
   */
  private planMCPIntegration(phases: WorkflowPhase[], mcpServers: MCPServer[]): MCPIntegrationPlan {
    const coordination: { server: MCPServer; phases: string[]; purpose: string }[] = [];
    const fallbackStrategies: { server: MCPServer; fallback: string }[] = [];

    mcpServers.forEach(server => {
      const relevantPhases = phases.filter(phase =>
        phase.tasks.some(task => task.mcpServers.includes(server))
      );

      if (relevantPhases.length > 0) {
        coordination.push({
          server,
          phases: relevantPhases.map(p => p.id),
          purpose: this.getMCPServerPurpose(server)
        });
      }
    });

    return {
      servers: mcpServers,
      coordination,
      fallbackStrategies
    };
  }

  /**
   * Get the purpose of an MCP server
   */
  private getMCPServerPurpose(server: MCPServer): string {
    switch (server) {
      case 'context7':
        return 'Context-aware development assistance';
      case 'sequential':
        return 'Complex task breakdown and execution';
      case 'magic':
        return 'Technical implementation guidance';
      case 'playwright':
        return 'Automated testing and validation';
      default:
        return 'General development support';
    }
  }

  /**
   * Calculate total duration of workflow
   */
  private calculateDuration(phases: WorkflowPhase[]): string {
    const totalHours = phases.reduce((total, phase) => {
      return total + phase.tasks.reduce((phaseTotal, task) => phaseTotal + task.estimatedHours, 0);
    }, 0);

    const days = Math.ceil(totalHours / 8);
    const weeks = Math.ceil(days / 5);

    if (weeks > 1) {
      return `${weeks} weeks`;
    } else if (days > 1) {
      return `${days} days`;
    } else {
      return `${totalHours} hours`;
    }
  }

  /**
   * Extract title from requirements
   */
  private extractTitle(requirements: RequirementSet): string {
    const allRequirements = [
      ...requirements.functional,
      ...requirements.nonFunctional,
      ...requirements.technical
    ];

    if (allRequirements.length === 0) {
      return 'Workflow Generation';
    }

    // Try to extract title from first functional requirement
    const firstFunctional = requirements.functional[0];
    if (firstFunctional) {
      const words = firstFunctional.content.split(' ').slice(0, 5);
      return words.join(' ') + '...';
    }

    return 'Generated Workflow';
  }
}

// Supporting interfaces and classes
export interface GeneratedWorkflow {
  id: string;
  title: string;
  strategy: WorkflowStrategy['name'];
  primaryPersona: PersonaType;
  phases: WorkflowPhase[];
  dependencies?: DependencyMap;
  risks?: RiskAssessment[];
  parallelWorkStreams?: WorkflowTask[][];
  estimatedDuration: string;
  createdAt: Date;
  mcpIntegration: MCPIntegrationPlan;
}

export interface RequirementSet {
  functional: Requirement[];
  nonFunctional: Requirement[];
  technical: Requirement[];
  constraints: Constraint[];
  assumptions: Assumption[];
}

export interface Requirement {
  id: string;
  type: 'functional' | 'nonFunctional' | 'technical';
  content: string;
  priority: 'high' | 'medium' | 'low';
  source: string;
  acceptanceCriteria: string[];
}

export interface Constraint {
  id: string;
  type: 'technical' | 'business' | 'timeline' | 'resource';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface Assumption {
  id: string;
  description: string;
  validationRequired: boolean;
  owner: PersonaType;
}

export interface WorkflowTemplate {
  focusAreas: string[];
  preferredTools: MCPServer[];
  qualityGates: string[];
  taskModifiers: {
    complexity: number;
    estimation: number;
  };
}

export interface MCPIntegrationPlan {
  servers: MCPServer[];
  coordination: { server: MCPServer; phases: string[]; purpose: string }[];
  fallbackStrategies: { server: MCPServer; fallback: string }[];
}

// Supporting classes (to be implemented)
class RiskAnalyzer {
  assessRisks(phase: WorkflowPhase, requirements: RequirementSet): RiskAssessment[] {
    // Implementation for risk analysis
    return [];
  }

  getAllRisks(phases: WorkflowPhase[]): RiskAssessment[] {
    return phases.flatMap(phase => phase.risks);
  }
}

class DependencyMapper {
  analyzeDependencies(task: WorkflowTask, phases: WorkflowPhase[]): string[] {
    // Implementation for dependency analysis
    return [];
  }

  createMap(phases: WorkflowPhase[]): DependencyMap {
    // Implementation for dependency mapping
    return {
      internal: [],
      external: [],
      technical: [],
      team: []
    };
  }
}

class OutputFormatter {
  format(workflow: GeneratedWorkflow, format: OutputFormat): GeneratedWorkflow {
    // Implementation for output formatting
    return workflow;
  }
}

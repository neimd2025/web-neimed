/**
 * Output Formatters for Workflow Generation
 * Support for multiple output formats: roadmap, tasks, detailed
 */

import { GeneratedWorkflow, WorkflowPhase, WorkflowTask, RiskAssessment, DependencyMap, PersonaType } from './workflow-generator';
import { DependencyAnalysis, ParallelWorkStream } from './dependency-analyzer';

export type OutputFormat = 'roadmap' | 'tasks' | 'detailed' | 'json' | 'markdown';

export interface FormattedOutput {
  format: OutputFormat;
  content: string;
  metadata: OutputMetadata;
}

export interface OutputMetadata {
  generatedAt: Date;
  totalPhases: number;
  totalTasks: number;
  estimatedDuration: string;
  primaryPersona: PersonaType;
  complexity: 'simple' | 'moderate' | 'complex';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface FormattingOptions {
  includeEstimates: boolean;
  includeRisks: boolean;
  includeDependencies: boolean;
  includeParallelStreams: boolean;
  includeMilestones: boolean;
  includeAcceptanceCriteria: boolean;
  includePersonaGuidance: boolean;
  compressionLevel: 'none' | 'light' | 'medium' | 'heavy';
  colorCoding: boolean;
  interactive: boolean;
}

export class OutputFormatter {
  private templates: Map<OutputFormat, OutputTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Format workflow into specified output format
   */
  format(
    workflow: GeneratedWorkflow, 
    format: OutputFormat, 
    options: Partial<FormattingOptions> = {},
    dependencyAnalysis?: DependencyAnalysis
  ): FormattedOutput {
    const fullOptions: FormattingOptions = {
      includeEstimates: true,
      includeRisks: true,
      includeDependencies: true,
      includeParallelStreams: true,
      includeMilestones: true,
      includeAcceptanceCriteria: true,
      includePersonaGuidance: true,
      compressionLevel: 'none',
      colorCoding: false,
      interactive: false,
      ...options
    };

    const template = this.templates.get(format);
    if (!template) {
      throw new Error(`Unsupported output format: ${format}`);
    }

    const content = template.render(workflow, fullOptions, dependencyAnalysis);
    const metadata = this.generateMetadata(workflow, format);

    return {
      format,
      content,
      metadata
    };
  }

  /**
   * Generate multiple formats simultaneously
   */
  formatMultiple(
    workflow: GeneratedWorkflow,
    formats: OutputFormat[],
    options: Partial<FormattingOptions> = {},
    dependencyAnalysis?: DependencyAnalysis
  ): FormattedOutput[] {
    return formats.map(format => 
      this.format(workflow, format, options, dependencyAnalysis)
    );
  }

  private initializeTemplates(): void {
    // Roadmap Template
    this.templates.set('roadmap', new RoadmapTemplate());
    
    // Tasks Template
    this.templates.set('tasks', new TasksTemplate());
    
    // Detailed Template
    this.templates.set('detailed', new DetailedTemplate());
    
    // JSON Template
    this.templates.set('json', new JSONTemplate());
    
    // Markdown Template
    this.templates.set('markdown', new MarkdownTemplate());
  }

  private generateMetadata(workflow: GeneratedWorkflow, format: OutputFormat): OutputMetadata {
    const totalTasks = workflow.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
    const avgRiskScore = workflow.risks 
      ? workflow.risks.reduce((sum, risk) => sum + this.getRiskScore(risk), 0) / workflow.risks.length
      : 0;

    return {
      generatedAt: new Date(),
      totalPhases: workflow.phases.length,
      totalTasks,
      estimatedDuration: workflow.estimatedDuration,
      primaryPersona: workflow.primaryPersona,
      complexity: this.determineComplexity(totalTasks, workflow.phases),
      riskLevel: this.determineRiskLevel(avgRiskScore)
    };
  }

  private getRiskScore(risk: RiskAssessment): number {
    const probabilityScore = { low: 0.2, medium: 0.5, high: 0.8 }[risk.probability] || 0.5;
    const impactScore = { low: 0.2, medium: 0.5, high: 0.8 }[risk.impact] || 0.5;
    return probabilityScore * impactScore;
  }

  private determineComplexity(totalTasks: number, phases: WorkflowPhase[]): 'simple' | 'moderate' | 'complex' {
    if (totalTasks < 10 && phases.length < 3) return 'simple';
    if (totalTasks < 25 && phases.length < 5) return 'moderate';
    return 'complex';
  }

  private determineRiskLevel(avgRiskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (avgRiskScore < 0.2) return 'low';
    if (avgRiskScore < 0.4) return 'medium';
    if (avgRiskScore < 0.7) return 'high';
    return 'critical';
  }
}

// Abstract base template
abstract class OutputTemplate {
  abstract render(
    workflow: GeneratedWorkflow, 
    options: FormattingOptions, 
    dependencyAnalysis?: DependencyAnalysis
  ): string;

  protected formatDuration(hours: number): string {
    if (hours < 8) return `${hours}h`;
    const days = Math.ceil(hours / 8);
    if (days < 5) return `${days}d`;
    const weeks = Math.ceil(days / 5);
    return `${weeks}w`;
  }

  protected formatPersona(persona: PersonaType): string {
    const personaNames = {
      architect: '🏗️ Architect',
      frontend: '🎨 Frontend',
      backend: '⚙️ Backend',
      security: '🛡️ Security',
      devops: '🚀 DevOps', 
      qa: '🧪 QA',
      performance: '⚡ Performance',
      analyzer: '🔍 Analyzer',
      refactorer: '🔧 Refactorer',
      mentor: '👨‍🏫 Mentor',
      scribe: '📝 Scribe'
    };
    return personaNames[persona] || persona;
  }

  protected formatPriority(priority: 'high' | 'medium' | 'low'): string {
    const symbols = { high: '🔴', medium: '🟡', low: '🟢' };
    return symbols[priority] || '⚪';
  }

  protected formatRisk(risk: RiskAssessment): string {
    const riskIcons = {
      technical: '⚙️',
      timeline: '⏰',
      security: '🛡️',
      business: '💼'
    };
    return `${riskIcons[risk.type] || '⚠️'} ${risk.description}`;
  }
}

// Roadmap Template - High-level timeline view
class RoadmapTemplate extends OutputTemplate {
  render(workflow: GeneratedWorkflow, options: FormattingOptions, dependencyAnalysis?: DependencyAnalysis): string {
    let output = `# ${workflow.title} - Implementation Roadmap\n\n`;
    
    // Metadata section
    output += `**Strategy**: ${workflow.strategy.toUpperCase()}\n`;
    output += `**Primary Persona**: ${this.formatPersona(workflow.primaryPersona)}\n`;
    output += `**Estimated Duration**: ${workflow.estimatedDuration}\n`;
    output += `**Total Phases**: ${workflow.phases.length}\n\n`;

    // Critical path information
    if (options.includeDependencies && dependencyAnalysis?.criticalPath) {
      output += `## 🎯 Critical Path\n`;
      output += `**Tasks**: ${dependencyAnalysis.criticalPath.length} critical tasks\n`;
      output += `**Impact**: Any delay in these tasks will delay the entire project\n\n`;
    }

    // Parallel opportunities
    if (options.includeParallelStreams && dependencyAnalysis?.parallelOpportunities) {
      output += `## ⚡ Parallel Work Opportunities\n`;
      dependencyAnalysis.parallelOpportunities.forEach(stream => {
        output += `- **${stream.name}**: ${stream.tasks.length} tasks (${this.formatDuration(stream.estimatedDuration)})\n`;
      });
      output += '\n';
    }

    // Phase roadmap
    workflow.phases.forEach((phase, index) => {
      const weekNumber = index + 1;
      output += `## Phase ${index + 1}: ${phase.name}\n`;
      output += `**Duration**: ${phase.duration}\n`;
      output += `**Tasks**: ${phase.tasks.length}\n`;
      
      if (options.includeEstimates) {
        const totalHours = phase.tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
        output += `**Effort**: ${this.formatDuration(totalHours)}\n`;
      }

      output += `**Description**: ${phase.description}\n\n`;

      // Key deliverables
      if (phase.deliverables.length > 0) {
        output += `### 📦 Key Deliverables\n`;
        phase.deliverables.forEach(deliverable => {
          output += `- ${deliverable}\n`;
        });
        output += '\n';
      }

      // Milestones
      if (options.includeMilestones && phase.milestones.length > 0) {
        output += `### 🎯 Milestones\n`;
        phase.milestones.forEach(milestone => {
          output += `- [ ] ${milestone}\n`;
        });
        output += '\n';
      }

      // Risk highlights
      if (options.includeRisks && phase.risks.length > 0) {
        const highRisks = phase.risks.filter(risk => risk.impact === 'high' || risk.probability === 'high');
        if (highRisks.length > 0) {
          output += `### ⚠️ Key Risks\n`;
          highRisks.forEach(risk => {
            output += `- ${this.formatRisk(risk)}\n`;
          });
          output += '\n';
        }
      }

      output += '---\n\n';
    });

    // Risk summary
    if (options.includeRisks && workflow.risks) {
      const criticalRisks = workflow.risks.filter(risk => risk.impact === 'high');
      if (criticalRisks.length > 0) {
        output += `## 🚨 Critical Risks to Monitor\n\n`;
        criticalRisks.forEach(risk => {
          output += `### ${this.formatRisk(risk)}\n`;
          output += `**Probability**: ${risk.probability} | **Impact**: ${risk.impact}\n`;
          output += `**Mitigation**: ${risk.mitigation}\n\n`;
        });
      }
    }

    return output;
  }
}

// Tasks Template - Structured task breakdown
class TasksTemplate extends OutputTemplate {
  render(workflow: GeneratedWorkflow, options: FormattingOptions, dependencyAnalysis?: DependencyAnalysis): string {
    let output = `# ${workflow.title} - Task Breakdown\n\n`;

    workflow.phases.forEach(phase => {
      output += `## ${phase.name}\n\n`;

      phase.tasks.forEach(task => {
        output += `### ${task.title}\n`;
        output += `**Persona**: ${this.formatPersona(task.persona)}\n`;
        
        if (options.includeEstimates) {
          output += `**Estimated Time**: ${this.formatDuration(task.estimatedHours)}\n`;
        }
        
        output += `**Complexity**: ${task.complexity}\n`;
        output += `**Description**: ${task.description}\n\n`;

        // Dependencies
        if (options.includeDependencies && task.dependencies.length > 0) {
          output += `**Dependencies**:\n`;
          task.dependencies.forEach(dep => {
            output += `- ${dep}\n`;
          });
          output += '\n';
        }

        // Acceptance criteria
        if (options.includeAcceptanceCriteria && task.acceptanceCriteria.length > 0) {
          output += `**Acceptance Criteria**:\n`;
          task.acceptanceCriteria.forEach(criteria => {
            output += `- [ ] ${criteria}\n`;
          });
          output += '\n';
        }

        // MCP servers
        if (task.mcpServers.length > 0) {
          output += `**MCP Integration**: ${task.mcpServers.join(', ')}\n\n`;
        }

        output += '---\n\n';
      });
    });

    return output;
  }
}

// Detailed Template - Comprehensive implementation guide
class DetailedTemplate extends OutputTemplate {
  render(workflow: GeneratedWorkflow, options: FormattingOptions, dependencyAnalysis?: DependencyAnalysis): string {
    let output = `# ${workflow.title} - Detailed Implementation Guide\n\n`;

    // Executive summary
    output += `## 📋 Executive Summary\n\n`;
    output += `**Project Strategy**: ${workflow.strategy}\n`;
    output += `**Primary Persona**: ${this.formatPersona(workflow.primaryPersona)}\n`;
    output += `**Estimated Duration**: ${workflow.estimatedDuration}\n`;
    
    const totalTasks = workflow.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
    const totalHours = workflow.phases.reduce((sum, phase) => 
      sum + phase.tasks.reduce((taskSum, task) => taskSum + task.estimatedHours, 0), 0);
    
    output += `**Total Tasks**: ${totalTasks}\n`;
    output += `**Total Effort**: ${this.formatDuration(totalHours)}\n\n`;

    // Dependency analysis
    if (options.includeDependencies && dependencyAnalysis) {
      output += `## 🔗 Dependency Analysis\n\n`;
      
      if (dependencyAnalysis.criticalPath.length > 0) {
        output += `### Critical Path (${dependencyAnalysis.criticalPath.length} tasks)\n`;
        output += `Tasks on the critical path will directly impact project timeline if delayed.\n\n`;
      }

      if (dependencyAnalysis.bottlenecks.length > 0) {
        output += `### 🚧 Identified Bottlenecks\n`;
        dependencyAnalysis.bottlenecks.forEach(bottleneck => {
          output += `- **${bottleneck.description}**\n`;
          output += `  - Impact: ${bottleneck.impact}\n`;
          output += `  - Affected tasks: ${bottleneck.affectedTasks.length}\n`;
          output += `  - Mitigation: ${bottleneck.mitigationStrategies[0] || 'None specified'}\n\n`;
        });
      }
    }

    // Detailed phase breakdown
    workflow.phases.forEach((phase, phaseIndex) => {
      output += `## Phase ${phaseIndex + 1}: ${phase.name}\n\n`;
      output += `**Duration**: ${phase.duration}\n`;
      output += `**Description**: ${phase.description}\n\n`;

      // Phase-level risks
      if (options.includeRisks && phase.risks.length > 0) {
        output += `### ⚠️ Phase Risks\n`;
        phase.risks.forEach(risk => {
          output += `- **${this.formatRisk(risk)}**\n`;
          output += `  - Probability: ${risk.probability}, Impact: ${risk.impact}\n`;
          output += `  - Mitigation: ${risk.mitigation}\n\n`;
        });
      }

      // Tasks with full details
      phase.tasks.forEach((task, taskIndex) => {
        output += `### Task ${phaseIndex + 1}.${taskIndex + 1}: ${task.title}\n\n`;
        
        // Task metadata
        output += `| Attribute | Value |\n`;
        output += `|-----------|-------|\n`;
        output += `| **Persona** | ${this.formatPersona(task.persona)} |\n`;
        output += `| **Complexity** | ${task.complexity} |\n`;
        
        if (options.includeEstimates) {
          output += `| **Estimated Time** | ${this.formatDuration(task.estimatedHours)} |\n`;
        }
        
        output += `| **Phase** | ${task.phase.name} |\n`;
        output += `| **MCP Servers** | ${task.mcpServers.join(', ') || 'None'} |\n\n`;

        // Detailed description
        output += `**Description**: ${task.description}\n\n`;

        // Implementation steps (if available)
        if (options.includePersonaGuidance) {
          output += `**Implementation Approach**:\n`;
          output += `As a ${task.persona} specialist, focus on:\n`;
          
          const personaGuidance = this.getPersonaGuidance(task.persona);
          personaGuidance.forEach(guidance => {
            output += `- ${guidance}\n`;
          });
          output += '\n';
        }

        // Dependencies
        if (options.includeDependencies && task.dependencies.length > 0) {
          output += `**Dependencies**:\n`;
          task.dependencies.forEach(dep => {
            output += `- ${dep}\n`;
          });
          output += '\n';
        }

        // Acceptance criteria
        if (options.includeAcceptanceCriteria && task.acceptanceCriteria.length > 0) {
          output += `**Acceptance Criteria**:\n`;
          task.acceptanceCriteria.forEach((criteria, index) => {
            output += `${index + 1}. [ ] ${criteria}\n`;
          });
          output += '\n';
        }

        // Tools and resources
        if (task.tools.length > 0) {
          output += `**Recommended Tools**: ${task.tools.join(', ')}\n\n`;
        }

        output += '---\n\n';
      });
    });

    // MCP Integration Plan
    if (workflow.mcpIntegration) {
      output += `## 🤖 MCP Server Integration Plan\n\n`;
      workflow.mcpIntegration.coordination.forEach(coord => {
        output += `### ${coord.server.toUpperCase()}\n`;
        output += `**Purpose**: ${coord.purpose}\n`;
        output += `**Phases**: ${coord.phases.join(', ')}\n\n`;
      });
    }

    return output;
  }

  private getPersonaGuidance(persona: PersonaType): string[] {
    const guidance = {
      architect: [
        'Design system architecture and component relationships',
        'Ensure scalability and maintainability principles',
        'Define integration patterns and data flow'
      ],
      frontend: [
        'Focus on user experience and accessibility',
        'Implement responsive design patterns',
        'Optimize for performance and Core Web Vitals'
      ],
      backend: [
        'Design robust API endpoints with proper error handling',
        'Implement security best practices',
        'Optimize database queries and caching'
      ],
      security: [
        'Conduct threat modeling and risk assessment',
        'Implement authentication and authorization',
        'Ensure compliance with security standards'
      ],
      qa: [
        'Develop comprehensive test strategy',
        'Create automated test suites',
        'Validate against acceptance criteria'
      ]
    };

    return guidance[persona] || ['Apply domain expertise to implementation'];
  }
}

// JSON Template - Machine-readable format
class JSONTemplate extends OutputTemplate {
  render(workflow: GeneratedWorkflow, options: FormattingOptions, dependencyAnalysis?: DependencyAnalysis): string {
    const output = {
      workflow,
      dependencyAnalysis: options.includeDependencies ? dependencyAnalysis : undefined,
      generatedAt: new Date().toISOString(),
      options
    };

    return JSON.stringify(output, null, 2);
  }
}

// Markdown Template - Full markdown export
class MarkdownTemplate extends OutputTemplate {
  render(workflow: GeneratedWorkflow, options: FormattingOptions, dependencyAnalysis?: DependencyAnalysis): string {
    // Combine all templates for comprehensive markdown
    const roadmap = new RoadmapTemplate().render(workflow, options, dependencyAnalysis);
    const tasks = new TasksTemplate().render(workflow, options, dependencyAnalysis);
    const detailed = new DetailedTemplate().render(workflow, options, dependencyAnalysis);

    return `${roadmap}\n\n${tasks}\n\n${detailed}`;
  }
}
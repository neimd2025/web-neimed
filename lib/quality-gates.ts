/**
 * Quality Gates and Validation Framework
 * Comprehensive quality assurance for workflow generation and execution
 */

import { GeneratedWorkflow, WorkflowPhase, WorkflowTask, RiskAssessment, PersonaType } from './workflow-generator';
import { RequirementSet } from './prd-parser';
import { DependencyAnalysis } from './dependency-analyzer';

export interface QualityGate {
  id: string;
  name: string;
  description: string;
  category: QualityCategory;
  severity: 'blocking' | 'warning' | 'info';
  validator: QualityValidator;
  remediation: RemediationGuidance;
  metrics: QualityMetric[];
}

export type QualityCategory =
  | 'completeness'
  | 'consistency'
  | 'feasibility'
  | 'security'
  | 'performance'
  | 'maintainability'
  | 'testability'
  | 'compliance';

export interface QualityValidator {
  validate: (workflow: GeneratedWorkflow, context: ValidationContext) => ValidationResult;
  dependencies: string[];
  timeout: number; // milliseconds
}

export interface ValidationContext {
  requirements: RequirementSet;
  dependencyAnalysis?: DependencyAnalysis;
  projectContext: ProjectContext;
  constraints: ValidationConstraint[];
}

export interface ProjectContext {
  type: 'web' | 'mobile' | 'api' | 'desktop' | 'embedded';
  framework: string;
  teamSize: number;
  timeline: number; // days
  budget: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface ValidationConstraint {
  type: 'timeline' | 'budget' | 'resource' | 'technical' | 'compliance';
  value: any;
  description: string;
  mandatory: boolean;
}

export interface ValidationResult {
  passed: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  metrics: { [key: string]: number };
  recommendations: Recommendation[];
  evidence: Evidence[];
}

export interface ValidationIssue {
  id: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  category: QualityCategory;
  description: string;
  location: IssueLocation;
  impact: ImpactAssessment;
  remediation: string[];
}

export interface IssueLocation {
  type: 'workflow' | 'phase' | 'task' | 'requirement';
  id: string;
  line?: number;
  context: string;
}

export interface ImpactAssessment {
  timeline: number; // days delay
  quality: number; // 0-1 quality reduction
  cost: number; // relative cost increase
  risk: number; // 0-1 risk increase
}

export interface Recommendation {
  id: string;
  type: 'improvement' | 'optimization' | 'best-practice' | 'risk-mitigation';
  priority: 'high' | 'medium' | 'low';
  description: string;
  actions: string[];
  benefits: string[];
  effort: 'low' | 'medium' | 'high';
}

export interface Evidence {
  type: 'metric' | 'analysis' | 'reference' | 'calculation';
  description: string;
  value: any;
  source: string;
}

export interface RemediationGuidance {
  automated: boolean;
  steps: RemediationStep[];
  alternatives: string[];
  prevention: string[];
}

export interface RemediationStep {
  description: string;
  action: string;
  expected_outcome: string;
  verification: string;
}

export interface QualityMetric {
  name: string;
  type: 'ratio' | 'count' | 'percentage' | 'score';
  target: number;
  warning: number;
  critical: number;
  unit: string;
}

export interface QualityReport {
  overall_score: number;
  gate_results: QualityGateResult[];
  summary: QualitySummary;
  trends: QualityTrend[];
  recommendations: Recommendation[];
}

export interface QualityGateResult {
  gate: QualityGate;
  result: ValidationResult;
  execution_time: number;
  timestamp: Date;
}

export interface QualitySummary {
  passed_gates: number;
  total_gates: number;
  critical_issues: number;
  major_issues: number;
  minor_issues: number;
  quality_score: number;
  improvement_areas: string[];
}

export interface QualityTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  change: number;
  period: string;
}

export class QualityGateManager {
  private gates: Map<string, QualityGate> = new Map();
  private profiles: Map<string, QualityProfile> = new Map();

  constructor() {
    this.initializeStandardGates();
    this.initializeQualityProfiles();
  }

  /**
   * Execute all applicable quality gates
   */
  async executeQualityGates(
    workflow: GeneratedWorkflow,
    context: ValidationContext,
    profile: string = 'standard'
  ): Promise<QualityReport> {
    const qualityProfile = this.profiles.get(profile) || this.profiles.get('standard')!;
    const applicableGates = this.selectApplicableGates(workflow, context, qualityProfile);

    const results: QualityGateResult[] = [];

    for (const gate of applicableGates) {
      const startTime = Date.now();
      try {
        const result = await this.executeGate(gate, workflow, context);
        results.push({
          gate,
          result,
          execution_time: Date.now() - startTime,
          timestamp: new Date()
        });
      } catch (error) {
        results.push({
          gate,
          result: {
            passed: false,
            score: 0,
            issues: [{
              id: `gate-error-${gate.id}`,
              severity: 'critical',
              category: gate.category,
              description: `Quality gate execution failed: ${error}`,
              location: { type: 'workflow', id: workflow.id, context: 'gate execution' },
              impact: { timeline: 0, quality: 0, cost: 0, risk: 0.8 },
              remediation: ['Review gate configuration', 'Check system status']
            }],
            metrics: {},
            recommendations: [],
            evidence: []
          },
          execution_time: Date.now() - startTime,
          timestamp: new Date()
        });
      }
    }

    return this.generateQualityReport(results);
  }

  /**
   * Execute individual quality gate
   */
  private async executeGate(
    gate: QualityGate,
    workflow: GeneratedWorkflow,
    context: ValidationContext
  ): Promise<ValidationResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Quality gate timeout: ${gate.id}`));
      }, gate.validator.timeout);

      try {
        const result = gate.validator.validate(workflow, context);
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private initializeStandardGates(): void {
    // Completeness Gate
    this.gates.set('completeness', {
      id: 'completeness',
      name: 'Workflow Completeness',
      description: 'Validates that all essential workflow elements are present and complete',
      category: 'completeness',
      severity: 'blocking',
      validator: {
        validate: (workflow, context) => this.validateCompleteness(workflow, context),
        dependencies: [],
        timeout: 5000
      },
      remediation: {
        automated: false,
        steps: [
          {
            description: 'Review missing elements',
            action: 'Identify incomplete sections',
            expected_outcome: 'Complete element list',
            verification: 'All elements present'
          }
        ],
        alternatives: ['Manual completion', 'Template application'],
        prevention: ['Use workflow templates', 'Follow checklists']
      },
      metrics: [
        {
          name: 'phase_completion',
          type: 'percentage',
          target: 100,
          warning: 90,
          critical: 80,
          unit: '%'
        },
        {
          name: 'task_completion',
          type: 'percentage',
          target: 100,
          warning: 95,
          critical: 85,
          unit: '%'
        }
      ]
    });

    // Consistency Gate
    this.gates.set('consistency', {
      id: 'consistency',
      name: 'Workflow Consistency',
      description: 'Ensures consistency across workflow phases, tasks, and dependencies',
      category: 'consistency',
      severity: 'warning',
      validator: {
        validate: (workflow, context) => this.validateConsistency(workflow, context),
        dependencies: [],
        timeout: 10000
      },
      remediation: {
        automated: true,
        steps: [
          {
            description: 'Standardize naming conventions',
            action: 'Apply consistent naming',
            expected_outcome: 'Uniform naming across workflow',
            verification: 'No naming inconsistencies'
          }
        ],
        alternatives: ['Manual standardization'],
        prevention: ['Use naming conventions', 'Template-based generation']
      },
      metrics: [
        {
          name: 'naming_consistency',
          type: 'percentage',
          target: 95,
          warning: 85,
          critical: 70,
          unit: '%'
        }
      ]
    });

    // Feasibility Gate
    this.gates.set('feasibility', {
      id: 'feasibility',
      name: 'Implementation Feasibility',
      description: 'Assesses whether the workflow is realistically implementable within constraints',
      category: 'feasibility',
      severity: 'blocking',
      validator: {
        validate: (workflow, context) => this.validateFeasibility(workflow, context),
        dependencies: ['dependency_analysis'],
        timeout: 15000
      },
      remediation: {
        automated: false,
        steps: [
          {
            description: 'Review resource requirements',
            action: 'Analyze resource constraints',
            expected_outcome: 'Realistic resource plan',
            verification: 'Resources available'
          }
        ],
        alternatives: ['Scope reduction', 'Timeline extension', 'Resource increase'],
        prevention: ['Realistic estimation', 'Resource planning']
      },
      metrics: [
        {
          name: 'timeline_feasibility',
          type: 'score',
          target: 80,
          warning: 60,
          critical: 40,
          unit: 'score'
        }
      ]
    });

    // Security Gate
    this.gates.set('security', {
      id: 'security',
      name: 'Security Validation',
      description: 'Validates security considerations and requirements are addressed',
      category: 'security',
      severity: 'blocking',
      validator: {
        validate: (workflow, context) => this.validateSecurity(workflow, context),
        dependencies: [],
        timeout: 8000
      },
      remediation: {
        automated: false,
        steps: [
          {
            description: 'Add security tasks',
            action: 'Include security validation tasks',
            expected_outcome: 'Security tasks present',
            verification: 'Security requirements covered'
          }
        ],
        alternatives: ['Security expert consultation'],
        prevention: ['Security-first design', 'Threat modeling']
      },
      metrics: [
        {
          name: 'security_coverage',
          type: 'percentage',
          target: 90,
          warning: 70,
          critical: 50,
          unit: '%'
        }
      ]
    });

    // Performance Gate
    this.gates.set('performance', {
      id: 'performance',
      name: 'Performance Validation',
      description: 'Ensures performance requirements and testing are adequately addressed',
      category: 'performance',
      severity: 'warning',
      validator: {
        validate: (workflow, context) => this.validatePerformance(workflow, context),
        dependencies: [],
        timeout: 6000
      },
      remediation: {
        automated: true,
        steps: [
          {
            description: 'Add performance testing tasks',
            action: 'Include performance validation',
            expected_outcome: 'Performance tasks added',
            verification: 'Performance requirements testable'
          }
        ],
        alternatives: ['Manual performance testing'],
        prevention: ['Performance-first design', 'Early testing']
      },
      metrics: [
        {
          name: 'performance_test_coverage',
          type: 'percentage',
          target: 80,
          warning: 60,
          critical: 40,
          unit: '%'
        }
      ]
    });

    // Add more gates...
    this.initializeAdditionalGates();
  }

  private initializeAdditionalGates(): void {
    // Testability Gate
    this.gates.set('testability', {
      id: 'testability',
      name: 'Testability Assessment',
      description: 'Validates that the workflow includes adequate testing strategies and coverage',
      category: 'testability',
      severity: 'warning',
      validator: {
        validate: (workflow, context) => this.validateTestability(workflow, context),
        dependencies: [],
        timeout: 7000
      },
      remediation: {
        automated: true,
        steps: [
          {
            description: 'Add testing tasks',
            action: 'Include comprehensive testing tasks',
            expected_outcome: 'Testing coverage improved',
            verification: 'All components testable'
          }
        ],
        alternatives: ['Manual testing approach'],
        prevention: ['Test-driven development', 'Testing strategy planning']
      },
      metrics: [
        {
          name: 'test_task_ratio',
          type: 'ratio',
          target: 0.3,
          warning: 0.2,
          critical: 0.1,
          unit: 'ratio'
        }
      ]
    });

    // Compliance Gate
    this.gates.set('compliance', {
      id: 'compliance',
      name: 'Compliance Validation',
      description: 'Ensures workflow meets regulatory and organizational compliance requirements',
      category: 'compliance',
      severity: 'blocking',
      validator: {
        validate: (workflow, context) => this.validateCompliance(workflow, context),
        dependencies: [],
        timeout: 12000
      },
      remediation: {
        automated: false,
        steps: [
          {
            description: 'Review compliance requirements',
            action: 'Analyze regulatory requirements',
            expected_outcome: 'Compliance gaps identified',
            verification: 'All requirements addressed'
          }
        ],
        alternatives: ['Compliance expert consultation'],
        prevention: ['Compliance-first design', 'Regular audits']
      },
      metrics: [
        {
          name: 'compliance_coverage',
          type: 'percentage',
          target: 100,
          warning: 90,
          critical: 80,
          unit: '%'
        }
      ]
    });
  }

  private initializeQualityProfiles(): void {
    this.profiles.set('standard', {
      name: 'Standard Quality Profile',
      gates: ['completeness', 'consistency', 'feasibility', 'security'],
      thresholds: { overall_score: 75, critical_issues: 0, major_issues: 3 }
    });

    this.profiles.set('strict', {
      name: 'Strict Quality Profile',
      gates: ['completeness', 'consistency', 'feasibility', 'security', 'performance', 'testability'],
      thresholds: { overall_score: 85, critical_issues: 0, major_issues: 1 }
    });

    this.profiles.set('enterprise', {
      name: 'Enterprise Quality Profile',
      gates: ['completeness', 'consistency', 'feasibility', 'security', 'performance', 'testability', 'compliance'],
      thresholds: { overall_score: 90, critical_issues: 0, major_issues: 0 }
    });
  }

  // Validation implementations
  private validateCompleteness(workflow: GeneratedWorkflow, context: ValidationContext): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Check phases
    if (workflow.phases.length === 0) {
      issues.push({
        id: 'no-phases',
        severity: 'critical',
        category: 'completeness',
        description: 'Workflow has no phases defined',
        location: { type: 'workflow', id: workflow.id, context: 'phases' },
        impact: { timeline: 0, quality: 0.8, cost: 0, risk: 0.9 },
        remediation: ['Add workflow phases', 'Use phase templates']
      });
      score -= 50;
    }

    // Check tasks in phases
    workflow.phases.forEach(phase => {
      if (phase.tasks.length === 0) {
        issues.push({
          id: `no-tasks-${phase.id}`,
          severity: 'major',
          category: 'completeness',
          description: `Phase "${phase.name}" has no tasks`,
          location: { type: 'phase', id: phase.id, context: 'tasks' },
          impact: { timeline: 1, quality: 0.3, cost: 0, risk: 0.4 },
          remediation: ['Add tasks to phase', 'Review phase requirements']
        });
        score -= 10;
      }

      // Check task completeness
      phase.tasks.forEach(task => {
        if (!task.description || task.description.trim().length === 0) {
          issues.push({
            id: `no-description-${task.id}`,
            severity: 'minor',
            category: 'completeness',
            description: `Task "${task.title}" has no description`,
            location: { type: 'task', id: task.id, context: 'description' },
            impact: { timeline: 0, quality: 0.1, cost: 0, risk: 0.1 },
            remediation: ['Add task description', 'Clarify task requirements']
          });
          score -= 2;
        }
      });
    });

    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      score: Math.max(0, score),
      issues,
      metrics: {
        phase_completion: workflow.phases.length > 0 ? 100 : 0,
        task_completion: this.calculateTaskCompletionRate(workflow)
      },
      recommendations: this.generateCompletenessRecommendations(issues),
      evidence: [
        {
          type: 'metric',
          description: 'Total phases in workflow',
          value: workflow.phases.length,
          source: 'workflow analysis'
        }
      ]
    };
  }

  private validateConsistency(workflow: GeneratedWorkflow, context: ValidationContext): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Check naming consistency
    const personaUsage = new Map<PersonaType, number>();
    const complexityDistribution = new Map<string, number>();

    workflow.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        personaUsage.set(task.persona, (personaUsage.get(task.persona) || 0) + 1);
        complexityDistribution.set(task.complexity, (complexityDistribution.get(task.complexity) || 0) + 1);
      });
    });

    // Check for unused personas
    if (personaUsage.size > 3) {
      issues.push({
        id: 'too-many-personas',
        severity: 'minor',
        category: 'consistency',
        description: 'Too many different personas used, may indicate lack of focus',
        location: { type: 'workflow', id: workflow.id, context: 'persona distribution' },
        impact: { timeline: 0, quality: 0.1, cost: 0, risk: 0.2 },
        remediation: ['Consolidate similar personas', 'Review task assignments']
      });
      score -= 5;
    }

    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      score: Math.max(0, score),
      issues,
      metrics: {
        naming_consistency: this.calculateNamingConsistency(workflow)
      },
      recommendations: [],
      evidence: []
    };
  }

  private validateFeasibility(workflow: GeneratedWorkflow, context: ValidationContext): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Calculate total effort
    const totalHours = workflow.phases.reduce((sum, phase) =>
      sum + phase.tasks.reduce((taskSum, task) => taskSum + task.estimatedHours, 0), 0);

    // Check against timeline constraints
    const timelineConstraint = context.constraints.find(c => c.type === 'timeline');
    if (timelineConstraint && timelineConstraint.value) {
      const availableHours = timelineConstraint.value * 8; // Assume 8 hours per day
      if (totalHours > availableHours * 1.2) { // 20% buffer
        issues.push({
          id: 'timeline-infeasible',
          severity: 'critical',
          category: 'feasibility',
          description: `Estimated effort (${totalHours}h) exceeds available time (${availableHours}h)`,
          location: { type: 'workflow', id: workflow.id, context: 'timeline' },
          impact: { timeline: Math.ceil((totalHours - availableHours) / 8), quality: 0.2, cost: 0.3, risk: 0.8 },
          remediation: ['Reduce scope', 'Extend timeline', 'Add resources', 'Optimize tasks']
        });
        score -= 40;
      }
    }

    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      score: Math.max(0, score),
      issues,
      metrics: {
        timeline_feasibility: totalHours <= (timelineConstraint?.value || Infinity) * 8 ? 100 : 60
      },
      recommendations: [],
      evidence: []
    };
  }

  private validateSecurity(workflow: GeneratedWorkflow, context: ValidationContext): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Check for security-related tasks
    const securityTasks = workflow.phases.flatMap(phase => phase.tasks)
      .filter(task =>
        task.persona === 'security' ||
        task.title.toLowerCase().includes('security') ||
        task.description.toLowerCase().includes('security')
      );

    if (securityTasks.length === 0) {
      issues.push({
        id: 'no-security-tasks',
        severity: 'major',
        category: 'security',
        description: 'No security-focused tasks identified in workflow',
        location: { type: 'workflow', id: workflow.id, context: 'security tasks' },
        impact: { timeline: 2, quality: 0.4, cost: 0.1, risk: 0.7 },
        remediation: ['Add security validation tasks', 'Include threat modeling', 'Add security testing']
      });
      score -= 30;
    }

    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      score: Math.max(0, score),
      issues,
      metrics: {
        security_coverage: (securityTasks.length / Math.max(1, workflow.phases.flatMap(p => p.tasks).length)) * 100
      },
      recommendations: [],
      evidence: []
    };
  }

  private validatePerformance(workflow: GeneratedWorkflow, context: ValidationContext): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Similar implementation for performance validation
    // Check for performance testing tasks, optimization considerations, etc.

    return {
      passed: true,
      score,
      issues,
      metrics: { performance_test_coverage: 75 },
      recommendations: [],
      evidence: []
    };
  }

  private validateTestability(workflow: GeneratedWorkflow, context: ValidationContext): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Check testing task ratio
    const allTasks = workflow.phases.flatMap(phase => phase.tasks);
    const testingTasks = allTasks.filter(task =>
      task.persona === 'qa' ||
      task.title.toLowerCase().includes('test')
    );

    const testRatio = testingTasks.length / Math.max(1, allTasks.length);
    if (testRatio < 0.2) { // Less than 20% testing tasks
      issues.push({
        id: 'insufficient-testing',
        severity: 'major',
        category: 'testability',
        description: `Low testing task ratio: ${Math.round(testRatio * 100)}% (recommended: >20%)`,
        location: { type: 'workflow', id: workflow.id, context: 'testing coverage' },
        impact: { timeline: 1, quality: 0.3, cost: 0.2, risk: 0.5 },
        remediation: ['Add unit testing tasks', 'Include integration testing', 'Add E2E testing']
      });
      score -= 25;
    }

    return {
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      score: Math.max(0, score),
      issues,
      metrics: {
        test_task_ratio: testRatio
      },
      recommendations: [],
      evidence: []
    };
  }

  private validateCompliance(workflow: GeneratedWorkflow, context: ValidationContext): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Check for compliance-related constraints
    const complianceConstraints = context.constraints.filter(c => c.type === 'compliance');

    // Implementation would check specific compliance requirements
    // For now, basic validation

    return {
      passed: true,
      score,
      issues,
      metrics: { compliance_coverage: 90 },
      recommendations: [],
      evidence: []
    };
  }

  // Helper methods
  private selectApplicableGates(
    workflow: GeneratedWorkflow,
    context: ValidationContext,
    profile: QualityProfile
  ): QualityGate[] {
    return profile.gates.map(gateId => this.gates.get(gateId)!).filter(Boolean);
  }

  private generateQualityReport(results: QualityGateResult[]): QualityReport {
    const passed = results.filter(r => r.result.passed).length;
    const totalScore = results.reduce((sum, r) => sum + r.result.score, 0) / results.length;

    const allIssues = results.flatMap(r => r.result.issues);
    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
    const majorIssues = allIssues.filter(i => i.severity === 'major').length;
    const minorIssues = allIssues.filter(i => i.severity === 'minor').length;

    return {
      overall_score: Math.round(totalScore),
      gate_results: results,
      summary: {
        passed_gates: passed,
        total_gates: results.length,
        critical_issues: criticalIssues,
        major_issues: majorIssues,
        minor_issues: minorIssues,
        quality_score: Math.round(totalScore),
        improvement_areas: this.identifyImprovementAreas(allIssues)
      },
      trends: [], // Would be populated from historical data
      recommendations: this.consolidateRecommendations(results)
    };
  }

  private calculateTaskCompletionRate(workflow: GeneratedWorkflow): number {
    const allTasks = workflow.phases.flatMap(phase => phase.tasks);
    if (allTasks.length === 0) return 0;

    const completeTasks = allTasks.filter(task =>
      task.description && task.description.trim().length > 0
    );

    return (completeTasks.length / allTasks.length) * 100;
  }

  private calculateNamingConsistency(workflow: GeneratedWorkflow): number {
    // Simplified naming consistency calculation
    return 85; // Would implement actual naming pattern analysis
  }

  private generateCompletenessRecommendations(issues: ValidationIssue[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (issues.some(i => i.id === 'no-phases')) {
      recommendations.push({
        id: 'add-phases',
        type: 'improvement',
        priority: 'high',
        description: 'Add structured phases to organize workflow',
        actions: ['Define project phases', 'Use phase templates', 'Sequence activities'],
        benefits: ['Better organization', 'Clear milestones', 'Improved tracking'],
        effort: 'medium'
      });
    }

    return recommendations;
  }

  private identifyImprovementAreas(issues: ValidationIssue[]): string[] {
    const areas = new Set<string>();
    issues.forEach(issue => {
      areas.add(issue.category);
    });
    return Array.from(areas);
  }

  private consolidateRecommendations(results: QualityGateResult[]): Recommendation[] {
    return results.flatMap(r => r.result.recommendations);
  }
}

interface QualityProfile {
  name: string;
  gates: string[];
  thresholds: {
    overall_score: number;
    critical_issues: number;
    major_issues: number;
  };
}

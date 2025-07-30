/**
 * Dependency Analysis and Risk Assessment Engine
 * Comprehensive analysis of project dependencies, risks, and critical path identification
 */

import { WorkflowTask, WorkflowPhase, DependencyMap, RiskAssessment, PersonaType } from './workflow-generator';

export interface DependencyAnalysis {
  graph: DependencyGraph;
  criticalPath: string[];
  parallelOpportunities: ParallelWorkStream[];
  bottlenecks: Bottleneck[];
  riskAreas: RiskArea[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  levels: DependencyLevel[];
}

export interface DependencyNode {
  id: string;
  taskId: string;
  title: string;
  type: 'task' | 'milestone' | 'external' | 'constraint';
  duration: number;
  earliestStart: number;
  latestStart: number;
  slack: number;
  critical: boolean;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag: number;
  description: string;
}

export interface DependencyLevel {
  level: number;
  nodes: string[];
  parallelizable: boolean;
}

export interface ParallelWorkStream {
  id: string;
  name: string;
  tasks: string[];
  estimatedDuration: number;
  requiredResources: ResourceRequirement[];
  conflictsWith: string[];
}

export interface ResourceRequirement {
  type: 'skill' | 'tool' | 'environment' | 'external';
  name: string;
  availability: 'always' | 'limited' | 'scheduled';
  conflicts: string[];
}

export interface Bottleneck {
  id: string;
  type: 'resource' | 'dependency' | 'external' | 'technical';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  affectedTasks: string[];
  mitigationStrategies: string[];
  estimatedDelay: number;
}

export interface RiskArea {
  id: string;
  category: 'technical' | 'timeline' | 'resource' | 'external' | 'quality';
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  riskScore: number; // probability * impact
  indicators: string[];
  triggers: string[];
  mitigationPlan: MitigationPlan;
  contingencyPlan: ContingencyPlan;
}

export interface MitigationPlan {
  strategies: MitigationStrategy[];
  owner: PersonaType;
  timeline: string;
  cost: 'low' | 'medium' | 'high';
  effectiveness: number; // 0-1
}

export interface MitigationStrategy {
  id: string;
  description: string;
  actions: string[];
  dependencies: string[];
  success_criteria: string[];
}

export interface ContingencyPlan {
  trigger: string;
  actions: string[];
  fallbackOptions: string[];
  escalationPath: PersonaType[];
}

export class DependencyAnalyzer {
  private riskPatterns: Map<string, RiskPattern> = new Map();
  private dependencyRules: DependencyRule[] = [];

  constructor() {
    this.initializeRiskPatterns();
    this.initializeDependencyRules();
  }

  /**
   * Analyze dependencies across all workflow phases
   */
  analyzeDependencies(phases: WorkflowPhase[]): DependencyAnalysis {
    // Build dependency graph
    const graph = this.buildDependencyGraph(phases);
    
    // Calculate critical path
    const criticalPath = this.calculateCriticalPath(graph);
    
    // Identify parallel opportunities
    const parallelOpportunities = this.identifyParallelOpportunities(graph, phases);
    
    // Detect bottlenecks
    const bottlenecks = this.detectBottlenecks(graph, phases);
    
    // Assess risk areas
    const riskAreas = this.assessRiskAreas(phases, graph);

    return {
      graph,
      criticalPath,
      parallelOpportunities,
      bottlenecks,
      riskAreas
    };
  }

  /**
   * Build comprehensive dependency graph
   */
  private buildDependencyGraph(phases: WorkflowPhase[]): DependencyGraph {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Create nodes for all tasks
    phases.forEach(phase => {
      phase.tasks.forEach(task => {
        nodes.push({
          id: task.id,
          taskId: task.id,
          title: task.title,
          type: 'task',
          duration: task.estimatedHours,
          earliestStart: 0,
          latestStart: 0,
          slack: 0,
          critical: false
        });
      });
    });

    // Create edges based on dependencies
    phases.forEach(phase => {
      phase.tasks.forEach(task => {
        task.dependencies.forEach(depId => {
          edges.push({
            from: depId,
            to: task.id,
            type: 'finish-to-start',
            lag: 0,
            description: `${task.title} depends on completion of ${depId}`
          });
        });
      });
    });

    // Add phase-level dependencies
    for (let i = 1; i < phases.length; i++) {
      const prevPhase = phases[i - 1];
      const currentPhase = phases[i];
      
      if (prevPhase.tasks.length > 0 && currentPhase.tasks.length > 0) {
        const lastTask = prevPhase.tasks[prevPhase.tasks.length - 1];
        const firstTask = currentPhase.tasks[0];
        
        edges.push({
          from: lastTask.id,
          to: firstTask.id,
          type: 'finish-to-start',
          lag: 0,
          description: `Phase transition: ${prevPhase.name} → ${currentPhase.name}`
        });
      }
    }

    // Calculate scheduling information
    this.calculateScheduling(nodes, edges);

    // Create dependency levels
    const levels = this.createDependencyLevels(nodes, edges);

    return { nodes, edges, levels };
  }

  /**
   * Calculate critical path using CPM algorithm
   */
  private calculateCriticalPath(graph: DependencyGraph): string[] {
    const { nodes, edges } = graph;
    const criticalPath: string[] = [];

    // Find critical nodes (nodes with zero slack)
    const criticalNodes = nodes.filter(node => node.critical);

    // Trace critical path from start to end
    if (criticalNodes.length > 0) {
      const startNodes = criticalNodes.filter(node => 
        !edges.some(edge => edge.to === node.id)
      );

      if (startNodes.length > 0) {
        let currentNode = startNodes[0];
        criticalPath.push(currentNode.id);

        while (true) {
          const nextEdge = edges.find(edge => 
            edge.from === currentNode.id && 
            criticalNodes.some(node => node.id === edge.to)
          );

          if (!nextEdge) break;

          const nextNode = criticalNodes.find(node => node.id === nextEdge.to);
          if (!nextNode) break;

          criticalPath.push(nextNode.id);
          currentNode = nextNode;
        }
      }
    }

    return criticalPath;
  }

  /**
   * Identify opportunities for parallel execution
   */
  private identifyParallelOpportunities(
    graph: DependencyGraph, 
    phases: WorkflowPhase[]
  ): ParallelWorkStream[] {
    const opportunities: ParallelWorkStream[] = [];

    graph.levels.forEach((level, index) => {
      if (level.nodes.length > 1 && level.parallelizable) {
        const tasks = level.nodes;
        const workStreamTasks = phases
          .flatMap(phase => phase.tasks)
          .filter(task => tasks.includes(task.id));

        if (workStreamTasks.length > 1) {
          const totalDuration = Math.max(...workStreamTasks.map(task => task.estimatedHours));
          
          opportunities.push({
            id: `parallel-${index}`,
            name: `Parallel Stream ${index + 1}`,
            tasks: tasks,
            estimatedDuration: totalDuration,
            requiredResources: this.analyzeResourceRequirements(workStreamTasks),
            conflictsWith: this.identifyResourceConflicts(workStreamTasks)
          });
        }
      }
    });

    return opportunities;
  }

  /**
   * Detect potential bottlenecks in the workflow
   */
  private detectBottlenecks(graph: DependencyGraph, phases: WorkflowPhase[]): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    const allTasks = phases.flatMap(phase => phase.tasks);

    // Resource bottlenecks - tasks requiring same specialized skills
    const skillGroups = this.groupTasksBySkill(allTasks);
    skillGroups.forEach((tasks, skill) => {
      if (tasks.length > 1) {
        const overlappingTasks = this.findOverlappingTasks(tasks, graph);
        if (overlappingTasks.length > 1) {
          bottlenecks.push({
            id: `skill-bottleneck-${skill}`,
            type: 'resource',
            description: `Multiple tasks require ${skill} expertise simultaneously`,
            impact: this.assessBottleneckImpact(overlappingTasks),
            affectedTasks: overlappingTasks.map(task => task.id),
            mitigationStrategies: [
              'Cross-train team members',
              'Hire additional specialist',
              'Reschedule tasks sequentially'
            ],
            estimatedDelay: this.calculateBottleneckDelay(overlappingTasks)
          });
        }
      }
    });

    // Dependency bottlenecks - nodes with many dependencies
    graph.nodes.forEach(node => {
      const incomingEdges = graph.edges.filter(edge => edge.to === node.id);
      const outgoingEdges = graph.edges.filter(edge => edge.from === node.id);

      if (incomingEdges.length > 3 || outgoingEdges.length > 3) {
        bottlenecks.push({
          id: `dependency-bottleneck-${node.id}`,
          type: 'dependency',
          description: `Task ${node.title} has high dependency complexity`,
          impact: node.critical ? 'critical' : 'high',
          affectedTasks: [node.id, ...outgoingEdges.map(edge => edge.to)],
          mitigationStrategies: [
            'Break down complex task',
            'Reduce dependencies',
            'Create parallel paths'
          ],
          estimatedDelay: node.critical ? node.duration * 0.2 : 0
        });
      }
    });

    return bottlenecks;
  }

  /**
   * Assess risk areas across the workflow
   */
  private assessRiskAreas(phases: WorkflowPhase[], graph: DependencyGraph): RiskArea[] {
    const riskAreas: RiskArea[] = [];

    phases.forEach(phase => {
      phase.tasks.forEach(task => {
        // Technical complexity risks
        if (task.complexity === 'complex') {
          riskAreas.push({
            id: `technical-risk-${task.id}`,
            category: 'technical',
            description: `High technical complexity in ${task.title}`,
            probability: 0.4,
            impact: 0.7,
            riskScore: 0.28,
            indicators: ['Complex requirements', 'New technology', 'Integration challenges'],
            triggers: ['Implementation starts', 'Integration phase begins'],
            mitigationPlan: {
              strategies: [
                {
                  id: 'prototype-first',
                  description: 'Build prototype to validate approach',
                  actions: ['Create proof of concept', 'Validate with stakeholders', 'Refine approach'],
                  dependencies: [],
                  success_criteria: ['Prototype validates approach', 'Technical feasibility confirmed']
                }
              ],
              owner: task.persona,
              timeline: 'Before implementation',
              cost: 'medium',
              effectiveness: 0.8
            },
            contingencyPlan: {
              trigger: 'Technical blockers encountered',
              actions: ['Seek expert consultation', 'Consider alternative approaches', 'Escalate to architect'],
              fallbackOptions: ['Simplified implementation', 'Third-party solution', 'Phased approach'],
              escalationPath: ['architect', 'security', 'performance']
            }
          });
        }

        // Timeline risks for critical path tasks
        const node = graph.nodes.find(n => n.taskId === task.id);
        if (node?.critical) {
          riskAreas.push({
            id: `timeline-risk-${task.id}`,
            category: 'timeline',
            description: `Critical path task ${task.title} may cause delays`,
            probability: 0.3,
            impact: 0.9,
            riskScore: 0.27,
            indicators: ['Critical path task', 'Complex dependencies', 'Resource constraints'],
            triggers: ['Task delays', 'Dependency issues', 'Resource unavailability'],
            mitigationPlan: {
              strategies: [
                {
                  id: 'buffer-time',
                  description: 'Add buffer time to critical tasks',
                  actions: ['Increase estimates by 20%', 'Plan contingency time', 'Monitor progress closely'],
                  dependencies: [],
                  success_criteria: ['Buffer time allocated', 'Progress tracking active']
                }
              ],
              owner: 'architect',
              timeline: 'During planning',
              cost: 'low',
              effectiveness: 0.7
            },
            contingencyPlan: {
              trigger: 'Task exceeds timeline',
              actions: ['Reallocate resources', 'Reduce scope', 'Adjust dependencies'],
              fallbackOptions: ['Parallel execution', 'Overtime work', 'External help'],
              escalationPath: ['architect', 'mentor']
            }
          });
        }
      });
    });

    return riskAreas.sort((a, b) => b.riskScore - a.riskScore);
  }

  // Helper methods
  private calculateScheduling(nodes: DependencyNode[], edges: DependencyEdge[]): void {
    // Forward pass - calculate earliest start times
    const visited = new Set<string>();
    const queue = nodes.filter(node => 
      !edges.some(edge => edge.to === node.id)
    );

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const successors = edges.filter(edge => edge.from === current.id);
      successors.forEach(edge => {
        const successor = nodes.find(n => n.id === edge.to)!;
        successor.earliestStart = Math.max(
          successor.earliestStart,
          current.earliestStart + current.duration + edge.lag
        );
        
        if (!queue.some(n => n.id === successor.id)) {
          queue.push(successor);
        }
      });
    }

    // Backward pass - calculate latest start times and slack
    const maxFinish = Math.max(...nodes.map(n => n.earliestStart + n.duration));
    
    const reverseQueue = nodes.filter(node => 
      !edges.some(edge => edge.from === node.id)
    );
    
    reverseQueue.forEach(node => {
      node.latestStart = maxFinish - node.duration;
    });

    const reverseVisited = new Set<string>();
    while (reverseQueue.length > 0) {
      const current = reverseQueue.shift()!;
      if (reverseVisited.has(current.id)) continue;
      reverseVisited.add(current.id);

      const predecessors = edges.filter(edge => edge.to === current.id);
      predecessors.forEach(edge => {
        const predecessor = nodes.find(n => n.id === edge.from)!;
        predecessor.latestStart = Math.min(
          predecessor.latestStart,
          current.latestStart - predecessor.duration - edge.lag
        );
        
        if (!reverseQueue.some(n => n.id === predecessor.id)) {
          reverseQueue.push(predecessor);
        }
      });
    }

    // Calculate slack and identify critical nodes
    nodes.forEach(node => {
      node.slack = node.latestStart - node.earliestStart;
      node.critical = node.slack === 0;
    });
  }

  private createDependencyLevels(nodes: DependencyNode[], edges: DependencyEdge[]): DependencyLevel[] {
    const levels: DependencyLevel[] = [];
    const processed = new Set<string>();
    let currentLevel = 0;

    while (processed.size < nodes.length) {
      const levelNodes = nodes.filter(node => 
        !processed.has(node.id) &&
        !edges.some(edge => 
          edge.to === node.id && !processed.has(edge.from)
        )
      );

      if (levelNodes.length === 0) break; // Circular dependency

      levels.push({
        level: currentLevel,
        nodes: levelNodes.map(node => node.id),
        parallelizable: levelNodes.length > 1 && this.canRunInParallel(levelNodes)
      });

      levelNodes.forEach(node => processed.add(node.id));
      currentLevel++;
    }

    return levels;
  }

  private canRunInParallel(nodes: DependencyNode[]): boolean {
    // Check if nodes can run in parallel based on resource requirements
    // For now, simplified logic - assume most tasks can run in parallel
    return nodes.length > 1;
  }

  private groupTasksBySkill(tasks: WorkflowTask[]): Map<string, WorkflowTask[]> {
    const skillGroups = new Map<string, WorkflowTask[]>();
    
    // This would need to be enhanced based on actual task skill requirements
    tasks.forEach(task => {
      const skill = task.persona; // Simplified - use persona as skill group
      if (!skillGroups.has(skill)) {
        skillGroups.set(skill, []);
      }
      skillGroups.get(skill)!.push(task);
    });

    return skillGroups;
  }

  private findOverlappingTasks(tasks: WorkflowTask[], graph: DependencyGraph): WorkflowTask[] {
    // Simplified overlap detection - would need actual scheduling information
    return tasks.length > 2 ? tasks.slice(0, 2) : tasks;
  }

  private assessBottleneckImpact(tasks: WorkflowTask[]): 'low' | 'medium' | 'high' | 'critical' {
    const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    if (totalHours > 80) return 'critical';
    if (totalHours > 40) return 'high';
    if (totalHours > 20) return 'medium';
    return 'low';
  }

  private calculateBottleneckDelay(tasks: WorkflowTask[]): number {
    // Estimate delay based on resource contention
    return Math.max(...tasks.map(task => task.estimatedHours)) * 0.5;
  }

  private analyzeResourceRequirements(tasks: WorkflowTask[]): ResourceRequirement[] {
    const requirements: ResourceRequirement[] = [];
    
    // Analyze skill requirements
    const skills = new Set(tasks.map(task => task.persona));
    skills.forEach(skill => {
      requirements.push({
        type: 'skill',
        name: skill,
        availability: 'limited',
        conflicts: []
      });
    });

    return requirements;
  }

  private identifyResourceConflicts(tasks: WorkflowTask[]): string[] {
    // Identify conflicting resource requirements
    const conflicts: string[] = [];
    const personas = tasks.map(task => task.persona);
    
    if (new Set(personas).size < personas.length) {
      conflicts.push('Multiple tasks require same persona');
    }

    return conflicts;
  }

  private initializeRiskPatterns(): void {
    // Initialize common risk patterns
    // This would be expanded with more comprehensive risk patterns
  }

  private initializeDependencyRules(): void {
    // Initialize dependency rules
    // This would be expanded with more comprehensive dependency rules
  }
}

interface RiskPattern {
  id: string;
  category: string;
  indicators: string[];
  probability: number;
  impact: number;
}

interface DependencyRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
}
/**
 * MCP Server Integration and Intelligent Routing
 * Coordinates with Context7, Sequential, Magic, and Playwright servers
 */

import { WorkflowTask, WorkflowPhase, PersonaType, MCPServer } from './workflow-generator';
import { RequirementSet } from './prd-parser';

export interface MCPCoordinationPlan {
  servers: MCPServerPlan[];
  orchestration: OrchestrationStrategy;
  fallbackPlan: FallbackStrategy;
  performance: PerformanceOptimization;
}

export interface MCPServerPlan {
  server: MCPServer;
  purpose: string;
  phases: string[];
  tasks: string[];
  priority: 'high' | 'medium' | 'low';
  coordination: ServerCoordination[];
  capabilities: ServerCapability[];
}

export interface ServerCoordination {
  with: MCPServer;
  type: 'sequential' | 'parallel' | 'handoff' | 'validation';
  triggers: string[];
  data_flow: 'one-way' | 'bidirectional';
}

export interface ServerCapability {
  capability: string;
  confidence: number; // 0-1
  conditions: string[];
  alternatives: string[];
}

export interface OrchestrationStrategy {
  primary: MCPServer;
  workflow: OrchestrationStep[];
  parallelization: ParallelizationPlan[];
  synchronization: SynchronizationPoint[];
}

export interface OrchestrationStep {
  step: number;
  server: MCPServer;
  action: string;
  inputs: string[];
  outputs: string[];
  dependencies: number[];
  timeout: number; // milliseconds
}

export interface ParallelizationPlan {
  name: string;
  servers: MCPServer[];
  coordination: 'independent' | 'synchronized' | 'competitive';
  merge_strategy: 'first-wins' | 'best-result' | 'consensus' | 'hybrid';
}

export interface SynchronizationPoint {
  step: number;
  servers: MCPServer[];
  condition: string;
  timeout: number;
  fallback: string;
}

export interface FallbackStrategy {
  triggers: FallbackTrigger[];
  alternatives: FallbackAlternative[];
  graceful_degradation: DegradationLevel[];
}

export interface FallbackTrigger {
  condition: 'timeout' | 'error' | 'unavailable' | 'quality_low';
  server: MCPServer;
  threshold: number;
}

export interface FallbackAlternative {
  original: MCPServer;
  alternative: MCPServer | 'native' | 'manual';
  capability_loss: number; // 0-1
  implementation: string;
}

export interface DegradationLevel {
  level: number;
  description: string;
  disabled_features: string[];
  enabled_alternatives: string[];
}

export interface PerformanceOptimization {
  caching: CachingStrategy;
  batching: BatchingStrategy;
  routing: RoutingOptimization;
  monitoring: PerformanceMonitoring;
}

export interface CachingStrategy {
  servers: { [key in MCPServer]?: CacheConfig };
  ttl: number; // seconds
  invalidation: string[];
}

export interface CacheConfig {
  enabled: boolean;
  size_limit: number; // MB
  eviction_policy: 'lru' | 'lfu' | 'ttl';
  shared: boolean;
}

export interface BatchingStrategy {
  enabled: boolean;
  batch_size: number;
  timeout: number;
  compatible_operations: string[];
}

export interface RoutingOptimization {
  load_balancing: boolean;
  server_affinity: boolean;
  geographic_routing: boolean;
  cost_optimization: boolean;
}

export interface PerformanceMonitoring {
  metrics: string[];
  alerts: AlertConfig[];
  optimization_triggers: string[];
}

export interface AlertConfig {
  metric: string;
  threshold: number;
  action: string;
}

export class MCPIntegrationManager {
  private serverCapabilities: Map<MCPServer, ServerCapability[]> = new Map();
  private personaPreferences: Map<PersonaType, MCPServer[]> = new Map();
  private coordinationPatterns: Map<string, ServerCoordination[]> = new Map();

  constructor() {
    this.initializeServerCapabilities();
    this.initializePersonaPreferences();
    this.initializeCoordinationPatterns();
  }

  /**
   * Plan MCP server integration for workflow
   */
  planIntegration(
    phases: WorkflowPhase[],
    requirements: RequirementSet,
    primaryPersona: PersonaType
  ): MCPCoordinationPlan {
    // Analyze workflow needs
    const needs = this.analyzeWorkflowNeeds(phases, requirements);
    
    // Select optimal servers
    const servers = this.selectOptimalServers(needs, primaryPersona);
    
    // Design orchestration strategy
    const orchestration = this.designOrchestration(servers, phases);
    
    // Plan fallback strategies
    const fallbackPlan = this.planFallbacks(servers, needs);
    
    // Optimize performance
    const performance = this.optimizePerformance(servers, orchestration);

    return {
      servers,
      orchestration,
      fallbackPlan,
      performance
    };
  }

  /**
   * Route task to appropriate MCP server(s)
   */
  routeTask(
    task: WorkflowTask,
    context: { phase: WorkflowPhase; persona: PersonaType; requirements: RequirementSet }
  ): MCPServerPlan[] {
    const needs = this.analyzeTaskNeeds(task, context);
    const candidates = this.getCandidateServers(needs);
    const optimal = this.selectOptimalServers(needs, context.persona);
    
    return optimal.filter(server => 
      candidates.some(candidate => candidate.server === server.server)
    );
  }

  private initializeServerCapabilities(): void {
    // Context7 Capabilities
    this.serverCapabilities.set('context7', [
      {
        capability: 'framework_documentation',
        confidence: 0.95,
        conditions: ['framework_identified', 'version_specified'],
        alternatives: ['web_search', 'manual_lookup']
      },
      {
        capability: 'best_practices_lookup',
        confidence: 0.90,
        conditions: ['domain_specified', 'technology_identified'],
        alternatives: ['general_knowledge', 'community_resources']
      },
      {
        capability: 'code_examples',
        confidence: 0.85,
        conditions: ['specific_use_case', 'framework_context'],
        alternatives: ['template_generation', 'manual_creation']
      },
      {
        capability: 'library_integration',
        confidence: 0.88,
        conditions: ['library_identified', 'version_compatibility'],
        alternatives: ['manual_integration', 'alternative_library']
      }
    ]);

    // Sequential Capabilities
    this.serverCapabilities.set('sequential', [
      {
        capability: 'complex_analysis',
        confidence: 0.92,
        conditions: ['structured_problem', 'clear_objectives'],
        alternatives: ['step_by_step_manual', 'simplified_analysis']
      },
      {
        capability: 'multi_step_reasoning',
        confidence: 0.90,
        conditions: ['logical_dependencies', 'clear_constraints'],
        alternatives: ['linear_approach', 'parallel_analysis']
      },
      {
        capability: 'systematic_debugging',
        confidence: 0.88,
        conditions: ['error_context', 'reproducible_issue'],
        alternatives: ['manual_debugging', 'trial_and_error']
      },
      {
        capability: 'architecture_planning',
        confidence: 0.87,
        conditions: ['requirements_clear', 'constraints_defined'],
        alternatives: ['template_architecture', 'iterative_design']
      }
    ]);

    // Magic Capabilities
    this.serverCapabilities.set('magic', [
      {
        capability: 'ui_component_generation',
        confidence: 0.93,
        conditions: ['design_requirements', 'framework_specified'],
        alternatives: ['manual_coding', 'template_customization']
      },
      {
        capability: 'design_system_integration',
        confidence: 0.89,
        conditions: ['design_system_available', 'component_specs'],
        alternatives: ['custom_styling', 'manual_integration']
      },
      {
        capability: 'responsive_layouts',
        confidence: 0.91,
        conditions: ['breakpoint_requirements', 'design_mockups'],
        alternatives: ['manual_css', 'framework_utilities']
      },
      {
        capability: 'accessibility_implementation',
        confidence: 0.86,
        conditions: ['wcag_requirements', 'user_scenarios'],
        alternatives: ['manual_implementation', 'accessibility_library']
      }
    ]);

    // Playwright Capabilities
    this.serverCapabilities.set('playwright', [
      {
        capability: 'e2e_testing',
        confidence: 0.94,
        conditions: ['test_scenarios_defined', 'application_deployed'],
        alternatives: ['manual_testing', 'alternative_framework']
      },
      {
        capability: 'performance_testing',
        confidence: 0.89,
        conditions: ['performance_metrics_defined', 'baseline_established'],
        alternatives: ['synthetic_monitoring', 'manual_testing']
      },
      {
        capability: 'cross_browser_validation',
        confidence: 0.92,
        conditions: ['browser_requirements', 'test_suite_ready'],
        alternatives: ['manual_testing', 'browserstack_integration']
      },
      {
        capability: 'visual_regression_testing',
        confidence: 0.87,
        conditions: ['visual_baselines', 'stable_ui'],
        alternatives: ['manual_review', 'screenshot_comparison']
      }
    ]);
  }

  private initializePersonaPreferences(): void {
    this.personaPreferences.set('frontend', ['magic', 'playwright', 'context7']);
    this.personaPreferences.set('backend', ['context7', 'sequential']);
    this.personaPreferences.set('security', ['sequential', 'context7']);
    this.personaPreferences.set('architect', ['sequential', 'context7']);
    this.personaPreferences.set('qa', ['playwright', 'sequential']);
    this.personaPreferences.set('performance', ['playwright', 'sequential']);
    this.personaPreferences.set('devops', ['sequential', 'context7']);
    this.personaPreferences.set('analyzer', ['sequential', 'context7']);
    this.personaPreferences.set('refactorer', ['sequential', 'context7']);
    this.personaPreferences.set('mentor', ['context7', 'sequential']);
    this.personaPreferences.set('scribe', ['context7', 'sequential']);
  }

  private initializeCoordinationPatterns(): void {
    // Frontend development pattern
    this.coordinationPatterns.set('frontend_development', [
      {
        with: 'context7',
        type: 'sequential',
        triggers: ['framework_research', 'best_practices_needed'],
        data_flow: 'one-way'
      },
      {
        with: 'magic',
        type: 'handoff',
        triggers: ['component_generation', 'ui_implementation'],
        data_flow: 'bidirectional'
      },
      {
        with: 'playwright',
        type: 'validation',
        triggers: ['testing_phase', 'quality_assurance'],
        data_flow: 'one-way'
      }
    ]);

    // Backend development pattern
    this.coordinationPatterns.set('backend_development', [
      {
        with: 'context7',
        type: 'sequential',
        triggers: ['api_patterns', 'framework_guidance'],
        data_flow: 'one-way'
      },
      {
        with: 'sequential',
        type: 'parallel',
        triggers: ['complex_logic', 'architecture_decisions'],
        data_flow: 'bidirectional'
      }
    ]);

    // Testing workflow pattern
    this.coordinationPatterns.set('testing_workflow', [
      {
        with: 'sequential',
        type: 'sequential',
        triggers: ['test_strategy', 'test_planning'],
        data_flow: 'one-way'
      },
      {
        with: 'playwright',
        type: 'handoff',
        triggers: ['test_execution', 'automation_setup'],
        data_flow: 'bidirectional'
      }
    ]);
  }

  private analyzeWorkflowNeeds(phases: WorkflowPhase[], requirements: RequirementSet): WorkflowNeeds {
    const needs: WorkflowNeeds = {
      documentation_lookup: 0,
      complex_analysis: 0,
      ui_generation: 0,
      testing_automation: 0,
      framework_guidance: 0,
      performance_validation: 0
    };

    // Analyze functional requirements
    requirements.functional.forEach(req => {
      const content = req.content.toLowerCase();
      if (content.includes('ui') || content.includes('interface')) {
        needs.ui_generation += 0.3;
      }
      if (content.includes('api') || content.includes('service')) {
        needs.framework_guidance += 0.2;
      }
      if (content.includes('test') || content.includes('validate')) {
        needs.testing_automation += 0.25;
      }
    });

    // Analyze technical requirements
    requirements.technical.forEach(req => {
      const content = req.content.toLowerCase();
      if (content.includes('framework') || content.includes('library')) {
        needs.documentation_lookup += 0.4;
        needs.framework_guidance += 0.3;
      }
      if (content.includes('performance') || content.includes('optimize')) {
        needs.performance_validation += 0.3;
      }
      if (content.includes('complex') || content.includes('architecture')) {
        needs.complex_analysis += 0.4;
      }
    });

    // Analyze phases for additional needs
    phases.forEach(phase => {
      phase.tasks.forEach(task => {
        if (task.complexity === 'complex') {
          needs.complex_analysis += 0.2;
        }
        if (task.persona === 'frontend') {
          needs.ui_generation += 0.15;
        }
        if (task.persona === 'qa') {
          needs.testing_automation += 0.2;
        }
      });
    });

    return needs;
  }

  private selectOptimalServers(needs: WorkflowNeeds, primaryPersona: PersonaType): MCPServerPlan[] {
    const plans: MCPServerPlan[] = [];
    const personaPrefs = this.personaPreferences.get(primaryPersona) || [];

    // Context7 selection
    if (needs.documentation_lookup > 0.3 || needs.framework_guidance > 0.2) {
      plans.push({
        server: 'context7',
        purpose: 'Framework documentation and best practices',
        phases: ['architecture', 'implementation'],
        tasks: [],
        priority: personaPrefs.includes('context7') ? 'high' : 'medium',
        coordination: this.coordinationPatterns.get(`${primaryPersona}_development`) || [],
        capabilities: this.serverCapabilities.get('context7') || []
      });
    }

    // Sequential selection
    if (needs.complex_analysis > 0.3) {
      plans.push({
        server: 'sequential',
        purpose: 'Complex analysis and systematic reasoning',
        phases: ['analysis', 'architecture', 'implementation'],
        tasks: [],
        priority: 'high',
        coordination: [],
        capabilities: this.serverCapabilities.get('sequential') || []
      });
    }

    // Magic selection
    if (needs.ui_generation > 0.2 && primaryPersona === 'frontend') {
      plans.push({
        server: 'magic',
        purpose: 'UI component generation and design system integration',
        phases: ['implementation'],
        tasks: [],
        priority: 'high',
        coordination: [],
        capabilities: this.serverCapabilities.get('magic') || []
      });
    }

    // Playwright selection
    if (needs.testing_automation > 0.2 || needs.performance_validation > 0.2) {
      plans.push({
        server: 'playwright',
        purpose: 'E2E testing and performance validation',
        phases: ['testing', 'validation'],
        tasks: [],
        priority: 'medium',
        coordination: [],
        capabilities: this.serverCapabilities.get('playwright') || []
      });
    }

    return plans;
  }

  private designOrchestration(servers: MCPServerPlan[], phases: WorkflowPhase[]): OrchestrationStrategy {
    // Determine primary server (highest priority)
    const primary = servers.reduce((prev, current) => 
      current.priority === 'high' && prev.priority !== 'high' ? current : prev
    ).server;

    // Create workflow steps
    const workflow: OrchestrationStep[] = [];
    let stepCounter = 1;

    phases.forEach(phase => {
      const phaseServers = servers.filter(server => 
        server.phases.includes(phase.id) || server.phases.includes(phase.name.toLowerCase())
      );

      phaseServers.forEach(serverPlan => {
        workflow.push({
          step: stepCounter++,
          server: serverPlan.server,
          action: `Execute ${phase.name} with ${serverPlan.purpose}`,
          inputs: [`${phase.name} requirements`],
          outputs: [`${phase.name} deliverables`],
          dependencies: stepCounter > 1 ? [stepCounter - 2] : [],
          timeout: 60000 // 1 minute default
        });
      });
    });

    return {
      primary,
      workflow,
      parallelization: this.identifyParallelization(servers),
      synchronization: this.identifySynchronization(workflow)
    };
  }

  private planFallbacks(servers: MCPServerPlan[], needs: WorkflowNeeds): FallbackStrategy {
    const triggers: FallbackTrigger[] = servers.map(server => ({
      condition: 'timeout',
      server: server.server,
      threshold: 30000 // 30 seconds
    }));

    const alternatives: FallbackAlternative[] = [
      {
        original: 'context7',
        alternative: 'native',
        capability_loss: 0.3,
        implementation: 'Use built-in knowledge and web search'
      },
      {
        original: 'sequential',
        alternative: 'native',
        capability_loss: 0.4,
        implementation: 'Use standard analytical approach'
      },
      {
        original: 'magic',
        alternative: 'manual',
        capability_loss: 0.6,
        implementation: 'Manual component creation'
      },
      {
        original: 'playwright',
        alternative: 'manual',
        capability_loss: 0.7,
        implementation: 'Manual testing procedures'
      }
    ];

    const graceful_degradation: DegradationLevel[] = [
      {
        level: 1,
        description: 'Reduced MCP functionality',
        disabled_features: ['Advanced coordination', 'Parallel processing'],
        enabled_alternatives: ['Sequential processing', 'Native tools']
      },
      {
        level: 2,
        description: 'Minimal MCP usage',
        disabled_features: ['All advanced features', 'Server coordination'],
        enabled_alternatives: ['Basic native tools', 'Manual processes']
      }
    ];

    return { triggers, alternatives, graceful_degradation };
  }

  private optimizePerformance(servers: MCPServerPlan[], orchestration: OrchestrationStrategy): PerformanceOptimization {
    return {
      caching: {
        servers: {
          context7: { enabled: true, size_limit: 100, eviction_policy: 'lru', shared: true },
          sequential: { enabled: true, size_limit: 50, eviction_policy: 'ttl', shared: false },
          magic: { enabled: true, size_limit: 200, eviction_policy: 'lfu', shared: true },
          playwright: { enabled: false, size_limit: 0, eviction_policy: 'lru', shared: false }
        },
        ttl: 3600, // 1 hour
        invalidation: ['workflow_change', 'requirements_update']
      },
      batching: {
        enabled: true,
        batch_size: 5,
        timeout: 5000,
        compatible_operations: ['documentation_lookup', 'component_generation']
      },
      routing: {
        load_balancing: true,
        server_affinity: true,
        geographic_routing: false,
        cost_optimization: true
      },
      monitoring: {
        metrics: ['response_time', 'success_rate', 'cache_hit_rate', 'error_rate'],
        alerts: [
          { metric: 'response_time', threshold: 10000, action: 'switch_to_fallback' },
          { metric: 'error_rate', threshold: 0.1, action: 'enable_degraded_mode' }
        ],
        optimization_triggers: ['high_latency', 'low_success_rate', 'resource_exhaustion']
      }
    };
  }

  // Helper methods
  private analyzeTaskNeeds(task: WorkflowTask, context: any): WorkflowNeeds {
    // Simplified task needs analysis
    return {
      documentation_lookup: task.mcpServers.includes('context7') ? 0.8 : 0.2,
      complex_analysis: task.complexity === 'complex' ? 0.9 : 0.3,
      ui_generation: task.persona === 'frontend' ? 0.7 : 0.1,
      testing_automation: task.persona === 'qa' ? 0.8 : 0.2,
      framework_guidance: 0.5,
      performance_validation: task.persona === 'performance' ? 0.9 : 0.2
    };
  }

  private getCandidateServers(needs: WorkflowNeeds): MCPServerPlan[] {
    // Return candidates based on needs analysis
    return Array.from(this.serverCapabilities.keys()).map(server => ({
      server,
      purpose: 'General support',
      phases: [],
      tasks: [],
      priority: 'medium' as const,
      coordination: [],
      capabilities: this.serverCapabilities.get(server) || []
    }));
  }

  private identifyParallelization(servers: MCPServerPlan[]): ParallelizationPlan[] {
    return [{
      name: 'Documentation and Analysis',
      servers: ['context7', 'sequential'],
      coordination: 'independent',
      merge_strategy: 'consensus'
    }];
  }

  private identifySynchronization(workflow: OrchestrationStep[]): SynchronizationPoint[] {
    return workflow
      .filter((step, index) => index > 0 && step.dependencies.length > 0)
      .map(step => ({
        step: step.step,
        servers: [step.server],
        condition: 'dependencies_complete',
        timeout: 30000,
        fallback: 'continue_without_sync'
      }));
  }
}

interface WorkflowNeeds {
  documentation_lookup: number;
  complex_analysis: number; 
  ui_generation: number;
  testing_automation: number;
  framework_guidance: number;
  performance_validation: number;
}
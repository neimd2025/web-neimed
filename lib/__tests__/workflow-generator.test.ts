/**
 * Test Suite for Workflow Generator System
 * Comprehensive tests for all workflow generation components
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WorkflowGenerator, GeneratedWorkflow, WorkflowGeneratorOptions } from '../workflow-generator';
import { PRDParser, ParsedPRD } from '../prd-parser';
import { PersonaTemplateManager } from '../persona-templates';
import { DependencyAnalyzer, DependencyAnalysis } from '../dependency-analyzer';
import { OutputFormatter, FormattedOutput } from '../output-formatters';
import { QualityGateManager, QualityReport } from '../quality-gates';
import { MCPIntegrationManager, MCPCoordinationPlan } from '../mcp-integration';

describe('WorkflowGenerator', () => {
  let generator: WorkflowGenerator;
  let samplePRD: string;
  let sampleOptions: WorkflowGeneratorOptions;

  beforeEach(() => {
    generator = new WorkflowGenerator();
    samplePRD = `# User Authentication System

## Overview
Implement a comprehensive user authentication system with modern security practices.

## Functional Requirements
- User registration with email validation
- Secure login with password hashing
- Password reset functionality
- Session management
- Role-based access control

## Acceptance Criteria
- [ ] Users can register with valid email addresses
- [ ] Passwords are hashed using bcrypt
- [ ] Password reset emails are sent successfully
- [ ] Sessions expire after inactivity
- [ ] Admin users have elevated permissions

## Technical Requirements
- Use JWT for session tokens
- Implement rate limiting for login attempts
- Support OAuth2 integration
- Ensure GDPR compliance
- Database encryption at rest

## Security Requirements
- Password complexity enforcement
- Multi-factor authentication support
- Audit logging for authentication events
- Protection against brute force attacks`;

    sampleOptions = {
      strategy: 'systematic',
      outputFormat: 'detailed',
      includeEstimates: true,
      includeDependencies: true,
      includeRisks: true,
      identifyParallel: true,
      createMilestones: true,
      mcpServers: ['context7', 'sequential']
    };
  });

  describe('Core Workflow Generation', () => {
    it('should generate workflow from PRD string', async () => {
      const workflow = await generator.generateWorkflow(samplePRD, sampleOptions);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBeTruthy();
      expect(workflow.title).toContain('Authentication');
      expect(workflow.strategy).toBe('systematic');
      expect(workflow.phases.length).toBeGreaterThan(0);
      expect(workflow.primaryPersona).toBe('security'); // Should detect security focus
    });

    it('should handle different workflow strategies', async () => {
      const strategies: Array<WorkflowGeneratorOptions['strategy']> = ['systematic', 'agile', 'mvp'];
      
      for (const strategy of strategies) {
        const options = { ...sampleOptions, strategy };
        const workflow = await generator.generateWorkflow(samplePRD, options);
        
        expect(workflow.strategy).toBe(strategy);
        expect(workflow.phases.length).toBeGreaterThan(0);
      }
    });

    it('should detect appropriate primary persona', async () => {
      const testCases = [
        { prd: 'Build React component library with Storybook', expectedPersona: 'frontend' },
        { prd: 'Design REST API with Node.js and PostgreSQL', expectedPersona: 'backend' },
        { prd: 'Implement OAuth2 security with threat modeling', expectedPersona: 'security' },
        { prd: 'Create system architecture for microservices', expectedPersona: 'architect' }
      ];

      for (const testCase of testCases) {
        const workflow = await generator.generateWorkflow(testCase.prd, sampleOptions);
        expect(workflow.primaryPersona).toBe(testCase.expectedPersona);
      }
    });

    it('should generate phases with tasks', async () => {
      const workflow = await generator.generateWorkflow(samplePRD, sampleOptions);

      expect(workflow.phases.length).toBeGreaterThanOrEqual(3);
      
      workflow.phases.forEach(phase => {
        expect(phase.id).toBeTruthy();
        expect(phase.name).toBeTruthy();
        expect(phase.description).toBeTruthy();
        expect(phase.tasks.length).toBeGreaterThan(0);
        
        phase.tasks.forEach(task => {
          expect(task.id).toBeTruthy();
          expect(task.title).toBeTruthy();
          expect(task.description).toBeTruthy();
          expect(task.persona).toBeTruthy();
          expect(task.estimatedHours).toBeGreaterThan(0);
          expect(['simple', 'moderate', 'complex']).toContain(task.complexity);
        });
      });
    });

    it('should include MCP server integration when requested', async () => {
      const workflow = await generator.generateWorkflow(samplePRD, sampleOptions);

      expect(workflow.mcpIntegration).toBeDefined();
      expect(workflow.mcpIntegration.servers).toContain('context7');
      expect(workflow.mcpIntegration.servers).toContain('sequential');
    });
  });

  describe('Options Handling', () => {
    it('should include estimates when requested', async () => {
      const withEstimates = await generator.generateWorkflow(samplePRD, { 
        ...sampleOptions, 
        includeEstimates: true 
      });
      const withoutEstimates = await generator.generateWorkflow(samplePRD, { 
        ...sampleOptions, 
        includeEstimates: false 
      });

      expect(withEstimates.estimatedDuration).toBeTruthy();
      expect(withoutEstimates.estimatedDuration).toBeTruthy(); // Always calculated internally
    });

    it('should include dependencies when requested', async () => {
      const workflow = await generator.generateWorkflow(samplePRD, {
        ...sampleOptions,
        includeDependencies: true
      });

      expect(workflow.dependencies).toBeDefined();
      if (workflow.dependencies) {
        expect(workflow.dependencies.internal).toBeInstanceOf(Array);
        expect(workflow.dependencies.external).toBeInstanceOf(Array);
        expect(workflow.dependencies.technical).toBeInstanceOf(Array);
      }
    });

    it('should include risks when requested', async () => {
      const workflow = await generator.generateWorkflow(samplePRD, {
        ...sampleOptions,
        includeRisks: true
      });

      expect(workflow.risks).toBeDefined();
      if (workflow.risks) {
        expect(workflow.risks.length).toBeGreaterThan(0);
        workflow.risks.forEach(risk => {
          expect(risk.id).toBeTruthy();
          expect(risk.description).toBeTruthy();
          expect(['technical', 'timeline', 'security', 'business']).toContain(risk.type);
          expect(['low', 'medium', 'high']).toContain(risk.probability);
          expect(['low', 'medium', 'high']).toContain(risk.impact);
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty PRD input', async () => {
      const workflow = await generator.generateWorkflow('', sampleOptions);
      expect(workflow.phases.length).toBeGreaterThan(0); // Should generate minimal workflow
    });

    it('should handle malformed PRD input', async () => {
      const malformedPRD = '### Invalid header structure without content';
      const workflow = await generator.generateWorkflow(malformedPRD, sampleOptions);
      expect(workflow).toBeDefined();
    });

    it('should handle invalid options gracefully', async () => {
      const invalidOptions = {
        ...sampleOptions,
        strategy: 'invalid-strategy' as any
      };
      
      const workflow = await generator.generateWorkflow(samplePRD, invalidOptions);
      expect(workflow.strategy).toBe('systematic'); // Should default to systematic
    });
  });
});

describe('PRDParser', () => {
  let parser: PRDParser;
  let samplePRD: string;

  beforeEach(() => {
    parser = new PRDParser();
    samplePRD = `# E-commerce Platform

## Overview
Build a modern e-commerce platform with React and Node.js.

## User Stories
- As a customer, I want to browse products so that I can find items to purchase
- As an admin, I want to manage inventory so that I can track stock levels

## Acceptance Criteria
- [ ] Product catalog displays correctly
- [ ] Shopping cart persists across sessions
- [ ] Payment processing is secure

## Technical Requirements
- Use React for frontend
- Implement GraphQL API
- PostgreSQL database
- Redis for caching

## Constraints
- Must launch within 3 months
- Budget limited to $50,000
- Team of 4 developers

## Assumptions
- Users have modern browsers
- Payment gateway API is available
- Third-party shipping integration works`;
  });

  it('should parse PRD sections correctly', async () => {
    const parsed = await parser.parsePRD(samplePRD);

    expect(parsed.sections.length).toBeGreaterThan(0);
    expect(parsed.sections.some(s => s.title.includes('Overview'))).toBe(true);
    expect(parsed.sections.some(s => s.title.includes('Requirements'))).toBe(true);
  });

  it('should extract metadata', async () => {
    const parsed = await parser.parsePRD(samplePRD);

    expect(parsed.metadata.title).toContain('E-commerce');
    expect(parsed.metadata.createdDate).toBeInstanceOf(Date);
  });

  it('should categorize requirements', async () => {
    const parsed = await parser.parsePRD(samplePRD);

    expect(parsed.requirements.functional.length).toBeGreaterThan(0);
    expect(parsed.requirements.technical.length).toBeGreaterThan(0);
    expect(parsed.requirements.constraints.length).toBeGreaterThan(0);
    expect(parsed.requirements.assumptions.length).toBeGreaterThan(0);
  });

  it('should assess complexity correctly', async () => {
    const simplePRD = 'Build a simple contact form';
    const complexPRD = samplePRD; // E-commerce platform

    const simple = await parser.parsePRD(simplePRD);
    const complex = await parser.parsePRD(complexPRD);

    expect(['simple', 'moderate']).toContain(simple.complexity);
    expect(['moderate', 'complex']).toContain(complex.complexity);
  });

  it('should recommend appropriate persona', async () => {
    const frontendPRD = 'Build responsive React components with accessibility features';
    const backendPRD = 'Design REST API with authentication and database integration';
    const securityPRD = 'Implement OAuth2 with threat modeling and encryption';

    const frontend = await parser.parsePRD(frontendPRD);
    const backend = await parser.parsePRD(backendPRD);
    const security = await parser.parsePRD(securityPRD);

    expect(frontend.recommendedPersona).toBe('frontend');
    expect(backend.recommendedPersona).toBe('backend');
    expect(security.recommendedPersona).toBe('security');
  });
});

describe('PersonaTemplateManager', () => {
  let manager: PersonaTemplateManager;

  beforeEach(() => {
    manager = new PersonaTemplateManager();
  });

  it('should provide templates for all personas', () => {
    const personas: Array<import('../workflow-generator').PersonaType> = [
      'architect', 'frontend', 'backend', 'security', 'devops', 
      'qa', 'performance', 'analyzer', 'refactorer', 'mentor', 'scribe'
    ];

    personas.forEach(persona => {
      const template = manager.getTemplate(persona);
      expect(template).toBeDefined();
      if (template) {
        expect(template.name).toBe(persona);
        expect(template.expertise.length).toBeGreaterThan(0);
        expect(template.focusAreas.length).toBeGreaterThan(0);
      }
    });
  });

  it('should apply persona template to tasks', () => {
    const sampleTasks = [{
      id: 'task-1',
      title: 'Build login component',
      description: 'Create React login component',
      persona: 'frontend' as const,
      complexity: 'moderate' as const,
      estimatedHours: 8,
      dependencies: [],
      acceptanceCriteria: ['Component renders correctly'],
      phase: { id: 'impl', name: 'Implementation' },
      tags: [],
      mcpServers: [],
      tools: []
    }];

    const enhanced = manager.applyTemplate(sampleTasks, 'frontend', {
      domain: 'ui',
      complexity: 'moderate'
    });

    expect(enhanced[0].persona).toBe('frontend');
    expect(enhanced[0].mcpServers.length).toBeGreaterThan(0);
    expect(enhanced[0].tools.length).toBeGreaterThan(0);
  });
});

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer;
  let samplePhases: any[];

  beforeEach(() => {
    analyzer = new DependencyAnalyzer();
    // Create sample phases for testing
    samplePhases = [
      {
        id: 'phase-1',
        name: 'Planning',
        tasks: [
          { id: 'task-1', title: 'Requirements analysis', estimatedHours: 16, dependencies: [] },
          { id: 'task-2', title: 'Architecture design', estimatedHours: 24, dependencies: ['task-1'] }
        ]
      },
      {
        id: 'phase-2', 
        name: 'Implementation',
        tasks: [
          { id: 'task-3', title: 'Backend development', estimatedHours: 40, dependencies: ['task-2'] },
          { id: 'task-4', title: 'Frontend development', estimatedHours: 32, dependencies: ['task-2'] }
        ]
      }
    ];
  });

  it('should analyze dependencies correctly', () => {
    const analysis = analyzer.analyzeDependencies(samplePhases);

    expect(analysis.graph).toBeDefined();
    expect(analysis.graph.nodes.length).toBeGreaterThan(0);
    expect(analysis.graph.edges.length).toBeGreaterThan(0);
    expect(analysis.criticalPath.length).toBeGreaterThan(0);
  });

  it('should identify parallel opportunities', () => {
    const analysis = analyzer.analyzeDependencies(samplePhases);

    expect(analysis.parallelOpportunities).toBeInstanceOf(Array);
    // Tasks 3 and 4 should be parallelizable
    const parallelTasks = analysis.parallelOpportunities.find(p => 
      p.tasks.includes('task-3') && p.tasks.includes('task-4')
    );
    expect(parallelTasks).toBeDefined();
  });

  it('should detect bottlenecks', () => {
    const analysis = analyzer.analyzeDependencies(samplePhases);

    expect(analysis.bottlenecks).toBeInstanceOf(Array);
    // Should identify task-2 as a bottleneck (blocking multiple tasks)
  });

  it('should assess risk areas', () => {
    const analysis = analyzer.analyzeDependencies(samplePhases);

    expect(analysis.riskAreas).toBeInstanceOf(Array);
    analysis.riskAreas.forEach(risk => {
      expect(risk.id).toBeTruthy();
      expect(risk.category).toBeTruthy();
      expect(risk.probability).toBeGreaterThanOrEqual(0);
      expect(risk.probability).toBeLessThanOrEqual(1);
    });
  });
});

describe('OutputFormatter', () => {
  let formatter: OutputFormatter;
  let sampleWorkflow: GeneratedWorkflow;

  beforeEach(() => {
    formatter = new OutputFormatter();
    sampleWorkflow = {
      id: 'workflow-1',
      title: 'Sample Workflow',
      strategy: 'systematic',
      primaryPersona: 'frontend',
      phases: [
        {
          id: 'phase-1',
          name: 'Development',
          description: 'Main development phase',
          duration: '2 weeks',
          tasks: [
            {
              id: 'task-1',
              title: 'Build components',
              description: 'Create React components',
              persona: 'frontend',
              complexity: 'moderate',
              estimatedHours: 16,
              dependencies: [],
              acceptanceCriteria: ['Components work correctly'],
              phase: { id: 'phase-1', name: 'Development' },
              tags: [],
              mcpServers: ['magic'],
              tools: ['React', 'Storybook']
            }
          ],
          milestones: ['Components complete'],
          deliverables: ['Component library'],
          risks: []
        }
      ],
      estimatedDuration: '2 weeks',
      createdAt: new Date(),
      mcpIntegration: {
        servers: ['magic'],
        coordination: [],
        fallbackStrategies: []
      }
    };
  });

  it('should format workflow as roadmap', () => {
    const output = formatter.format(sampleWorkflow, 'roadmap');

    expect(output.format).toBe('roadmap');
    expect(output.content).toContain('Implementation Roadmap');
    expect(output.content).toContain('Phase 1: Development');
    expect(output.metadata.totalPhases).toBe(1);
    expect(output.metadata.totalTasks).toBe(1);
  });

  it('should format workflow as tasks', () => {
    const output = formatter.format(sampleWorkflow, 'tasks');

    expect(output.format).toBe('tasks');
    expect(output.content).toContain('Task Breakdown');
    expect(output.content).toContain('Build components');
    expect(output.content).toContain('🎨 Frontend'); // Persona formatting
  });

  it('should format workflow as detailed guide', () => {
    const output = formatter.format(sampleWorkflow, 'detailed');

    expect(output.format).toBe('detailed');
    expect(output.content).toContain('Detailed Implementation Guide');
    expect(output.content).toContain('Executive Summary');
    expect(output.content).toContain('Task 1.1: Build components');
  });

  it('should format workflow as JSON', () => {
    const output = formatter.format(sampleWorkflow, 'json');

    expect(output.format).toBe('json');
    expect(() => JSON.parse(output.content)).not.toThrow();
    
    const parsed = JSON.parse(output.content);
    expect(parsed.workflow.id).toBe(sampleWorkflow.id);
  });

  it('should support multiple format generation', () => {
    const outputs = formatter.formatMultiple(sampleWorkflow, ['roadmap', 'tasks', 'json']);

    expect(outputs.length).toBe(3);
    expect(outputs.map(o => o.format)).toEqual(['roadmap', 'tasks', 'json']);
  });
});

describe('QualityGateManager', () => {
  let manager: QualityGateManager;
  let sampleWorkflow: GeneratedWorkflow;
  let sampleContext: any;

  beforeEach(() => {
    manager = new QualityGateManager();
    sampleWorkflow = {
      id: 'workflow-1',
      title: 'Test Workflow',
      strategy: 'systematic',
      primaryPersona: 'frontend',
      phases: [
        {
          id: 'phase-1',
          name: 'Implementation',
          description: 'Build the features',
          duration: '2 weeks',
          tasks: [
            {
              id: 'task-1',
              title: 'Build login form',
              description: 'Create secure login form with validation',
              persona: 'frontend',
              complexity: 'moderate',
              estimatedHours: 8,
              dependencies: [],
              acceptanceCriteria: ['Form validates input', 'Secure submission'],
              phase: { id: 'phase-1', name: 'Implementation' },
              tags: [],
              mcpServers: [],
              tools: []
            }
          ],
          milestones: [],
          deliverables: [],
          risks: []
        }
      ],
      estimatedDuration: '2 weeks',
      createdAt: new Date(),
      mcpIntegration: {
        servers: [],
        coordination: [],
        fallbackStrategies: []
      }
    };

    sampleContext = {
      requirements: {
        functional: [],
        nonFunctional: [],
        technical: [],
        constraints: [],
        assumptions: []
      },
      projectContext: {
        type: 'web',
        framework: 'React',
        teamSize: 3,
        timeline: 30,
        budget: 'medium',
        complexity: 'moderate'
      },
      constraints: []
    };
  });

  it('should execute quality gates and generate report', async () => {
    const report = await manager.executeQualityGates(sampleWorkflow, sampleContext);

    expect(report).toBeDefined();
    expect(report.overall_score).toBeGreaterThanOrEqual(0);
    expect(report.overall_score).toBeLessThanOrEqual(100);
    expect(report.gate_results.length).toBeGreaterThan(0);
    expect(report.summary).toBeDefined();
  });

  it('should identify completeness issues', async () => {
    const incompleteWorkflow = {
      ...sampleWorkflow,
      phases: [] // No phases
    };

    const report = await manager.executeQualityGates(incompleteWorkflow, sampleContext);
    
    const completenessResult = report.gate_results.find(r => r.gate.id === 'completeness');
    expect(completenessResult).toBeDefined();
    expect(completenessResult?.result.passed).toBe(false);
  });

  it('should validate feasibility constraints', async () => {
    const constrainedContext = {
      ...sampleContext,
      constraints: [
        {
          type: 'timeline',
          value: 1, // Only 1 day available
          description: 'Very tight deadline',
          mandatory: true
        }
      ]
    };

    const report = await manager.executeQualityGates(sampleWorkflow, constrainedContext);
    
    const feasibilityResult = report.gate_results.find(r => r.gate.id === 'feasibility');
    expect(feasibilityResult?.result.issues.length).toBeGreaterThan(0);
  });

  it('should use different quality profiles', async () => {
    const standardReport = await manager.executeQualityGates(sampleWorkflow, sampleContext, 'standard');
    const strictReport = await manager.executeQualityGates(sampleWorkflow, sampleContext, 'strict');

    expect(standardReport.gate_results.length).toBeLessThanOrEqual(strictReport.gate_results.length);
  });
});

describe('MCPIntegrationManager', () => {
  let manager: MCPIntegrationManager;
  let samplePhases: any[];
  let sampleRequirements: any;

  beforeEach(() => {
    manager = new MCPIntegrationManager();
    samplePhases = [
      {
        id: 'phase-1',
        name: 'Frontend Development',
        tasks: [
          { id: 'task-1', persona: 'frontend', title: 'Build UI components' }
        ]
      }
    ];
    sampleRequirements = {
      functional: [
        { content: 'Build responsive user interface', priority: 'high' }
      ],
      technical: [
        { content: 'Use React framework', priority: 'high' }
      ],
      nonFunctional: [],
      constraints: [],
      assumptions: []
    };
  });

  it('should plan MCP integration', () => {
    const plan = manager.planIntegration(samplePhases, sampleRequirements, 'frontend');

    expect(plan).toBeDefined();
    expect(plan.servers.length).toBeGreaterThan(0);
    expect(plan.orchestration).toBeDefined();
    expect(plan.fallbackPlan).toBeDefined();
    expect(plan.performance).toBeDefined();
  });

  it('should select appropriate servers for frontend tasks', () => {
    const plan = manager.planIntegration(samplePhases, sampleRequirements, 'frontend');
    
    const serverNames = plan.servers.map(s => s.server);
    expect(serverNames).toContain('magic'); // Should include Magic for UI generation
  });

  it('should include fallback strategies', () => {
    const plan = manager.planIntegration(samplePhases, sampleRequirements, 'frontend');

    expect(plan.fallbackPlan.alternatives.length).toBeGreaterThan(0);
    expect(plan.fallbackPlan.graceful_degradation.length).toBeGreaterThan(0);
  });

  it('should optimize performance', () => {
    const plan = manager.planIntegration(samplePhases, sampleRequirements, 'frontend');

    expect(plan.performance.caching).toBeDefined();
    expect(plan.performance.routing).toBeDefined();
    expect(plan.performance.monitoring).toBeDefined();
  });
});

describe('Integration Tests', () => {
  let generator: WorkflowGenerator;

  beforeEach(() => {
    generator = new WorkflowGenerator();
  });

  it('should generate complete workflow with all components', async () => {
    const prd = `# Complete Feature Implementation
    
## Overview
Build a user dashboard with real-time analytics and data visualization.

## Functional Requirements  
- Interactive charts and graphs
- Real-time data updates
- User filtering and search
- Export functionality

## Technical Requirements
- React with TypeScript
- WebSocket connections for real-time data
- Chart.js for visualizations
- Responsive design

## Security Requirements
- Authenticated access only
- Data encryption in transit
- Audit logging

## Performance Requirements
- Load time under 2 seconds
- Handle 1000+ concurrent users
- Smooth animations at 60fps`;

    const options: WorkflowGeneratorOptions = {
      strategy: 'systematic',
      outputFormat: 'detailed',
      includeEstimates: true,
      includeDependencies: true,
      includeRisks: true,
      identifyParallel: true,
      createMilestones: true,
      mcpServers: ['context7', 'sequential', 'magic', 'playwright']
    };

    const workflow = await generator.generateWorkflow(prd, options);

    // Verify workflow structure
    expect(workflow.phases.length).toBeGreaterThan(2);
    expect(workflow.primaryPersona).toBe('frontend'); // Should detect frontend focus
    
    // Verify MCP integration
    expect(workflow.mcpIntegration.servers).toContain('magic');
    expect(workflow.mcpIntegration.servers).toContain('playwright');
    
    // Verify risk assessment
    expect(workflow.risks).toBeDefined();
    expect(workflow.risks!.length).toBeGreaterThan(0);
    
    // Verify dependencies
    expect(workflow.dependencies).toBeDefined();
    
    // Verify tasks have proper structure
    const allTasks = workflow.phases.flatMap(p => p.tasks);
    expect(allTasks.length).toBeGreaterThan(5);
    
    allTasks.forEach(task => {
      expect(task.id).toBeTruthy();
      expect(task.title).toBeTruthy();
      expect(task.description).toBeTruthy();
      expect(task.estimatedHours).toBeGreaterThan(0);
      expect(task.persona).toBeTruthy();
    });
  });

  it('should maintain quality throughout the workflow generation pipeline', async () => {
    const prd = 'Build secure e-commerce API with comprehensive testing';
    const options: WorkflowGeneratorOptions = {
      strategy: 'systematic',
      outputFormat: 'roadmap',
      includeEstimates: true,
      includeDependencies: true,
      includeRisks: true,
      identifyParallel: false,
      createMilestones: true,
      mcpServers: ['context7', 'sequential']
    };

    // Generate workflow
    const workflow = await generator.generateWorkflow(prd, options);
    
    // Run quality gates
    const qualityManager = new QualityGateManager();
    const context = {
      requirements: {
        functional: [{ id: '1', type: 'functional' as const, content: 'API endpoints', priority: 'high' as const, source: 'prd', acceptanceCriteria: [] }],
        nonFunctional: [],
        technical: [],
        constraints: [],
        assumptions: []
      },
      projectContext: {
        type: 'api' as const,
        framework: 'Node.js',
        teamSize: 4,
        timeline: 60,
        budget: 'medium' as const,
        complexity: 'moderate' as const
      },
      constraints: []
    };

    const qualityReport = await qualityManager.executeQualityGates(workflow, context);
    
    // Verify quality standards are met
    expect(qualityReport.overall_score).toBeGreaterThan(70);
    expect(qualityReport.summary.critical_issues).toBe(0);
    
    // Format output
    const formatter = new OutputFormatter();
    const formatted = formatter.format(workflow, 'roadmap');
    
    expect(formatted.content).toContain('Implementation Roadmap');
    expect(formatted.metadata.complexity).toBeDefined();
  });
});

// Performance Tests
describe('Performance Tests', () => {
  let generator: WorkflowGenerator;

  beforeEach(() => {
    generator = new WorkflowGenerator();
  });

  it('should generate workflow within reasonable time limits', async () => {
    const largePRD = `# Large Enterprise System
    
${Array.from({ length: 50 }, (_, i) => `
## Feature ${i + 1}
Description of feature ${i + 1} with multiple requirements and acceptance criteria.

### Requirements
- Requirement 1 for feature ${i + 1}
- Requirement 2 for feature ${i + 1}
- Requirement 3 for feature ${i + 1}

### Acceptance Criteria
- [ ] Criteria 1 for feature ${i + 1}
- [ ] Criteria 2 for feature ${i + 1}
- [ ] Criteria 3 for feature ${i + 1}
`).join('')}`;

    const startTime = Date.now();
    const workflow = await generator.generateWorkflow(largePRD, {
      strategy: 'systematic',
      outputFormat: 'detailed',
      includeEstimates: true,
      includeDependencies: true,
      includeRisks: true,
      identifyParallel: true,
      createMilestones: true,
      mcpServers: ['context7', 'sequential']
    });
    const endTime = Date.now();

    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(30000); // Should complete within 30 seconds
    expect(workflow.phases.length).toBeGreaterThan(0);
  });

  it('should handle concurrent workflow generation', async () => {
    const prd = 'Build simple contact form with validation';
    const options: WorkflowGeneratorOptions = {
      strategy: 'mvp',
      outputFormat: 'tasks',
      includeEstimates: false,
      includeDependencies: false,
      includeRisks: false,
      identifyParallel: false,
      createMilestones: false,
      mcpServers: []
    };

    const startTime = Date.now();
    const promises = Array.from({ length: 5 }, () => 
      generator.generateWorkflow(prd, options)
    );

    const workflows = await Promise.all(promises);
    const endTime = Date.now();

    expect(workflows.length).toBe(5);
    workflows.forEach(workflow => {
      expect(workflow.phases.length).toBeGreaterThan(0);
    });

    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(15000); // Should complete within 15 seconds
  });
});
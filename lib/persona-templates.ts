/**
 * Persona-Specific Workflow Templates and Patterns
 * Comprehensive templates for each SuperClaude persona with domain expertise
 */

import { PersonaType, WorkflowTask, WorkflowPhase, MCPServer } from './workflow-generator';

export interface PersonaTemplate {
  name: PersonaType;
  description: string;
  expertise: string[];
  focusAreas: string[];
  preferredMCPServers: MCPServer[];
  qualityGates: QualityGate[];
  taskModifiers: TaskModifiers;
  phaseTemplates: PhaseTemplate[];
  riskPatterns: RiskPattern[];
  toolPreferences: ToolPreference[];
  estimationFactors: EstimationFactors;
}

export interface QualityGate {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  tools: string[];
  mcpServers: MCPServer[];
  blocking: boolean;
}

export interface TaskModifiers {
  complexityMultiplier: number;
  estimationBufferPercent: number;
  parallelizationFactor: number;
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface PhaseTemplate {
  id: string;
  name: string;
  description: string;
  taskPatterns: TaskPattern[];
  dependencies: string[];
  outputs: string[];
  validationSteps: string[];
}

export interface TaskPattern {
  id: string;
  title: string;
  description: string;
  category: 'analysis' | 'design' | 'implementation' | 'testing' | 'deployment' | 'documentation';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedHours: number;
  requiredSkills: string[];
  tools: string[];
  mcpServers: MCPServer[];
  acceptanceCriteria: string[];
}

export interface RiskPattern {
  id: string;
  category: 'technical' | 'timeline' | 'quality' | 'integration';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  indicators: string[];
  mitigationStrategies: string[];
}

export interface ToolPreference {
  tool: string;
  purpose: string;
  alternatives: string[];
  mcpServer?: MCPServer;
}

export interface EstimationFactors {
  baseHourMultiplier: number;
  complexityFactors: { simple: number; moderate: number; complex: number };
  domainSpecificFactors: { [key: string]: number };
  qualityGateOverhead: number;
}

export class PersonaTemplateManager {
  private templates: Map<PersonaType, PersonaTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  getTemplate(persona: PersonaType): PersonaTemplate | undefined {
    return this.templates.get(persona);
  }

  getAllTemplates(): PersonaTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Apply persona template to enhance workflow tasks
   */
  applyTemplate(
    tasks: WorkflowTask[], 
    persona: PersonaType, 
    context: { domain: string; complexity: string }
  ): WorkflowTask[] {
    const template = this.getTemplate(persona);
    if (!template) return tasks;

    return tasks.map(task => ({
      ...task,
      persona,
      mcpServers: this.selectMCPServers(task, template, context),
      tools: this.selectTools(task, template),
      estimatedHours: this.adjustEstimation(task.estimatedHours, template, context),
      acceptanceCriteria: this.enhanceAcceptanceCriteria(task.acceptanceCriteria, template)
    }));
  }

  private initializeTemplates(): void {
    // Frontend Persona Template
    this.templates.set('frontend', {
      name: 'frontend',
      description: 'UX specialist, accessibility advocate, performance-conscious developer',
      expertise: ['React', 'Vue', 'Angular', 'CSS', 'JavaScript', 'TypeScript', 'Responsive Design'],
      focusAreas: ['User Experience', 'Accessibility', 'Performance', 'Mobile Responsiveness', 'Design Systems'],
      preferredMCPServers: ['magic', 'playwright', 'context7'],
      qualityGates: [
        {
          id: 'accessibility-audit',
          name: 'Accessibility Audit',
          description: 'WCAG 2.1 AA compliance validation',
          criteria: ['Screen reader compatibility', 'Keyboard navigation', 'Color contrast ratios', 'Alt text coverage'],
          tools: ['axe', 'WAVE', 'Lighthouse'],
          mcpServers: ['playwright'],
          blocking: true
        },
        {
          id: 'performance-testing',
          name: 'Performance Testing',
          description: 'Core Web Vitals and loading performance validation',
          criteria: ['LCP < 2.5s', 'FID < 100ms', 'CLS < 0.1', 'Bundle size < 500KB'],
          tools: ['Lighthouse', 'WebPageTest', 'Bundle Analyzer'],
          mcpServers: ['playwright'],
          blocking: true
        },
        {
          id: 'cross-browser-testing',
          name: 'Cross-Browser Testing',
          description: 'Multi-browser compatibility validation',
          criteria: ['Chrome compatibility', 'Firefox compatibility', 'Safari compatibility', 'Mobile browser support'],
          tools: ['BrowserStack', 'Playwright'],
          mcpServers: ['playwright'],
          blocking: false
        }
      ],
      taskModifiers: {
        complexityMultiplier: 1.2,
        estimationBufferPercent: 15,
        parallelizationFactor: 0.7,
        riskTolerance: 'medium'
      },
      phaseTemplates: [
        {
          id: 'ui-design',
          name: 'UI Design & Component Planning',
          description: 'Design system integration and component architecture',
          taskPatterns: [
            {
              id: 'design-system-analysis',
              title: 'Design System Analysis',
              description: 'Analyze existing design system and identify required components',
              category: 'analysis',
              complexity: 'moderate',
              estimatedHours: 8,
              requiredSkills: ['Design Systems', 'Component Architecture'],
              tools: ['Figma', 'Storybook'],
              mcpServers: ['magic', 'context7'],
              acceptanceCriteria: ['Design system documented', 'Component inventory complete', 'Token system defined']
            },
            {
              id: 'component-implementation',
              title: 'Component Implementation',
              description: 'Build reusable UI components following design system patterns',
              category: 'implementation',
              complexity: 'moderate',
              estimatedHours: 16,
              requiredSkills: ['React/Vue/Angular', 'CSS-in-JS', 'TypeScript'],
              tools: ['IDE', 'Component Library'],
              mcpServers: ['magic', 'context7'],
              acceptanceCriteria: ['Components match designs', 'Props properly typed', 'Stories created', 'Tests written']
            }
          ],
          dependencies: [],
          outputs: ['Component library', 'Design tokens', 'Component documentation'],
          validationSteps: ['Visual regression testing', 'Accessibility audit', 'Performance testing']
        },
        {
          id: 'state-management',
          name: 'State Management & Data Flow',
          description: 'Application state architecture and data flow implementation',
          taskPatterns: [
            {
              id: 'state-architecture',
              title: 'State Architecture Design',
              description: 'Design global and local state management patterns',
              category: 'design',
              complexity: 'complex',
              estimatedHours: 12,
              requiredSkills: ['State Management', 'Data Flow', 'Architecture'],
              tools: ['Redux', 'Zustand', 'Context API'],
              mcpServers: ['sequential', 'context7'],
              acceptanceCriteria: ['State structure defined', 'Data flow documented', 'Performance optimized']
            }
          ],
          dependencies: ['ui-design'],
          outputs: ['State management setup', 'Data flow documentation'],
          validationSteps: ['State testing', 'Performance validation']
        }
      ],
      riskPatterns: [
        {
          id: 'design-changes',
          category: 'timeline',
          description: 'Late-stage design changes requiring significant rework',
          likelihood: 'medium',
          impact: 'high',
          indicators: ['Unclear designs', 'Missing design system', 'Stakeholder disagreements'],
          mitigationStrategies: ['Early design review', 'Prototype validation', 'Design system establishment']
        },
        {
          id: 'performance-issues',
          category: 'technical',
          description: 'Performance bottlenecks in complex UI interactions',
          likelihood: 'medium',
          impact: 'high',
          indicators: ['Complex animations', 'Large data sets', 'Real-time updates'],
          mitigationStrategies: ['Performance budgets', 'Progressive loading', 'Virtualization']
        }
      ],
      toolPreferences: [
        { tool: 'React/Next.js', purpose: 'Primary framework', alternatives: ['Vue/Nuxt', 'Angular'], mcpServer: 'magic' },
        { tool: 'Tailwind CSS', purpose: 'Styling framework', alternatives: ['CSS Modules', 'Styled Components'] },
        { tool: 'Storybook', purpose: 'Component development', alternatives: ['Docusaurus', 'Styleguidist'] },
        { tool: 'Playwright', purpose: 'E2E testing', alternatives: ['Cypress', 'Selenium'], mcpServer: 'playwright' }
      ],
      estimationFactors: {
        baseHourMultiplier: 1.1,
        complexityFactors: { simple: 1.0, moderate: 1.3, complex: 1.8 },
        domainSpecificFactors: { 'accessibility': 1.2, 'animations': 1.4, 'responsive': 1.15 },
        qualityGateOverhead: 0.2
      }
    });

    // Backend Persona Template
    this.templates.set('backend', {
      name: 'backend',
      description: 'Reliability engineer, API specialist, data integrity focus',
      expertise: ['Node.js', 'Python', 'Java', 'SQL', 'NoSQL', 'API Design', 'Microservices'],
      focusAreas: ['API Design', 'Database Architecture', 'Security', 'Performance', 'Scalability'],
      preferredMCPServers: ['context7', 'sequential'],
      qualityGates: [
        {
          id: 'api-documentation',
          name: 'API Documentation',
          description: 'Complete API documentation with examples',
          criteria: ['OpenAPI spec complete', 'Examples provided', 'Error responses documented'],
          tools: ['Swagger', 'Postman', 'Insomnia'],
          mcpServers: ['context7'],
          blocking: true
        },
        {
          id: 'security-audit',
          name: 'Security Audit',
          description: 'Comprehensive security validation',
          criteria: ['Authentication implemented', 'Authorization tested', 'Input validation complete', 'SQL injection prevention'],
          tools: ['OWASP ZAP', 'Burp Suite', 'SonarQube'],
          mcpServers: ['sequential'],
          blocking: true
        },
        {
          id: 'performance-testing',
          name: 'Performance Testing',
          description: 'Load testing and performance validation',
          criteria: ['Response time < 200ms', 'Handles expected load', 'Database queries optimized'],
          tools: ['k6', 'JMeter', 'Artillery'],
          mcpServers: ['sequential'],
          blocking: false
        }
      ],
      taskModifiers: {
        complexityMultiplier: 1.1,
        estimationBufferPercent: 10,
        parallelizationFactor: 0.8,
        riskTolerance: 'low'
      },
      phaseTemplates: [
        {
          id: 'api-design',
          name: 'API Design & Architecture',
          description: 'RESTful API design and database architecture',
          taskPatterns: [
            {
              id: 'api-specification',
              title: 'API Specification Design',
              description: 'Create comprehensive API specification with OpenAPI',
              category: 'design',
              complexity: 'moderate',
              estimatedHours: 12,
              requiredSkills: ['API Design', 'OpenAPI', 'REST Principles'],
              tools: ['Swagger Editor', 'Postman'],
              mcpServers: ['context7', 'sequential'],
              acceptanceCriteria: ['OpenAPI spec complete', 'Endpoints documented', 'Example responses provided']
            },
            {
              id: 'database-design',
              title: 'Database Schema Design',
              description: 'Design relational database schema with proper normalization',
              category: 'design',
              complexity: 'complex',
              estimatedHours: 16,
              requiredSkills: ['Database Design', 'SQL', 'Data Modeling'],
              tools: ['DB Designer', 'Migration Tools'],
              mcpServers: ['sequential', 'context7'],
              acceptanceCriteria: ['Schema normalized', 'Indexes optimized', 'Migrations created']
            }
          ],
          dependencies: [],
          outputs: ['API specification', 'Database schema', 'Migration scripts'],
          validationSteps: ['API review', 'Schema validation', 'Performance analysis']
        }
      ],
      riskPatterns: [
        {
          id: 'data-migration',
          category: 'technical',
          description: 'Complex data migration with potential data loss',
          likelihood: 'medium',
          impact: 'high',
          indicators: ['Large datasets', 'Schema changes', 'Data transformations'],
          mitigationStrategies: ['Backup strategies', 'Staged migration', 'Rollback procedures']
        }
      ],
      toolPreferences: [
        { tool: 'Node.js/Express', purpose: 'Primary framework', alternatives: ['Python/FastAPI', 'Java/Spring'], mcpServer: 'context7' },
        { tool: 'PostgreSQL', purpose: 'Primary database', alternatives: ['MySQL', 'MongoDB'] },
        { tool: 'Redis', purpose: 'Caching', alternatives: ['Memcached', 'ElastiCache'] }
      ],
      estimationFactors: {
        baseHourMultiplier: 1.0,
        complexityFactors: { simple: 1.0, moderate: 1.2, complex: 1.6 },
        domainSpecificFactors: { 'authentication': 1.3, 'integration': 1.4, 'migration': 1.5 },
        qualityGateOverhead: 0.15
      }
    });

    // Security Persona Template
    this.templates.set('security', {
      name: 'security',
      description: 'Threat modeler, compliance expert, vulnerability specialist',
      expertise: ['OWASP', 'Cryptography', 'Authentication', 'Authorization', 'Compliance', 'Penetration Testing'],
      focusAreas: ['Threat Modeling', 'Vulnerability Assessment', 'Compliance', 'Data Protection', 'Access Control'],
      preferredMCPServers: ['sequential', 'context7'],
      qualityGates: [
        {
          id: 'threat-modeling',
          name: 'Threat Modeling',
          description: 'Comprehensive threat analysis and risk assessment',
          criteria: ['Threat model documented', 'Attack vectors identified', 'Risk ratings assigned'],
          tools: ['STRIDE', 'PASTA', 'Threat Dragon'],
          mcpServers: ['sequential'],
          blocking: true
        },
        {
          id: 'vulnerability-scan',
          name: 'Vulnerability Scanning',
          description: 'Automated and manual vulnerability assessment',
          criteria: ['No critical vulnerabilities', 'High vulnerabilities addressed', 'Scan reports generated'],
          tools: ['OWASP ZAP', 'Nessus', 'Burp Suite'],
          mcpServers: ['sequential'],
          blocking: true
        },
        {
          id: 'compliance-check',
          name: 'Compliance Validation',
          description: 'Regulatory compliance verification',
          criteria: ['GDPR compliance', 'Data protection measures', 'Audit trails implemented'],
          tools: ['Compliance frameworks', 'Audit tools'],
          mcpServers: ['context7'],
          blocking: true
        }
      ],
      taskModifiers: {
        complexityMultiplier: 1.3,
        estimationBufferPercent: 20,
        parallelizationFactor: 0.6,
        riskTolerance: 'low'
      },
      phaseTemplates: [
        {
          id: 'security-analysis',
          name: 'Security Analysis & Threat Modeling',
          description: 'Comprehensive security assessment and threat identification',
          taskPatterns: [
            {
              id: 'threat-assessment',
              title: 'Threat Assessment',
              description: 'Identify and analyze potential security threats',
              category: 'analysis',
              complexity: 'complex',
              estimatedHours: 20,
              requiredSkills: ['Threat Modeling', 'Risk Assessment', 'Security Architecture'],
              tools: ['Threat modeling tools', 'Risk matrices'],
              mcpServers: ['sequential', 'context7'],
              acceptanceCriteria: ['Threats identified', 'Risk levels assigned', 'Mitigation strategies defined']
            }
          ],
          dependencies: [],
          outputs: ['Threat model', 'Risk assessment', 'Security requirements'],
          validationSteps: ['Peer review', 'Compliance check', 'Stakeholder approval']
        }
      ],
      riskPatterns: [
        {
          id: 'data-breach',
          category: 'technical',
          description: 'Potential data breach due to inadequate security measures',
          likelihood: 'low',
          impact: 'high',
          indicators: ['Sensitive data handling', 'External integrations', 'User authentication'],
          mitigationStrategies: ['Encryption at rest', 'Access controls', 'Security monitoring']
        }
      ],
      toolPreferences: [
        { tool: 'OWASP ZAP', purpose: 'Security testing', alternatives: ['Burp Suite', 'Nessus'], mcpServer: 'sequential' },
        { tool: 'HashiCorp Vault', purpose: 'Secret management', alternatives: ['AWS Secrets Manager', 'Azure Key Vault'] }
      ],
      estimationFactors: {
        baseHourMultiplier: 1.2,
        complexityFactors: { simple: 1.1, moderate: 1.4, complex: 2.0 },
        domainSpecificFactors: { 'compliance': 1.5, 'cryptography': 1.8, 'penetration-testing': 1.6 },
        qualityGateOverhead: 0.3
      }
    });

    // Add more persona templates...
    this.initializeAdditionalTemplates();
  }

  private initializeAdditionalTemplates(): void {
    // Architect Persona Template
    this.templates.set('architect', {
      name: 'architect',
      description: 'Systems architecture specialist, long-term thinking focus, scalability expert',
      expertise: ['System Design', 'Design Patterns', 'Scalability', 'Integration', 'Technology Strategy'],
      focusAreas: ['System Architecture', 'Design Patterns', 'Scalability', 'Integration', 'Technology Selection'],
      preferredMCPServers: ['sequential', 'context7'],
      qualityGates: [
        {
          id: 'architecture-review',
          name: 'Architecture Review',
          description: 'Comprehensive architecture validation',
          criteria: ['Scalability assessed', 'Integration points validated', 'Performance projections made'],
          tools: ['Architecture diagrams', 'Performance models'],
          mcpServers: ['sequential'],
          blocking: true
        }
      ],
      taskModifiers: {
        complexityMultiplier: 1.0,
        estimationBufferPercent: 5,
        parallelizationFactor: 0.9,
        riskTolerance: 'low'
      },
      phaseTemplates: [
        {
          id: 'architecture-design',
          name: 'System Architecture Design',
          description: 'High-level system design and component architecture',
          taskPatterns: [
            {
              id: 'system-design',
              title: 'System Architecture Design',
              description: 'Design overall system architecture and component interactions',
              category: 'design',
              complexity: 'complex',
              estimatedHours: 24,
              requiredSkills: ['System Design', 'Architecture Patterns', 'Scalability'],
              tools: ['Architecture diagrams', 'Design tools'],
              mcpServers: ['sequential', 'context7'],
              acceptanceCriteria: ['Architecture documented', 'Component interactions defined', 'Scalability plan created']
            }
          ],
          dependencies: [],
          outputs: ['Architecture documentation', 'Component diagrams', 'Integration plans'],
          validationSteps: ['Architecture review', 'Scalability assessment', 'Integration validation']
        }
      ],
      riskPatterns: [
        {
          id: 'over-engineering',
          category: 'technical',
          description: 'Risk of over-engineering solution beyond requirements',
          likelihood: 'medium',
          impact: 'medium',
          indicators: ['Complex requirements', 'Multiple stakeholders', 'Long-term vision'],
          mitigationStrategies: ['Incremental architecture', 'MVP approach', 'Regular reviews']
        }
      ],
      toolPreferences: [
        { tool: 'Architecture diagrams', purpose: 'System design', alternatives: ['Lucidchart', 'Draw.io'] }
      ],
      estimationFactors: {
        baseHourMultiplier: 0.9,
        complexityFactors: { simple: 1.0, moderate: 1.1, complex: 1.4 },
        domainSpecificFactors: { 'integration': 1.3, 'scalability': 1.2 },
        qualityGateOverhead: 0.1
      }
    });

    // Add other persona templates (DevOps, QA, Performance, etc.)
    this.initializeRemainingTemplates();
  }

  private initializeRemainingTemplates(): void {
    // QA Persona Template
    this.templates.set('qa', {
      name: 'qa',
      description: 'Quality advocate, testing specialist, edge case detective',
      expertise: ['Test Strategy', 'Automation', 'Quality Assurance', 'Bug Detection', 'Test Design'],
      focusAreas: ['Test Coverage', 'Quality Gates', 'Automation', 'Risk-Based Testing', 'Defect Prevention'],
      preferredMCPServers: ['playwright', 'sequential'],
      qualityGates: [
        {
          id: 'test-coverage',
          name: 'Test Coverage Analysis',
          description: 'Comprehensive test coverage validation',
          criteria: ['Unit test coverage >80%', 'Integration test coverage >70%', 'E2E critical paths covered'],
          tools: ['Jest', 'Cypress', 'Coverage tools'],
          mcpServers: ['playwright'],
          blocking: true
        }
      ],
      taskModifiers: {
        complexityMultiplier: 1.1,
        estimationBufferPercent: 15,
        parallelizationFactor: 0.8,
        riskTolerance: 'low'
      },
      phaseTemplates: [
        {
          id: 'test-strategy',
          name: 'Test Strategy & Planning',
          description: 'Comprehensive testing approach and automation strategy',
          taskPatterns: [
            {
              id: 'test-plan',
              title: 'Test Plan Development',
              description: 'Create comprehensive test strategy and execution plan',
              category: 'design',
              complexity: 'moderate',
              estimatedHours: 12,
              requiredSkills: ['Test Strategy', 'Risk Assessment', 'Test Design'],
              tools: ['Test management tools', 'Risk matrices'],
              mcpServers: ['sequential', 'playwright'],
              acceptanceCriteria: ['Test strategy documented', 'Risk-based prioritization', 'Automation plan created']
            }
          ],
          dependencies: [],
          outputs: ['Test strategy', 'Test cases', 'Automation framework'],
          validationSteps: ['Strategy review', 'Coverage analysis', 'Automation validation']
        }
      ],
      riskPatterns: [
        {
          id: 'insufficient-testing',
          category: 'quality',
          description: 'Inadequate test coverage leading to production defects',
          likelihood: 'medium',
          impact: 'high',
          indicators: ['Time pressure', 'Complex requirements', 'Multiple integrations'],
          mitigationStrategies: ['Risk-based testing', 'Test automation', 'Continuous testing']
        }
      ],
      toolPreferences: [
        { tool: 'Playwright', purpose: 'E2E testing', alternatives: ['Cypress', 'Selenium'], mcpServer: 'playwright' },
        { tool: 'Jest', purpose: 'Unit testing', alternatives: ['Vitest', 'Mocha'] }
      ],
      estimationFactors: {
        baseHourMultiplier: 1.05,
        complexityFactors: { simple: 1.0, moderate: 1.2, complex: 1.5 },
        domainSpecificFactors: { 'automation': 1.3, 'integration-testing': 1.4 },
        qualityGateOverhead: 0.25
      }
    });

    // Performance Persona Template
    this.templates.set('performance', {
      name: 'performance',
      description: 'Optimization specialist, bottleneck elimination expert, metrics-driven analyst',
      expertise: ['Performance Testing', 'Optimization', 'Profiling', 'Scalability', 'Monitoring'],
      focusAreas: ['Performance Optimization', 'Load Testing', 'Monitoring', 'Scalability', 'Resource Efficiency'],
      preferredMCPServers: ['playwright', 'sequential'],
      qualityGates: [
        {
          id: 'performance-benchmarks',
          name: 'Performance Benchmarks',
          description: 'Performance targets validation',
          criteria: ['Response time <200ms', 'Load handling validated', 'Memory usage optimized'],
          tools: ['Load testing tools', 'Profilers'],
          mcpServers: ['playwright', 'sequential'],
          blocking: true
        }
      ],
      taskModifiers: {
        complexityMultiplier: 1.2,
        estimationBufferPercent: 10,
        parallelizationFactor: 0.7,
        riskTolerance: 'medium'
      },
      phaseTemplates: [
        {
          id: 'performance-analysis',
          name: 'Performance Analysis & Optimization',
          description: 'Comprehensive performance assessment and optimization',
          taskPatterns: [
            {
              id: 'performance-baseline',
              title: 'Performance Baseline Establishment',
              description: 'Establish performance benchmarks and monitoring',
              category: 'analysis',
              complexity: 'moderate',
              estimatedHours: 16,
              requiredSkills: ['Performance Testing', 'Monitoring', 'Analytics'],
              tools: ['Load testing tools', 'APM tools'],
              mcpServers: ['playwright', 'sequential'],
              acceptanceCriteria: ['Benchmarks established', 'Monitoring implemented', 'Bottlenecks identified']
            }
          ],
          dependencies: [],
          outputs: ['Performance benchmarks', 'Monitoring setup', 'Optimization plan'],
          validationSteps: ['Load testing', 'Performance validation', 'Monitoring verification']
        }
      ],
      riskPatterns: [
        {
          id: 'performance-degradation',
          category: 'technical',
          description: 'Performance degradation under load',
          likelihood: 'medium',
          impact: 'high',
          indicators: ['Complex algorithms', 'Large datasets', 'Multiple integrations'],
          mitigationStrategies: ['Performance budgets', 'Load testing', 'Caching strategies']
        }
      ],
      toolPreferences: [
        { tool: 'k6', purpose: 'Load testing', alternatives: ['JMeter', 'Artillery'] },
        { tool: 'New Relic', purpose: 'APM', alternatives: ['DataDog', 'AppDynamics'] }
      ],
      estimationFactors: {
        baseHourMultiplier: 1.1,
        complexityFactors: { simple: 1.0, moderate: 1.3, complex: 1.7 },
        domainSpecificFactors: { 'optimization': 1.4, 'scalability': 1.3 },
        qualityGateOverhead: 0.2
      }
    });

    // Add remaining persona templates (DevOps, Analyzer, Refactorer, Mentor, Scribe)...
  }

  private selectMCPServers(
    task: WorkflowTask, 
    template: PersonaTemplate, 
    context: { domain: string; complexity: string }
  ): MCPServer[] {
    const servers = [...template.preferredMCPServers];
    
    // Add context-specific servers
    if (context.domain === 'ui' && !servers.includes('magic')) {
      servers.push('magic');
    }
    
    if (context.complexity === 'complex' && !servers.includes('sequential')) {
      servers.push('sequential');
    }
    
    return servers;
  }

  private selectTools(task: WorkflowTask, template: PersonaTemplate): string[] {
    const tools = [...task.tools];
    
    // Add persona-specific tools
    template.toolPreferences.forEach(pref => {
      if (!tools.includes(pref.tool)) {
        tools.push(pref.tool);
      }
    });
    
    return tools;
  }

  private adjustEstimation(
    baseHours: number, 
    template: PersonaTemplate, 
    context: { domain: string; complexity: string }
  ): number {
    let adjusted = baseHours * template.estimationFactors.baseHourMultiplier;
    
    // Apply complexity factor
    const complexityFactor = template.estimationFactors.complexityFactors[context.complexity as keyof typeof template.estimationFactors.complexityFactors] || 1.0;
    adjusted *= complexityFactor;
    
    // Apply domain-specific factors
    const domainFactor = template.estimationFactors.domainSpecificFactors[context.domain] || 1.0;
    adjusted *= domainFactor;
    
    // Add quality gate overhead
    adjusted *= (1 + template.estimationFactors.qualityGateOverhead);
    
    return Math.round(adjusted);
  }

  private enhanceAcceptanceCriteria(
    existing: string[], 
    template: PersonaTemplate
  ): string[] {
    const enhanced = [...existing];
    
    // Add persona-specific quality criteria
    template.qualityGates.forEach(gate => {
      if (gate.blocking) {
        enhanced.push(`${gate.name}: ${gate.description}`);
      }
    });
    
    return enhanced;
  }
}
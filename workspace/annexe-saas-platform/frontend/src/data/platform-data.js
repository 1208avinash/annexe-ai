export const platformData = {
  "brand": {
    "name": "ANNEXE AI",
    "tagline": "Commercial SaaS platform for autonomous software delivery"
  },
  "summary": {
    "currentProject": "Enterprise CRM",
    "projectId": "enterprise-crm",
    "stage": "Delivery",
    "progress": 100,
    "currentDepartment": "Delivery",
    "estimatedCompletion": "Completed",
    "generatedFiles": 167,
    "reports": 9,
    "logs": [
      "Company orchestration completed",
      "Backend API health: 200",
      "Frontend build: passed"
    ],
    "deployments": [
      {
        "provider": "Local",
        "status": "READY",
        "projectRoot": "D:\\annex-web\\workspace\\enterprise-crm-company"
      }
    ]
  },
  "navigation": [
    {
      "path": "/",
      "label": "Home"
    },
    {
      "path": "/dashboard",
      "label": "Dashboard"
    },
    {
      "path": "/projects",
      "label": "Projects"
    },
    {
      "path": "/new-project",
      "label": "New Project"
    },
    {
      "path": "/proposal",
      "label": "Proposal"
    },
    {
      "path": "/architecture",
      "label": "Architecture"
    },
    {
      "path": "/generation",
      "label": "Generation"
    },
    {
      "path": "/deployment",
      "label": "Deployment"
    },
    {
      "path": "/reports",
      "label": "Reports"
    },
    {
      "path": "/settings",
      "label": "Settings"
    },
    {
      "path": "/authentication",
      "label": "Authentication"
    },
    {
      "path": "/profile",
      "label": "Profile"
    },
    {
      "path": "/admin",
      "label": "Admin"
    },
    {
      "path": "/benchmark",
      "label": "Benchmark Suite"
    }
  ],
  "projects": [
    {
      "id": "enterprise-crm",
      "name": "Enterprise CRM",
      "type": "crm",
      "industry": "CRM",
      "stage": "Delivery",
      "progress": 100,
      "outputDirectory": "D:\\annex-web\\workspace\\enterprise-crm-company"
    }
  ],
  "proposal": {
    "id": "PROP-1786095209174",
    "title": "AI CRM Transformation Platform",
    "decision": "reuse",
    "timeline": 0,
    "budget": 0,
    "comments": [
      "Approve or request changes from the portal.",
      "Budget and timeline approvals are logged for the commercial record."
    ]
  },
  "architecture": {
    "stack": {
      "frontend": "React 19",
      "backend": "FastAPI",
      "database": "PostgreSQL",
      "deployment": "Docker"
    },
    "diagram": "D:\\annex-web\\workspace\\enterprise-crm-company\\reports\\architecture\\architecture.md",
    "readiness": "pass"
  },
  "generation": {
    "status": "completed",
    "filesWritten": 167,
    "logs": [
      "Generated in D:\\annex-web\\workspace\\enterprise-crm-company",
      "Validation: frontend built"
    ]
  },
  "deployment": {
    "providers": [
      "Docker",
      "Render",
      "Railway",
      "Vercel",
      "AWS",
      "Azure",
      "GCP"
    ],
    "status": "READY",
    "packagePath": "/reports/deployment-package.json"
  },
  "reports": [
    {
      "name": "Proposal",
      "path": "/reports/proposal.md"
    },
    {
      "name": "Business Analysis",
      "path": "/reports/business-analysis.json"
    },
    {
      "name": "Architecture",
      "path": "/reports/architecture.md"
    },
    {
      "name": "Sprint Plan",
      "path": "/reports/sprint-plan.json"
    },
    {
      "name": "Engineering Report",
      "path": "/reports/engineering-report.json"
    },
    {
      "name": "Quality Report",
      "path": "/reports/quality-report.json"
    },
    {
      "name": "Deployment Report",
      "path": "/reports/deployment-report.md"
    },
    {
      "name": "Delivery Package",
      "path": "/reports/delivery-package.json"
    }
  ],
  "settings": {
    "themes": [
      "Aurora",
      "Slate",
      "Graphite"
    ],
    "notifications": true,
    "resumableWorkflows": true
  },
  "authentication": {
    "providers": [
      "Email + Password",
      "SSO placeholder"
    ],
    "status": "Enabled"
  },
  "profile": {
    "name": "Platform Owner",
    "role": "Chief Product Officer",
    "email": "admin@annexe.ai"
  },
  "admin": {
    "projectsGenerated": 1,
    "successRate": 100,
    "deployments": 1,
    "users": 1,
    "revenue": "$0",
    "averageGenerationTime": "0 ms",
    "capabilityUsage": [
      "authentication",
      "users",
      "roles",
      "permissions",
      "dashboard",
      "notifications",
      "audit-logs",
      "email",
      "file-storage",
      "settings",
      "search",
      "reports",
      "health",
      "version",
      "logging",
      "crm",
      "erp"
    ]
  },
  "benchmark": {
    "benchmarkId": "BENCH-1786095511266",
    "generatedAt": "2026-08-07T09:38:31.266Z",
    "totalBenchmarks": 10,
    "successfulBenchmarks": 10,
    "validatedBenchmarks": 10,
    "successRate": 100,
    "runs": [
      {
        "applicationType": "crm",
        "success": true,
        "projectId": "enterprise-crm-company",
        "projectName": "Enterprise CRM",
        "outputDirectory": "D:\\annex-web\\workspace\\annexe-saas-platform\\benchmarks\\enterprise-crm-company",
        "filesWritten": 167,
        "validation": {
          "backend": {
            "compileall": true,
            "pytest": true
          },
          "frontend": {
            "install": true,
            "build": true,
            "smoke": true
          },
          "docker": false
        },
        "durationMs": 31770
      },
      {
        "applicationType": "erp",
        "success": true,
        "projectId": "enterprise-erp",
        "projectName": "Enterprise ERP",
        "outputDirectory": "D:\\annex-web\\workspace\\annexe-saas-platform\\benchmarks\\enterprise-erp",
        "filesWritten": 173,
        "validation": {
          "backend": {
            "compileall": true,
            "pytest": true
          },
          "frontend": {
            "install": true,
            "build": true,
            "smoke": true
          },
          "docker": false
        },
        "durationMs": 30461
      },
      {
        "applicationType": "hrms",
        "success": true,
        "projectId": "enterprise-hrms",
        "projectName": "Enterprise HRMS",
        "outputDirectory": "D:\\annex-web\\workspace\\annexe-saas-platform\\benchmarks\\enterprise-hrms",
        "filesWritten": 167,
        "validation": {
          "backend": {
            "compileall": true,
            "pytest": true
          },
          "frontend": {
            "install": true,
            "build": true,
            "smoke": true
          },
          "docker": false
        },
        "durationMs": 25021
      },
      {
        "applicationType": "hospital",
        "success": true,
        "projectId": "hospital-system",
        "projectName": "Hospital System",
        "outputDirectory": "D:\\annex-web\\workspace\\annexe-saas-platform\\benchmarks\\hospital-system",
        "filesWritten": 167,
        "validation": {
          "backend": {
            "compileall": true,
            "pytest": true
          },
          "frontend": {
            "install": true,
            "build": true,
            "smoke": true
          },
          "docker": false
        },
        "durationMs": 24456
      },
      {
        "applicationType": "school",
        "success": true,
        "projectId": "school-management",
        "projectName": "School Management",
        "outputDirectory": "D:\\annex-web\\workspace\\annexe-saas-platform\\benchmarks\\school-management",
        "filesWritten": 167,
        "validation": {
          "backend": {
            "compileall": true,
            "pytest": true
          },
          "frontend": {
            "install": true,
            "build": true,
            "smoke": true
          },
          "docker": false
        },
        "durationMs": 22617
      },
      {
        "applicationType": "marketplace",
        "success": true,
        "projectId": "marketplace-platform",
        "projectName": "Marketplace Platform",
        "outputDirectory": "D:\\annex-web\\workspace\\annexe-saas-platform\\benchmarks\\marketplace-platform",
        "filesWritten": 167,
        "validation": {
          "backend": {
            "compileall": true,
            "pytest": true
          },
          "frontend": {
            "install": true,
            "build": true,
            "smoke": true
          },
          "docker": false
        },
        "durationMs": 22535
      },
      {
        "applicationType": "pos",
        "success": true,
        "projectId": "point-of-sale",
        "projectName": "Point of Sale",
        "outputDirectory": "D:\\annex-web\\workspace\\annexe-saas-platform\\benchmarks\\point-of-sale",
        "filesWritten": 167,
        "validation": {
          "backend": {
            "compileall": true,
            "pytest": true
          },
          "frontend": {
            "install": true,
            "build": true,
            "smoke": true
          },
          "docker": false
        },
        "durationMs": 24115
      },
      {
        "applicationType": "inventory",
        "success": true,
        "projectId": "inventory-management",
        "projectName": "Inventory Management",
        "outputDirectory": "D:\\annex-web\\workspace\\annexe-saas-platform\\benchmarks\\inventory-management",
        "filesWritten": 161,
        "validation": {
          "backend": {
            "compileall": true,
            "pytest": true
          },
          "frontend": {
            "install": true,
            "build": true,
            "smoke": true
          },
          "docker": false
        },
        "durationMs": 25828
      },
      {
        "applicationType": "accounting",
        "success": true,
        "projectId": "accounting-platform",
        "projectName": "Accounting Platform",
        "outputDirectory": "D:\\annex-web\\workspace\\annexe-saas-platform\\benchmarks\\accounting-platform",
        "filesWritten": 167,
        "validation": {
          "backend": {
            "compileall": true,
            "pytest": true
          },
          "frontend": {
            "install": true,
            "build": true,
            "smoke": true
          },
          "docker": false
        },
        "durationMs": 24219
      },
      {
        "applicationType": "manufacturing",
        "success": true,
        "projectId": "manufacturing-platform",
        "projectName": "Manufacturing Platform",
        "outputDirectory": "D:\\annex-web\\workspace\\annexe-saas-platform\\benchmarks\\manufacturing-platform",
        "filesWritten": 161,
        "validation": {
          "backend": {
            "compileall": true,
            "pytest": true
          },
          "frontend": {
            "install": true,
            "build": true,
            "smoke": true
          },
          "docker": false
        },
        "durationMs": 24835
      }
    ]
  }
};

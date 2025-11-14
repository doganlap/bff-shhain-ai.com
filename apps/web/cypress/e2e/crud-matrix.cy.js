// cypress/e2e/crud-matrix.cy.js

describe('GRC Platform CRUD Matrix Tests', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://localhost:5173';
  const apiUrl = 'http://localhost:3005/api';
  
  // Test data for CRUD operations
  const testData = {
    framework: {
      name: 'Test Framework',
      description: 'Test framework for CRUD validation',
      category: 'compliance',
      version: '1.0.0'
    },
    organization: {
      name: 'Test Organization',
      description: 'Test organization for CRUD validation',
      type: 'corporation',
      industry: 'technology',
      size: 'medium'
    },
    vendor: {
      name: 'Test Vendor',
      description: 'Test vendor for CRUD validation',
      category: 'software',
      riskLevel: 'medium',
      contactEmail: 'test@vendor.com'
    },
    risk: {
      title: 'Test Risk',
      description: 'Test risk for CRUD validation',
      impact: 'medium',
      likelihood: 'medium',
      categoryId: 1,
      status: 'open'
    },
    assessment: {
      title: 'Test Assessment',
      description: 'Test assessment for CRUD validation',
      frameworkId: 1,
      organizationId: 1,
      status: 'draft'
    },
    document: {
      name: 'test-document.pdf',
      description: 'Test document for CRUD validation',
      category: 'compliance',
      tags: ['test', 'validation']
    }
  };

  beforeEach(() => {
    // Login before running tests
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type('admin@grc-platform.com');
    cy.get('[data-cy=password-input]').type('admin123');
    cy.get('[data-cy=login-button]').click();
    cy.url().should('not.include', '/login');
  });

  describe('Frameworks CRUD Operations', () => {
    let frameworkId;

    it('should create a new framework', () => {
      cy.visit('/frameworks');
      cy.get('[data-cy=create-framework-button]').click();
      cy.get('[data-cy=framework-name-input]').type(testData.framework.name);
      cy.get('[data-cy=framework-description-textarea]').type(testData.framework.description);
      cy.get('[data-cy=framework-category-select]').select(testData.framework.category);
      cy.get('[data-cy=framework-version-input]').type(testData.framework.version);
      cy.get('[data-cy=save-framework-button]').click();
      
      // Verify creation
      cy.get('[data-cy=framework-list]').should('contain', testData.framework.name);
      cy.get('[data-cy=success-toast]').should('contain', 'Framework created successfully');
      
      // Capture framework ID for update/delete tests
      cy.get('[data-cy=framework-item]').last().invoke('attr', 'data-framework-id').then((id) => {
        frameworkId = id;
        cy.log(`Framework created with ID: ${frameworkId}`);
      });
    });

    it('should read framework details', () => {
      cy.visit('/frameworks');
      cy.get('[data-cy=framework-item]').first().click();
      cy.get('[data-cy=framework-details]').should('be.visible');
      cy.get('[data-cy=framework-name]').should('exist');
      cy.get('[data-cy=framework-description]').should('exist');
    });

    it('should update a framework', () => {
      cy.visit('/frameworks');
      cy.get('[data-cy=framework-item]').first().find('[data-cy=edit-button]').click();
      cy.get('[data-cy=framework-name-input]').clear().type(`${testData.framework.name} Updated`);
      cy.get('[data-cy=save-framework-button]').click();
      
      // Verify update
      cy.get('[data-cy=framework-list]').should('contain', `${testData.framework.name} Updated`);
      cy.get('[data-cy=success-toast]').should('contain', 'Framework updated successfully');
    });

    it('should delete a framework', () => {
      cy.visit('/frameworks');
      cy.get('[data-cy=framework-item]').first().find('[data-cy=delete-button]').click();
      cy.get('[data-cy=confirm-delete-button]').click();
      
      // Verify deletion
      cy.get('[data-cy=success-toast]').should('contain', 'Framework deleted successfully');
    });
  });

  describe('Organizations CRUD Operations', () => {
    let organizationId;

    it('should create a new organization', () => {
      cy.visit('/organizations');
      cy.get('[data-cy=create-organization-button]').click();
      cy.get('[data-cy=organization-name-input]').type(testData.organization.name);
      cy.get('[data-cy=organization-description-textarea]').type(testData.organization.description);
      cy.get('[data-cy=organization-type-select]').select(testData.organization.type);
      cy.get('[data-cy=organization-industry-select]').select(testData.organization.industry);
      cy.get('[data-cy=organization-size-select]').select(testData.organization.size);
      cy.get('[data-cy=save-organization-button]').click();
      
      // Verify creation
      cy.get('[data-cy=organization-list]').should('contain', testData.organization.name);
      cy.get('[data-cy=success-toast]').should('contain', 'Organization created successfully');
      
      // Capture organization ID
      cy.get('[data-cy=organization-item]').last().invoke('attr', 'data-organization-id').then((id) => {
        organizationId = id;
        cy.log(`Organization created with ID: ${organizationId}`);
      });
    });

    it('should read organization details', () => {
      cy.visit('/organizations');
      cy.get('[data-cy=organization-item]').first().click();
      cy.get('[data-cy=organization-details]').should('be.visible');
      cy.get('[data-cy=organization-name]').should('exist');
      cy.get('[data-cy=organization-description]').should('exist');
    });

    it('should update an organization', () => {
      cy.visit('/organizations');
      cy.get('[data-cy=organization-item]').first().find('[data-cy=edit-button]').click();
      cy.get('[data-cy=organization-name-input]').clear().type(`${testData.organization.name} Updated`);
      cy.get('[data-cy=save-organization-button]').click();
      
      // Verify update
      cy.get('[data-cy=organization-list]').should('contain', `${testData.organization.name} Updated`);
      cy.get('[data-cy=success-toast]').should('contain', 'Organization updated successfully');
    });

    it('should delete an organization', () => {
      cy.visit('/organizations');
      cy.get('[data-cy=organization-item]').first().find('[data-cy=delete-button]').click();
      cy.get('[data-cy=confirm-delete-button]').click();
      
      // Verify deletion
      cy.get('[data-cy=success-toast]').should('contain', 'Organization deleted successfully');
    });
  });

  describe('Vendors CRUD Operations', () => {
    let vendorId;

    it('should create a new vendor', () => {
      cy.visit('/vendors');
      cy.get('[data-cy=create-vendor-button]').click();
      cy.get('[data-cy=vendor-name-input]').type(testData.vendor.name);
      cy.get('[data-cy=vendor-description-textarea]').type(testData.vendor.description);
      cy.get('[data-cy=vendor-category-select]').select(testData.vendor.category);
      cy.get('[data-cy=vendor-risk-level-select]').select(testData.vendor.riskLevel);
      cy.get('[data-cy=vendor-email-input]').type(testData.vendor.contactEmail);
      cy.get('[data-cy=save-vendor-button]').click();
      
      // Verify creation
      cy.get('[data-cy=vendor-list]').should('contain', testData.vendor.name);
      cy.get('[data-cy=success-toast]').should('contain', 'Vendor created successfully');
      
      // Capture vendor ID
      cy.get('[data-cy=vendor-item]').last().invoke('attr', 'data-vendor-id').then((id) => {
        vendorId = id;
        cy.log(`Vendor created with ID: ${vendorId}`);
      });
    });

    it('should read vendor details', () => {
      cy.visit('/vendors');
      cy.get('[data-cy=vendor-item]').first().click();
      cy.get('[data-cy=vendor-details]').should('be.visible');
      cy.get('[data-cy=vendor-name]').should('exist');
      cy.get('[data-cy=vendor-description]').should('exist');
    });

    it('should update a vendor', () => {
      cy.visit('/vendors');
      cy.get('[data-cy=vendor-item]').first().find('[data-cy=edit-button]').click();
      cy.get('[data-cy=vendor-name-input]').clear().type(`${testData.vendor.name} Updated`);
      cy.get('[data-cy=save-vendor-button]').click();
      
      // Verify update
      cy.get('[data-cy=vendor-list]').should('contain', `${testData.vendor.name} Updated`);
      cy.get('[data-cy=success-toast]').should('contain', 'Vendor updated successfully');
    });

    it('should delete a vendor', () => {
      cy.visit('/vendors');
      cy.get('[data-cy=vendor-item]').first().find('[data-cy=delete-button]').click();
      cy.get('[data-cy=confirm-delete-button]').click();
      
      // Verify deletion
      cy.get('[data-cy=success-toast]').should('contain', 'Vendor deleted successfully');
    });
  });

  describe('Risks CRUD Operations', () => {
    let riskId;

    it('should create a new risk', () => {
      cy.visit('/risks');
      cy.get('[data-cy=create-risk-button]').click();
      cy.get('[data-cy=risk-title-input]').type(testData.risk.title);
      cy.get('[data-cy=risk-description-textarea]').type(testData.risk.description);
      cy.get('[data-cy=risk-impact-select]').select(testData.risk.impact);
      cy.get('[data-cy=risk-likelihood-select]').select(testData.risk.likelihood);
      cy.get('[data-cy=risk-category-select]').select(testData.risk.categoryId.toString());
      cy.get('[data-cy=risk-status-select]').select(testData.risk.status);
      cy.get('[data-cy=save-risk-button]').click();
      
      // Verify creation
      cy.get('[data-cy=risk-list]').should('contain', testData.risk.title);
      cy.get('[data-cy=success-toast]').should('contain', 'Risk created successfully');
      
      // Capture risk ID
      cy.get('[data-cy=risk-item]').last().invoke('attr', 'data-risk-id').then((id) => {
        riskId = id;
        cy.log(`Risk created with ID: ${riskId}`);
      });
    });

    it('should read risk details', () => {
      cy.visit('/risks');
      cy.get('[data-cy=risk-item]').first().click();
      cy.get('[data-cy=risk-details]').should('be.visible');
      cy.get('[data-cy=risk-title]').should('exist');
      cy.get('[data-cy=risk-description]').should('exist');
    });

    it('should update a risk', () => {
      cy.visit('/risks');
      cy.get('[data-cy=risk-item]').first().find('[data-cy=edit-button]').click();
      cy.get('[data-cy=risk-title-input]').clear().type(`${testData.risk.title} Updated`);
      cy.get('[data-cy=save-risk-button]').click();
      
      // Verify update
      cy.get('[data-cy=risk-list]').should('contain', `${testData.risk.title} Updated`);
      cy.get('[data-cy=success-toast]').should('contain', 'Risk updated successfully');
    });

    it('should delete a risk', () => {
      cy.visit('/risks');
      cy.get('[data-cy=risk-item]').first().find('[data-cy=delete-button]').click();
      cy.get('[data-cy=confirm-delete-button]').click();
      
      // Verify deletion
      cy.get('[data-cy=success-toast]').should('contain', 'Risk deleted successfully');
    });
  });

  describe('Assessments CRUD Operations', () => {
    let assessmentId;

    it('should create a new assessment', () => {
      cy.visit('/assessments');
      cy.get('[data-cy=create-assessment-button]').click();
      cy.get('[data-cy=assessment-title-input]').type(testData.assessment.title);
      cy.get('[data-cy=assessment-description-textarea]').type(testData.assessment.description);
      cy.get('[data-cy=assessment-framework-select]').select(testData.assessment.frameworkId.toString());
      cy.get('[data-cy=assessment-organization-select]').select(testData.assessment.organizationId.toString());
      cy.get('[data-cy=assessment-status-select]').select(testData.assessment.status);
      cy.get('[data-cy=save-assessment-button]').click();
      
      // Verify creation
      cy.get('[data-cy=assessment-list]').should('contain', testData.assessment.title);
      cy.get('[data-cy=success-toast]').should('contain', 'Assessment created successfully');
      
      // Capture assessment ID
      cy.get('[data-cy=assessment-item]').last().invoke('attr', 'data-assessment-id').then((id) => {
        assessmentId = id;
        cy.log(`Assessment created with ID: ${assessmentId}`);
      });
    });

    it('should read assessment details', () => {
      cy.visit('/assessments');
      cy.get('[data-cy=assessment-item]').first().click();
      cy.get('[data-cy=assessment-details]').should('be.visible');
      cy.get('[data-cy=assessment-title]').should('exist');
      cy.get('[data-cy=assessment-description]').should('exist');
    });

    it('should update an assessment', () => {
      cy.visit('/assessments');
      cy.get('[data-cy=assessment-item]').first().find('[data-cy=edit-button]').click();
      cy.get('[data-cy=assessment-title-input]').clear().type(`${testData.assessment.title} Updated`);
      cy.get('[data-cy=save-assessment-button]').click();
      
      // Verify update
      cy.get('[data-cy=assessment-list]').should('contain', `${testData.assessment.title} Updated`);
      cy.get('[data-cy=success-toast]').should('contain', 'Assessment updated successfully');
    });

    it('should delete an assessment', () => {
      cy.visit('/assessments');
      cy.get('[data-cy=assessment-item]').first().find('[data-cy=delete-button]').click();
      cy.get('[data-cy=confirm-delete-button]').click();
      
      // Verify deletion
      cy.get('[data-cy=success-toast]').should('contain', 'Assessment deleted successfully');
    });
  });

  describe('Documents CRUD Operations', () => {
    let documentId;

    it('should upload a document', () => {
      cy.visit('/documents');
      cy.get('[data-cy=upload-document-button]').click();
      
      // Upload test file
      cy.get('[data-cy=file-input]').selectFile({
        contents: Cypress.Buffer.from('Test document content'),
        fileName: testData.document.name,
        mimeType: 'application/pdf',
        lastModified: Date.now(),
      });
      
      cy.get('[data-cy=document-name-input]').type(testData.document.name);
      cy.get('[data-cy=document-description-textarea]').type(testData.document.description);
      cy.get('[data-cy=document-category-select]').select(testData.document.category);
      cy.get('[data-cy=upload-button]').click();
      
      // Verify upload
      cy.get('[data-cy=document-list]').should('contain', testData.document.name);
      cy.get('[data-cy=success-toast]').should('contain', 'Document uploaded successfully');
      
      // Capture document ID
      cy.get('[data-cy=document-item]').last().invoke('attr', 'data-document-id').then((id) => {
        documentId = id;
        cy.log(`Document uploaded with ID: ${documentId}`);
      });
    });

    it('should read document details', () => {
      cy.visit('/documents');
      cy.get('[data-cy=document-item]').first().click();
      cy.get('[data-cy=document-details]').should('be.visible');
      cy.get('[data-cy=document-name]').should('exist');
      cy.get('[data-cy=document-description]').should('exist');
    });

    it('should download a document', () => {
      cy.visit('/documents');
      cy.get('[data-cy=document-item]').first().find('[data-cy=download-button]').click();
      
      // Verify download
      cy.get('[data-cy=success-toast]').should('contain', 'Document downloaded successfully');
    });

    it('should delete a document', () => {
      cy.visit('/documents');
      cy.get('[data-cy=document-item]').first().find('[data-cy=delete-button]').click();
      cy.get('[data-cy=confirm-delete-button]').click();
      
      // Verify deletion
      cy.get('[data-cy=success-toast]').should('contain', 'Document deleted successfully');
    });
  });

  describe('CRUD Matrix Validation', () => {
    it('should generate CRUD matrix report', () => {
      cy.request(`${apiUrl}/admin/crud-matrix`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('frameworks');
        expect(response.body).to.have.property('organizations');
        expect(response.body).to.have.property('vendors');
        expect(response.body).to.have.property('risks');
        expect(response.body).to.have.property('assessments');
        expect(response.body).to.have.property('documents');
        expect(response.body).to.have.property('workflows');
        
        // Validate that all modules have 100% CRUD coverage
        Object.keys(response.body).forEach((module) => {
          const coverage = response.body[module];
          expect(coverage.create).to.be.true;
          expect(coverage.read).to.be.true;
          expect(coverage.update).to.be.true;
          expect(coverage.delete).to.be.true;
        });
      });
    });

    it('should validate API request logs', () => {
      cy.request(`${apiUrl}/admin/api-logs`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.logs).to.be.an('array');
        
        // Check for CRUD operation logs
        const crudLogs = response.body.logs.filter(log => 
          log.method === 'POST' || log.method === 'PUT' || log.method === 'DELETE'
        );
        
        expect(crudLogs.length).to.be.greaterThan(0);
        
        // Validate log structure
        crudLogs.forEach(log => {
          expect(log).to.have.property('timestamp');
          expect(log).to.have.property('method');
          expect(log).to.have.property('endpoint');
          expect(log).to.have.property('status');
          expect(log).to.have.property('userId');
          expect(log).to.have.property('traceId');
        });
      });
    });
  });

  after(() => {
    // Generate final CRUD matrix report
    cy.request(`${apiUrl}/admin/generate-crud-report`).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('CRUD Matrix Report Generated:', response.body);
      
      // Save report to file (in real CI/CD, this would be uploaded to S3/blob storage)
      cy.writeFile('cypress/reports/crud-matrix-report.json', response.body);
    });
  });
});
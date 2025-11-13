#!/usr/bin/env node

/**
 * CREATE TEST DATA
 * This script creates sample organizations, users, and assessments for testing
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const TENANT_ID = '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5';

console.log('📝 CREATING TEST DATA');
console.log('====================\n');

async function createTestData() {
    const headers = { 'x-tenant-id': TENANT_ID };

    try {
        // Create test organization
        console.log('🏢 Creating test organization...');
        const orgResponse = await axios.post(`${API_BASE}/organizations`, {
            name: 'ACME Corporation',
            name_ar: 'شركة أكمي',
            code: 'ACME-001',
            type: 'Private',
            sector: 'Technology',
            industry: 'Software Development',
            size: 'Medium',
            country: 'Saudi Arabia',
            city: 'Riyadh',
            address: '123 Tech Street',
            phone: '+966-11-1234567',
            email: 'info@acme.com',
            website: 'https://acme.com',
            description: 'Leading software development company'
        }, { headers });

        console.log(`✅ Organization created: ${orgResponse.data.data.name} (${orgResponse.data.data.id})`);
        const orgId = orgResponse.data.data.id;

        // Create test user
        console.log('\n👤 Creating test user...');
        const userResponse = await axios.post(`${API_BASE}/users`, {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@acme.com',
            phone: '+966-50-1234567',
            role: 'admin',
            organization_id: orgId,
            department: 'IT Department',
            position: 'GRC Manager',
            language: 'en',
            timezone: 'Asia/Riyadh'
        }, { headers });

        console.log(`✅ User created: ${userResponse.data.data.first_name} ${userResponse.data.data.last_name} (${userResponse.data.data.id})`);

        // Create test assessment
        console.log('\n📋 Creating test assessment...');
        const assessmentResponse = await axios.post(`${API_BASE}/assessments`, {
            title: 'ISO 27001 Compliance Assessment 2024',
            description: 'Annual information security management system assessment',
            organization_id: orgId,
            assessment_type: 'compliance',
            scope: 'Information Security Management',
            objectives: 'Assess compliance with ISO 27001 standards',
            methodology: 'Gap analysis and control verification'
        }, { headers });

        console.log(`✅ Assessment created: ${assessmentResponse.data.data.title} (${assessmentResponse.data.data.id})`);

        // Create another organization
        console.log('\n🏢 Creating second organization...');
        const org2Response = await axios.post(`${API_BASE}/organizations`, {
            name: 'TechCorp Solutions',
            name_ar: 'حلول تك كورب',
            code: 'TECH-002',
            type: 'Private',
            sector: 'Technology',
            industry: 'IT Consulting',
            size: 'Large',
            country: 'Saudi Arabia',
            city: 'Jeddah',
            address: '456 Business Ave',
            phone: '+966-12-7654321',
            email: 'contact@techcorp.com',
            website: 'https://techcorp.com',
            description: 'Enterprise IT consulting services'
        }, { headers });

        console.log(`✅ Organization created: ${org2Response.data.data.name} (${org2Response.data.data.id})`);

        console.log('\n✅ TEST DATA CREATION COMPLETE!');
        console.log('================================');
        console.log(`📊 Organizations: 2 created`);
        console.log(`👥 Users: 1 created`);
        console.log(`📋 Assessments: 1 created`);

        console.log('\n🌐 View the data:');
        console.log(`Frontend: http://localhost:5173`);
        console.log(`API: ${API_BASE}/organizations`);

    } catch (error) {
        console.error(`\n❌ Error: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.details) {
            console.error(`Details: ${JSON.stringify(error.response.data.details, null, 2)}`);
        }
    }
}

createTestData();

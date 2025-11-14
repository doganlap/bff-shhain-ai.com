/**
 * Organization Service
 * Handles organizational hierarchy, business units, and structure management
 */

const prisma = require('../../db/prisma');

/**
 * Create organization/business unit
 */
async function createOrganization(data) {
  return await prisma.organizations.create({
    data: {
      name: data.name,
      shortName: data.shortName,
      type: data.type || 'business_unit',
      parentId: data.parentId,
      description: data.description,
      managerId: data.managerId,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
      metadata: data.metadata || {},
      tenantId: data.tenantId
    }
  });
}

/**
 * Get organizations with optional filtering
 */
async function getOrganizations(filters = {}) {
  const where = {};

  if (filters.tenantId) {
    where.tenantId = filters.tenantId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.parentId !== undefined) {
    where.parentId = filters.parentId;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { shortName: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  return await prisma.organizations.findMany({
    where,
    include: {
      parent: {
        select: { id: true, name: true, shortName: true }
      },
      manager: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: {
          children: true,
          users: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

/**
 * Get organization by ID
 */
async function getOrganizationById(id) {
  return await prisma.organizations.findUnique({
    where: { id },
    include: {
      parent: true,
      children: {
        include: {
          _count: {
            select: { users: true, children: true }
          }
        }
      },
      manager: {
        select: { id: true, name: true, email: true, role: true }
      },
      users: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });
}

/**
 * Update organization
 */
async function updateOrganization(id, updates) {
  return await prisma.organizations.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Delete organization
 */
async function deleteOrganization(id) {
  // Check for children
  const org = await prisma.organizations.findUnique({
    where: { id },
    include: {
      _count: {
        select: { children: true, users: true }
      }
    }
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  if (org._count.children > 0) {
    throw new Error('Cannot delete organization with child units');
  }

  if (org._count.users > 0) {
    throw new Error('Cannot delete organization with assigned users');
  }

  return await prisma.organizations.delete({
    where: { id }
  });
}

/**
 * Get organizational hierarchy
 */
async function getOrganizationHierarchy(tenantId, rootId = null) {
  const buildHierarchy = async (parentId) => {
    const orgs = await prisma.organizations.findMany({
      where: {
        tenantId,
        parentId
      },
      include: {
        manager: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { users: true, children: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return await Promise.all(
      orgs.map(async (org) => ({
        ...org,
        children: await buildHierarchy(org.id)
      }))
    );
  };

  return await buildHierarchy(rootId);
}

/**
 * Get organization tree structure (flattened with level)
 */
async function getOrganizationTree(tenantId) {
  const allOrgs = await prisma.organizations.findMany({
    where: { tenantId },
    include: {
      parent: {
        select: { id: true, name: true }
      },
      _count: {
        select: { users: true, children: true }
      }
    }
  });

  // Build map
  const orgMap = new Map(allOrgs.map(org => [org.id, org]));

  // Calculate levels
  const calculateLevel = (orgId, visited = new Set()) => {
    if (visited.has(orgId)) return 0; // Circular reference
    visited.add(orgId);

    const org = orgMap.get(orgId);
    if (!org || !org.parentId) return 0;

    return 1 + calculateLevel(org.parentId, visited);
  };

  // Add level and path to each org
  return allOrgs.map(org => ({
    ...org,
    level: calculateLevel(org.id),
    path: getOrganizationPath(org, orgMap)
  })).sort((a, b) => {
    // Sort by path for hierarchical display
    return a.path.localeCompare(b.path);
  });
}

/**
 * Get organization path (e.g., "Company / Division / Department")
 */
function getOrganizationPath(org, orgMap, visited = new Set()) {
  if (visited.has(org.id)) return org.name; // Circular reference
  visited.add(org.id);

  if (!org.parentId) {
    return org.name;
  }

  const parent = orgMap.get(org.parentId);
  if (!parent) {
    return org.name;
  }

  return getOrganizationPath(parent, orgMap, visited) + ' / ' + org.name;
}

/**
 * Assign user to organization
 */
async function assignUserToOrganization(userId, organizationId) {
  return await prisma.users.update({
    where: { id: userId },
    data: { organizationId }
  });
}

/**
 * Get organization members
 */
async function getOrganizationMembers(organizationId, includeChildren = false) {
  if (!includeChildren) {
    return await prisma.users.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });
  }

  // Get org and all descendants
  const org = await getOrganizationById(organizationId);
  const descendantIds = await getDescendantIds(organizationId);
  const allOrgIds = [organizationId, ...descendantIds];

  return await prisma.users.findMany({
    where: {
      organizationId: { in: allOrgIds }
    },
    include: {
      organization: {
        select: { id: true, name: true, shortName: true }
      }
    },
    orderBy: [
      { organizationId: 'asc' },
      { name: 'asc' }
    ]
  });
}

/**
 * Get all descendant organization IDs
 */
async function getDescendantIds(organizationId) {
  const children = await prisma.organizations.findMany({
    where: { parentId: organizationId },
    select: { id: true }
  });

  if (children.length === 0) {
    return [];
  }

  const childIds = children.map(c => c.id);
  const grandchildIds = await Promise.all(
    childIds.map(id => getDescendantIds(id))
  );

  return [...childIds, ...grandchildIds.flat()];
}

/**
 * Get organization statistics
 */
async function getOrganizationStats(tenantId) {
  const orgs = await prisma.organizations.findMany({
    where: tenantId ? { tenantId } : {},
    include: {
      _count: {
        select: { users: true, children: true }
      }
    }
  });

  const totalUsers = await prisma.users.count({
    where: tenantId ? { tenantId } : {}
  });

  const usersWithOrg = await prisma.users.count({
    where: {
      ...(tenantId ? { tenantId } : {}),
      organizationId: { not: null }
    }
  });

  return {
    total: orgs.length,
    byType: {
      company: orgs.filter(o => o.type === 'company').length,
      division: orgs.filter(o => o.type === 'division').length,
      department: orgs.filter(o => o.type === 'department').length,
      business_unit: orgs.filter(o => o.type === 'business_unit').length,
      team: orgs.filter(o => o.type === 'team').length
    },
    hierarchy: {
      rootLevel: orgs.filter(o => !o.parentId).length,
      withChildren: orgs.filter(o => o._count.children > 0).length,
      leafNodes: orgs.filter(o => o._count.children === 0).length
    },
    users: {
      total: totalUsers,
      assigned: usersWithOrg,
      unassigned: totalUsers - usersWithOrg,
      assignmentRate: totalUsers > 0
        ? ((usersWithOrg / totalUsers) * 100).toFixed(2)
        : 0
    },
    averageSize: orgs.length > 0
      ? (orgs.reduce((sum, o) => sum + o._count.users, 0) / orgs.length).toFixed(2)
      : 0
  };
}

/**
 * Move organization to new parent
 */
async function moveOrganization(organizationId, newParentId) {
  // Validate no circular reference
  if (newParentId) {
    const ancestors = await getAncestorIds(newParentId);
    if (ancestors.includes(organizationId)) {
      throw new Error('Cannot move organization to its own descendant');
    }
  }

  return await prisma.organizations.update({
    where: { id: organizationId },
    data: {
      parentId: newParentId,
      updatedAt: new Date()
    }
  });
}

/**
 * Get all ancestor organization IDs
 */
async function getAncestorIds(organizationId, visited = new Set()) {
  if (visited.has(organizationId)) {
    return []; // Circular reference detected
  }
  visited.add(organizationId);

  const org = await prisma.organizations.findUnique({
    where: { id: organizationId },
    select: { parentId: true }
  });

  if (!org || !org.parentId) {
    return [];
  }

  const parentAncestors = await getAncestorIds(org.parentId, visited);
  return [org.parentId, ...parentAncestors];
}

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationHierarchy,
  getOrganizationTree,
  assignUserToOrganization,
  getOrganizationMembers,
  getOrganizationStats,
  moveOrganization,
  getAncestorIds,
  getDescendantIds
};

import { Vercel } from '@vercel/sdk';
import { config } from 'dotenv';

config();

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

async function manageTeam() {
  try {
    console.log('👥 Managing team...');

    // Get current team
    const currentTeam = await vercel.teams.getTeam();
    console.log(`🏢 Team: ${currentTeam.name} (${currentTeam.slug})`);
    console.log(`👑 Plan: ${currentTeam.billing?.plan || 'Unknown'}`);

    // List team members
    const members = await vercel.teams.getTeamMembers({
      teamId: currentTeam.id
    });

    console.log('\n👥 Team members:');
    members.members.forEach(member => {
      const roleEmoji = member.role === 'OWNER' ? '👑' : member.role === 'MEMBER' ? '👤' : '👥';
      console.log(`  ${roleEmoji} ${member.username} - ${member.role}`);
    });

    return currentTeam;

  } catch (error) {
    console.error('💥 Team management error:', error.message);
    throw error;
  }
}

async function inviteTeamMember(email, role = 'MEMBER') {
  try {
    console.log(`📧 Inviting ${email} as ${role}...`);

    const invitation = await vercel.teams.requestAccessToTeam({
      teamId: process.env.VERCEL_TEAM_ID,
      requestBody: {
        email: email,
        role: role
      }
    });

    console.log(`✅ Invitation sent to ${email}`);
    return invitation;

  } catch (error) {
    console.error(`❌ Failed to invite ${email}:`, error.message);
    throw error;
  }
}

async function removeTeamMember(userId) {
  try {
    await vercel.teams.removeTeamMember({
      teamId: process.env.VERCEL_TEAM_ID,
      uid: userId
    });

    console.log(`🗑️  Removed user ${userId} from team`);

  } catch (error) {
    console.error(`❌ Failed to remove user ${userId}:`, error.message);
    throw error;
  }
}

async function updateMemberRole(userId, newRole) {
  try {
    await vercel.teams.updateTeamMember({
      teamId: process.env.VERCEL_TEAM_ID,
      uid: userId,
      requestBody: {
        role: newRole
      }
    });

    console.log(`🔄 Updated user ${userId} role to ${newRole}`);

  } catch (error) {
    console.error(`❌ Failed to update role for ${userId}:`, error.message);
    throw error;
  }
}

async function getTeamProjects() {
  try {
    const projects = await vercel.projects.getProjects({
      teamId: process.env.VERCEL_TEAM_ID,
      limit: 50
    });

    console.log('\n📦 Team projects:');
    projects.projects.forEach(project => {
      console.log(`  • ${project.name} - ${project.framework || 'Unknown framework'}`);
    });

    return projects.projects;

  } catch (error) {
    console.error('💥 Failed to get team projects:', error.message);
    throw error;
  }
}

async function manageTeamAccessToProject(projectName, userId, access = 'read') {
  try {
    // This would typically involve updating project permissions
    // The exact API depends on Vercel's current team management endpoints

    console.log(`🔐 Managing ${access} access for user ${userId} to project ${projectName}`);
    console.log('💡 Note: Project-level permissions are typically managed through team roles');

    // For now, we'll log the intended action
    // In practice, you might need to use project-specific endpoints or team role management

  } catch (error) {
    console.error('💥 Access management error:', error.message);
    throw error;
  }
}

export {
  manageTeam,
  inviteTeamMember,
  removeTeamMember,
  updateMemberRole,
  getTeamProjects,
  manageTeamAccessToProject
};

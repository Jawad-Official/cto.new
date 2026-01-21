import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      password,
      emailVerified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password,
      emailVerified: true,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      description: 'Building the future',
      createdBy: user1.id,
      users: {
        create: [
          { userId: user1.id, role: 'ADMIN' },
          { userId: user2.id, role: 'MEMBER' },
        ],
      },
      settings: {
        create: {
          enableAI: true,
          enableNotifications: true,
        },
      },
    },
  });

  const team = await prisma.team.create({
    data: {
      name: 'Engineering',
      description: 'Software development team',
      workspaceId: workspace.id,
      members: {
        create: [
          { userId: user1.id, role: 'ADMIN' },
          { userId: user2.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const labels = await Promise.all([
    prisma.label.create({
      data: {
        name: 'bug',
        color: '#EF4444',
        workspaceId: workspace.id,
      },
    }),
    prisma.label.create({
      data: {
        name: 'feature',
        color: '#3B82F6',
        workspaceId: workspace.id,
      },
    }),
    prisma.label.create({
      data: {
        name: 'backend',
        color: '#10B981',
        workspaceId: workspace.id,
      },
    }),
    prisma.label.create({
      data: {
        name: 'frontend',
        color: '#F59E0B',
        workspaceId: workspace.id,
      },
    }),
  ]);

  const project = await prisma.project.create({
    data: {
      name: 'Product Development',
      key: 'PROD',
      description: 'Main product development project',
      color: '#6366F1',
      workspaceId: workspace.id,
      teamId: team.id,
    },
  });

  const cycle = await prisma.cycle.create({
    data: {
      name: 'Sprint 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      workspaceId: workspace.id,
    },
  });

  const issues = [
    {
      title: 'Implement user authentication',
      description: '## Description\n\nAdd JWT-based authentication\n\n## Acceptance Criteria\n- [ ] Login endpoint\n- [ ] Registration endpoint\n- [ ] JWT token generation',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      estimate: 5,
      projectId: project.id,
      creatorId: user1.id,
      assigneeId: user1.id,
      cycleId: cycle.id,
    },
    {
      title: 'Fix navigation bar styling',
      description: 'The navigation bar is not responsive on mobile devices',
      status: 'TODO',
      priority: 'MEDIUM',
      estimate: 2,
      projectId: project.id,
      creatorId: user2.id,
      assigneeId: user2.id,
    },
    {
      title: 'Add dark mode support',
      description: 'Implement dark mode theme across the application',
      status: 'BACKLOG',
      priority: 'LOW',
      estimate: 8,
      projectId: project.id,
      creatorId: user1.id,
    },
    {
      title: 'Database migration for user profiles',
      description: 'Create migration to add profile fields',
      status: 'DONE',
      priority: 'HIGH',
      estimate: 3,
      projectId: project.id,
      creatorId: user1.id,
      assigneeId: user2.id,
      completedAt: new Date(),
    },
  ];

  for (let i = 0; i < issues.length; i++) {
    const issue = await prisma.issue.create({
      data: {
        ...issues[i],
        number: i + 1,
      },
    });

    await prisma.issueLabel.create({
      data: {
        issueId: issue.id,
        labelId: labels[i % labels.length].id,
      },
    });

    await prisma.issueComment.create({
      data: {
        content: 'This looks good! Let me know if you need any help.',
        issueId: issue.id,
        userId: i % 2 === 0 ? user2.id : user1.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'ISSUE_CREATED',
        entityType: 'issue',
        entityId: issue.id,
        userId: issues[i].creatorId,
        issueId: issue.id,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Test users created:');
  console.log('   Email: john@example.com | Password: password123');
  console.log('   Email: jane@example.com | Password: password123');
  console.log('\n🏢 Workspace: acme-corp');
  console.log(`   ${issues.length} issues created in project "${project.name}"`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

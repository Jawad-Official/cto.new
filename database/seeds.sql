-- Seed Data for Appo

-- Sample Users (password: 'password123' for all - will be hashed by backend)
INSERT INTO users (email, name, role, avatar_url) VALUES
  ('admin@appo.dev', 'Admin User', 'ADMIN', 'https://i.pravatar.cc/150?img=1'),
  ('john@example.com', 'John Doe', 'MEMBER', 'https://i.pravatar.cc/150?img=2'),
  ('jane@example.com', 'Jane Smith', 'MEMBER', 'https://i.pravatar.cc/150?img=3')
ON CONFLICT (email) DO NOTHING;

-- Note: In production, passwords should be hashed. For dev, use:
-- $2b$10$YourHashedPasswordHere
-- The backend will handle password hashing during registration

-- Sample Projects
INSERT INTO projects (name, description, owner_id) VALUES
  ('Website Redesign', 'Complete overhaul of company website with modern design', 1),
  ('Mobile App Development', 'Build iOS and Android apps for our platform', 2)
ON CONFLICT DO NOTHING;

-- Project Members
INSERT INTO project_members (project_id, user_id, role) VALUES
  (1, 1, 'OWNER'),
  (1, 2, 'MEMBER'),
  (1, 3, 'MEMBER'),
  (2, 2, 'OWNER'),
  (2, 1, 'MEMBER')
ON CONFLICT DO NOTHING;

-- Sample Tasks
INSERT INTO tasks (project_id, title, description, status, priority, created_by, due_date) VALUES
  (1, 'Design homepage mockup', 'Create high-fidelity mockup for the new homepage', 'IN_PROGRESS', 'HIGH', 1, CURRENT_TIMESTAMP + INTERVAL '3 days'),
  (1, 'Set up development environment', 'Configure local dev environment with necessary tools', 'DONE', 'HIGH', 1, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (1, 'Research competitor websites', 'Analyze top 5 competitor websites for inspiration', 'TODO', 'MEDIUM', 1, CURRENT_TIMESTAMP + INTERVAL '5 days'),
  (1, 'Implement responsive navigation', 'Build mobile-friendly navigation menu', 'TODO', 'MEDIUM', 2, CURRENT_TIMESTAMP + INTERVAL '7 days'),
  (1, 'Write content for About page', 'Draft copy for the About Us page', 'IN_PROGRESS', 'LOW', 3, CURRENT_TIMESTAMP + INTERVAL '10 days'),
  (1, 'Set up CI/CD pipeline', 'Configure automated testing and deployment', 'TODO', 'HIGH', 1, CURRENT_TIMESTAMP + INTERVAL '4 days'),
  (1, 'Optimize images', 'Compress and optimize all website images', 'TODO', 'LOW', 2, CURRENT_TIMESTAMP + INTERVAL '14 days'),
  (2, 'Define app architecture', 'Document the technical architecture and tech stack', 'DONE', 'HIGH', 2, CURRENT_TIMESTAMP - INTERVAL '5 days'),
  (2, 'Design app wireframes', 'Create wireframes for all main app screens', 'IN_PROGRESS', 'HIGH', 2, CURRENT_TIMESTAMP + INTERVAL '2 days'),
  (2, 'Set up React Native project', 'Initialize React Native project with TypeScript', 'TODO', 'HIGH', 2, CURRENT_TIMESTAMP + INTERVAL '3 days'),
  (2, 'Implement authentication flow', 'Build login, signup, and password reset screens', 'TODO', 'HIGH', 1, CURRENT_TIMESTAMP + INTERVAL '6 days'),
  (2, 'Design app icon and splash screen', 'Create branding assets for the app', 'TODO', 'MEDIUM', 2, CURRENT_TIMESTAMP + INTERVAL '8 days'),
  (2, 'Write API documentation', 'Document all API endpoints and data models', 'IN_PROGRESS', 'MEDIUM', 1, CURRENT_TIMESTAMP + INTERVAL '5 days'),
  (2, 'Set up push notifications', 'Configure Firebase for push notifications', 'TODO', 'LOW', 2, CURRENT_TIMESTAMP + INTERVAL '12 days'),
  (2, 'Implement offline mode', 'Add offline support with local data caching', 'TODO', 'LOW', 1, CURRENT_TIMESTAMP + INTERVAL '15 days')
ON CONFLICT DO NOTHING;

-- Task Assignees
INSERT INTO task_assignees (task_id, user_id) VALUES
  (1, 3),
  (2, 1),
  (3, 2),
  (4, 2),
  (5, 3),
  (6, 1),
  (7, 2),
  (8, 2),
  (9, 2),
  (10, 1),
  (11, 1),
  (12, 3),
  (13, 1),
  (14, 2),
  (15, 1)
ON CONFLICT DO NOTHING;

-- Sample Comments
INSERT INTO comments (task_id, user_id, content) VALUES
  (1, 2, 'Looking great! Can we add more whitespace to the header?'),
  (1, 3, 'I agree, also consider making the CTA button more prominent'),
  (2, 2, 'Environment is working perfectly. Ready to start coding!'),
  (5, 1, 'Make sure to include our company values in the content'),
  (9, 1, 'The wireframes look solid. Let''s review them in tomorrow''s standup')
ON CONFLICT DO NOTHING;

-- Sample Notifications
INSERT INTO notifications (user_id, type, message, related_task_id, is_read) VALUES
  (1, 'TASK_ASSIGNED', 'You were assigned to task: Implement authentication flow', 11, false),
  (2, 'COMMENT_ADDED', 'New comment on task: Design homepage mockup', 1, false),
  (3, 'TASK_UPDATED', 'Task status changed: Design homepage mockup', 1, true),
  (1, 'PROJECT_INVITE', 'You were added to project: Mobile App Development', NULL, true),
  (2, 'TASK_DUE_SOON', 'Task due in 2 days: Design app wireframes', 9, false)
ON CONFLICT DO NOTHING;

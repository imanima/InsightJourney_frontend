// Create a sample user
CREATE (u:User {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    is_admin: false,
    created_at: datetime()
});

// Create topics
CREATE (t1:Topic {name: 'Work', category: 'Professional'}),
       (t2:Topic {name: 'Family', category: 'Personal'}),
       (t3:Topic {name: 'Health', category: 'Personal'}),
       (t4:Topic {name: 'Career Growth', category: 'Professional'}),
       (t5:Topic {name: 'Relationships', category: 'Personal'}),
       (t6:Topic {name: 'Personal Development', category: 'Personal'}),
       (t7:Topic {name: 'Financial Planning', category: 'Professional'}),
       (t8:Topic {name: 'Work-Life Balance', category: 'Professional'}),
       (t9:Topic {name: 'Mental Health', category: 'Personal'}),
       (t10:Topic {name: 'Team Collaboration', category: 'Professional'});

// Create emotions
CREATE (e1:Emotion {name: 'Happy', intensity: 0.8}),
       (e2:Emotion {name: 'Anxious', intensity: 0.6}),
       (e3:Emotion {name: 'Frustrated', intensity: 0.7}),
       (e4:Emotion {name: 'Motivated', intensity: 0.9}),
       (e5:Emotion {name: 'Overwhelmed', intensity: 0.5}),
       (e6:Emotion {name: 'Confident', intensity: 0.8}),
       (e7:Emotion {name: 'Stressed', intensity: 0.7}),
       (e8:Emotion {name: 'Grateful', intensity: 0.9}),
       (e9:Emotion {name: 'Uncertain', intensity: 0.6}),
       (e10:Emotion {name: 'Excited', intensity: 0.8});

// Create 10 sessions with varying content
CREATE (s1:Session {
    id: 'session-1',
    title: 'Career Planning Discussion',
    created_at: datetime() - duration('P1D'),
    status: 'completed',
    transcript: 'Discussed career goals and next steps for professional development.'
}),
(s2:Session {
    id: 'session-2',
    title: 'Work-Life Balance Reflection',
    created_at: datetime() - duration('P2D'),
    status: 'completed',
    transcript: 'Reflected on current work-life balance and areas for improvement.'
}),
(s3:Session {
    id: 'session-3',
    title: 'Team Collaboration Challenges',
    created_at: datetime() - duration('P3D'),
    status: 'completed',
    transcript: 'Explored challenges in team collaboration and communication.'
}),
(s4:Session {
    id: 'session-4',
    title: 'Family Dynamics Discussion',
    created_at: datetime() - duration('P4D'),
    status: 'completed',
    transcript: 'Discussed family relationships and communication patterns.'
}),
(s5:Session {
    id: 'session-5',
    title: 'Health and Wellness Goals',
    created_at: datetime() - duration('P5D'),
    status: 'completed',
    transcript: 'Set health and wellness goals for the upcoming months.'
}),
(s6:Session {
    id: 'session-6',
    title: 'Financial Planning Session',
    created_at: datetime() - duration('P6D'),
    status: 'completed',
    transcript: 'Reviewed financial goals and investment strategies.'
}),
(s7:Session {
    id: 'session-7',
    title: 'Personal Development Review',
    created_at: datetime() - duration('P7D'),
    status: 'completed',
    transcript: 'Assessed personal growth and development areas.'
}),
(s8:Session {
    id: 'session-8',
    title: 'Mental Health Check-in',
    created_at: datetime() - duration('P8D'),
    status: 'completed',
    transcript: 'Discussed mental health and stress management techniques.'
}),
(s9:Session {
    id: 'session-9',
    title: 'Relationship Goals',
    created_at: datetime() - duration('P9D'),
    status: 'completed',
    transcript: 'Explored relationship goals and communication strategies.'
}),
(s10:Session {
    id: 'session-10',
    title: 'Work Project Planning',
    created_at: datetime() - duration('P10D'),
    status: 'completed',
    transcript: 'Planned upcoming work projects and team responsibilities.'
});

// Connect user to sessions
MATCH (u:User {id: 'user-1'})
MATCH (s:Session)
CREATE (u)-[:HAS_SESSION]->(s);

// Create insights for each session
CREATE (i1:Insight {
    id: 'insight-1',
    content: 'Need to focus on developing leadership skills for career advancement',
    category: 'Professional Development',
    created_at: datetime() - duration('P1D')
}),
(i2:Insight {
    id: 'insight-2',
    content: 'Setting clear boundaries between work and personal time is crucial',
    category: 'Work-Life Balance',
    created_at: datetime() - duration('P2D')
}),
(i3:Insight {
    id: 'insight-3',
    content: 'Regular team check-ins improve collaboration and reduce misunderstandings',
    category: 'Team Management',
    created_at: datetime() - duration('P3D')
}),
(i4:Insight {
    id: 'insight-4',
    content: 'Active listening improves family communication significantly',
    category: 'Family',
    created_at: datetime() - duration('P4D')
}),
(i5:Insight {
    id: 'insight-5',
    content: 'Small daily habits contribute more to health than occasional intense workouts',
    category: 'Health',
    created_at: datetime() - duration('P5D')
}),
(i6:Insight {
    id: 'insight-6',
    content: 'Automating savings leads to better financial discipline',
    category: 'Finance',
    created_at: datetime() - duration('P6D')
}),
(i7:Insight {
    id: 'insight-7',
    content: 'Journaling helps track personal growth and identify patterns',
    category: 'Personal Development',
    created_at: datetime() - duration('P7D')
}),
(i8:Insight {
    id: 'insight-8',
    content: 'Regular meditation reduces stress and improves focus',
    category: 'Mental Health',
    created_at: datetime() - duration('P8D')
}),
(i9:Insight {
    id: 'insight-9',
    content: 'Quality time is more important than quantity in relationships',
    category: 'Relationships',
    created_at: datetime() - duration('P9D')
}),
(i10:Insight {
    id: 'insight-10',
    content: 'Breaking projects into smaller tasks improves productivity',
    category: 'Project Management',
    created_at: datetime() - duration('P10D')
});

// Connect insights to sessions
MATCH (s1:Session {id: 'session-1'}), (i1:Insight {id: 'insight-1'})
MATCH (s2:Session {id: 'session-2'}), (i2:Insight {id: 'insight-2'})
MATCH (s3:Session {id: 'session-3'}), (i3:Insight {id: 'insight-3'})
MATCH (s4:Session {id: 'session-4'}), (i4:Insight {id: 'insight-4'})
MATCH (s5:Session {id: 'session-5'}), (i5:Insight {id: 'insight-5'})
MATCH (s6:Session {id: 'session-6'}), (i6:Insight {id: 'insight-6'})
MATCH (s7:Session {id: 'session-7'}), (i7:Insight {id: 'insight-7'})
MATCH (s8:Session {id: 'session-8'}), (i8:Insight {id: 'insight-8'})
MATCH (s9:Session {id: 'session-9'}), (i9:Insight {id: 'insight-9'})
MATCH (s10:Session {id: 'session-10'}), (i10:Insight {id: 'insight-10'})
CREATE (s1)-[:HAS_INSIGHT]->(i1),
       (s2)-[:HAS_INSIGHT]->(i2),
       (s3)-[:HAS_INSIGHT]->(i3),
       (s4)-[:HAS_INSIGHT]->(i4),
       (s5)-[:HAS_INSIGHT]->(i5),
       (s6)-[:HAS_INSIGHT]->(i6),
       (s7)-[:HAS_INSIGHT]->(i7),
       (s8)-[:HAS_INSIGHT]->(i8),
       (s9)-[:HAS_INSIGHT]->(i9),
       (s10)-[:HAS_INSIGHT]->(i10);

// Create action items for each session
CREATE (a1:ActionItem {
    id: 'action-1',
    title: 'Enroll in Leadership Training',
    description: 'Research and enroll in a leadership development program',
    status: 'in_progress',
    due_date: datetime() + duration('P30D'),
    priority: 'high'
}),
(a2:ActionItem {
    id: 'action-2',
    title: 'Implement Work Schedule',
    description: 'Create and stick to a strict work schedule',
    status: 'not_started',
    due_date: datetime() + duration('P7D'),
    priority: 'medium'
}),
(a3:ActionItem {
    id: 'action-3',
    title: 'Schedule Team Check-ins',
    description: 'Set up weekly team check-in meetings',
    status: 'completed',
    due_date: datetime() - duration('P1D'),
    priority: 'high'
}),
(a4:ActionItem {
    id: 'action-4',
    title: 'Family Meeting',
    description: 'Organize weekly family meetings',
    status: 'in_progress',
    due_date: datetime() + duration('P14D'),
    priority: 'medium'
}),
(a5:ActionItem {
    id: 'action-5',
    title: 'Start Daily Exercise',
    description: 'Begin 30-minute daily exercise routine',
    status: 'not_started',
    due_date: datetime() + duration('P3D'),
    priority: 'high'
}),
(a6:ActionItem {
    id: 'action-6',
    title: 'Set Up Automatic Savings',
    description: 'Configure automatic monthly savings transfer',
    status: 'completed',
    due_date: datetime() - duration('P2D'),
    priority: 'high'
}),
(a7:ActionItem {
    id: 'action-7',
    title: 'Start Journaling',
    description: 'Begin daily journaling practice',
    status: 'in_progress',
    due_date: datetime() + duration('P1D'),
    priority: 'medium'
}),
(a8:ActionItem {
    id: 'action-8',
    title: 'Meditation Practice',
    description: 'Start 10-minute daily meditation',
    status: 'not_started',
    due_date: datetime() + duration('P5D'),
    priority: 'high'
}),
(a9:ActionItem {
    id: 'action-9',
    title: 'Plan Date Night',
    description: 'Schedule weekly date night with partner',
    status: 'in_progress',
    due_date: datetime() + duration('P7D'),
    priority: 'medium'
}),
(a10:ActionItem {
    id: 'action-10',
    title: 'Project Task Breakdown',
    description: 'Break down current project into smaller tasks',
    status: 'completed',
    due_date: datetime() - duration('P1D'),
    priority: 'high'
});

// Connect action items to sessions
MATCH (s1:Session {id: 'session-1'}), (a1:ActionItem {id: 'action-1'})
MATCH (s2:Session {id: 'session-2'}), (a2:ActionItem {id: 'action-2'})
MATCH (s3:Session {id: 'session-3'}), (a3:ActionItem {id: 'action-3'})
MATCH (s4:Session {id: 'session-4'}), (a4:ActionItem {id: 'action-4'})
MATCH (s5:Session {id: 'session-5'}), (a5:ActionItem {id: 'action-5'})
MATCH (s6:Session {id: 'session-6'}), (a6:ActionItem {id: 'action-6'})
MATCH (s7:Session {id: 'session-7'}), (a7:ActionItem {id: 'action-7'})
MATCH (s8:Session {id: 'session-8'}), (a8:ActionItem {id: 'action-8'})
MATCH (s9:Session {id: 'session-9'}), (a9:ActionItem {id: 'action-9'})
MATCH (s10:Session {id: 'session-10'}), (a10:ActionItem {id: 'action-10'})
CREATE (s1)-[:HAS_ACTION_ITEM]->(a1),
       (s2)-[:HAS_ACTION_ITEM]->(a2),
       (s3)-[:HAS_ACTION_ITEM]->(a3),
       (s4)-[:HAS_ACTION_ITEM]->(a4),
       (s5)-[:HAS_ACTION_ITEM]->(a5),
       (s6)-[:HAS_ACTION_ITEM]->(a6),
       (s7)-[:HAS_ACTION_ITEM]->(a7),
       (s8)-[:HAS_ACTION_ITEM]->(a8),
       (s9)-[:HAS_ACTION_ITEM]->(a9),
       (s10)-[:HAS_ACTION_ITEM]->(a10);

// Connect topics to sessions, insights, and action items
MATCH (t1:Topic {name: 'Work'}), (t2:Topic {name: 'Family'}), (t3:Topic {name: 'Health'})
MATCH (s1:Session {id: 'session-1'}), (s2:Session {id: 'session-2'}), (s3:Session {id: 'session-3'})
MATCH (i1:Insight {id: 'insight-1'}), (i2:Insight {id: 'insight-2'}), (i3:Insight {id: 'insight-3'})
MATCH (a1:ActionItem {id: 'action-1'}), (a2:ActionItem {id: 'action-2'}), (a3:ActionItem {id: 'action-3'})
CREATE (s1)-[:RELATED_TO]->(t1),
       (s2)-[:RELATED_TO]->(t2),
       (s3)-[:RELATED_TO]->(t3),
       (i1)-[:RELATED_TO]->(t1),
       (i2)-[:RELATED_TO]->(t2),
       (i3)-[:RELATED_TO]->(t3),
       (a1)-[:RELATED_TO]->(t1),
       (a2)-[:RELATED_TO]->(t2),
       (a3)-[:RELATED_TO]->(t3);

// Connect emotions to sessions
MATCH (e1:Emotion {name: 'Happy'}), (e2:Emotion {name: 'Anxious'}), (e3:Emotion {name: 'Frustrated'})
MATCH (s1:Session {id: 'session-1'}), (s2:Session {id: 'session-2'}), (s3:Session {id: 'session-3'})
CREATE (s1)-[:HAS_EMOTION]->(e1),
       (s2)-[:HAS_EMOTION]->(e2),
       (s3)-[:HAS_EMOTION]->(e3); 
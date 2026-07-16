/**
 * Shared helpers for the API endpoints.
 * When D1 is available, use it. Otherwise, embed fallback data directly
 * in the worker (we can't reliably fetch from ourselves in the Pages runtime
 * due to runtime restrictions on self-fetching).
 */

// Inline fallback data (kept in sync with /public/data/*.json)
const FALLBACK = {
  notices: {
    notices: [
      { id: 'ntc_001', title: 'Admissions Open for Academic Year 2026-27', slug: 'admissions-open-2026-27', excerpt: 'Online applications are now being accepted for LKG through Class 11. Limited seats available in select classes.', category: 'ADMISSION', publish_date: '2026-07-15T10:00:00', updated_at: '2026-07-15T10:00:00', is_published: 1 },
      { id: 'ntc_002', title: 'Mid-Term Examination Timetable Released', slug: 'midterm-timetable-2026', excerpt: 'Class-wise mid-term schedule for July–August 2026. Exams commence from 21 July 2026.', category: 'EXAM', publish_date: '2026-07-10T14:00:00', updated_at: '2026-07-10T14:00:00', is_published: 1 },
      { id: 'ntc_003', title: 'Parent-Teacher Meeting on 20 July 2026', slug: 'ptm-20-july-2026', excerpt: 'All parents are requested to attend the PTM between 9:00 AM and 1:00 PM. Kindly collect your ward\'s progress card.', category: 'PTM', publish_date: '2026-07-05T09:00:00', updated_at: '2026-07-05T09:00:00', is_published: 1 },
      { id: 'ntc_004', title: 'New Transport Route Added — Srimadhopur Road', slug: 'new-transport-route-srimadhopur', excerpt: 'Effective 1 July 2026, the school transport fleet will add a new route covering Srimadhopur Road.', category: 'GENERAL', publish_date: '2026-06-20T11:00:00', updated_at: '2026-06-20T11:00:00', is_published: 1 },
      { id: 'ntc_005', title: 'Summer Camp Registrations Open', slug: 'summer-camp-2026', excerpt: 'Registrations for the annual summer camp are now open. Limited seats.', category: 'GENERAL', publish_date: '2026-06-05T10:00:00', updated_at: '2026-06-05T10:00:00', is_published: 1 },
      { id: 'ntc_006', title: 'Class 10 Board Exam Form — Last Date 25 June', slug: 'class-10-board-exam-form', excerpt: 'Class 10 students: the last date to submit RBSE board exam forms is 25 June 2026.', category: 'EXAM', publish_date: '2026-06-14T11:00:00', updated_at: '2026-06-14T11:00:00', is_published: 1 },
      { id: 'ntc_007', title: 'Summer Vacation 2026: 1 June – 30 June', slug: 'summer-vacation-2026', excerpt: 'The school will remain closed for summer vacation from 1 June to 30 June 2026.', category: 'HOLIDAY', publish_date: '2026-05-28T10:00:00', updated_at: '2026-05-28T10:00:00', is_published: 1 },
      { id: 'ntc_008', title: 'Independence Day Celebration', slug: 'independence-day-2025', excerpt: 'Join us for the 78th Independence Day celebration at the school.', category: 'GENERAL', publish_date: '2025-08-10T09:00:00', updated_at: '2025-08-10T09:00:00', is_published: 1 }
    ]
  },
  gallery: {
    albums: [
      { id: 'alb_001', title: 'Annual Day Celebration 2025', slug: 'annual-day-2025', description: 'A night of music, dance, and quiet pride. Students from LKG to Class 12 performed before a packed auditorium of parents, teachers, and community members.', event_date: '2025-11-28', cover_url: 'linear-gradient(135deg,#F4A300,#D88B00)', photo_count: 3, photos: [
        { id: 'pho_001', url: 'linear-gradient(135deg,#F4A300,#D88B00)', thumbnail_url: 'linear-gradient(135deg,#F4A300,#D88B00)', caption: 'Welcome dance by Class 6 students', is_draft: 0, sort_order: 0 },
        { id: 'pho_002', url: 'linear-gradient(135deg,#13315C,#F4A300)', thumbnail_url: 'linear-gradient(135deg,#13315C,#F4A300)', caption: 'Group song — Vandana', is_draft: 0, sort_order: 1 },
        { id: 'pho_003', url: 'linear-gradient(135deg,#0B2545,#3A6FB0)', thumbnail_url: 'linear-gradient(135deg,#0B2545,#3A6FB0)', caption: 'Principal\'s address', is_draft: 0, sort_order: 2 }
      ]},
      { id: 'alb_002', title: 'Annual Sports Meet 2025', slug: 'sports-meet-2025', description: 'Inter-house athletics and team sports. House colours were on full display as students competed in track events, kho-kho, kabaddi, and relay races.', event_date: '2025-12-14', cover_url: 'linear-gradient(135deg,#13315C,#3A6FB0)', photo_count: 2, photos: [
        { id: 'pho_004', url: 'linear-gradient(135deg,#13315C,#3A6FB0)', thumbnail_url: 'linear-gradient(135deg,#13315C,#3A6FB0)', caption: '100m sprint finals', is_draft: 0, sort_order: 0 },
        { id: 'pho_005', url: 'linear-gradient(135deg,#2E7D32,#E5C46B)', thumbnail_url: 'linear-gradient(135deg,#2E7D32,#E5C46B)', caption: 'Inter-house relay', is_draft: 0, sort_order: 1 }
      ]},
      { id: 'alb_003', title: 'Inter-House Science Exhibition', slug: 'science-exhibition-2026', description: 'Working models and scientific investigations by students from Classes 6 to 12.', event_date: '2026-02-08', cover_url: 'linear-gradient(135deg,#2E7D32,#66BB6A)', photo_count: 2, photos: [
        { id: 'pho_006', url: 'linear-gradient(135deg,#2E7D32,#66BB6A)', thumbnail_url: 'linear-gradient(135deg,#2E7D32,#66BB6A)', caption: 'Volcano model — Class 8', is_draft: 0, sort_order: 0 },
        { id: 'pho_007', url: 'linear-gradient(135deg,#0B2545,#66BB6A)', thumbnail_url: 'linear-gradient(135deg,#0B2545,#66BB6A)', caption: 'Solar system model — Class 6', is_draft: 0, sort_order: 1 }
      ]},
      { id: 'alb_004', title: 'Republic Day 2026', slug: 'republic-day-2026', description: 'Flag hoisting and cultural performances marking India\'s 77th Republic Day.', event_date: '2026-01-26', cover_url: 'linear-gradient(135deg,#C62828,#ef5350)', photo_count: 0, photos: [] },
      { id: 'alb_005', title: 'Independence Day 2025', slug: 'independence-day-2025', description: 'Celebrations marking India\'s 78th Independence Day.', event_date: '2025-08-15', cover_url: 'linear-gradient(135deg,#00838f,#4fb3bf)', photo_count: 0, photos: [] },
      { id: 'alb_006', title: 'Senior Secondary Educational Tour', slug: 'senior-tour-2025', description: 'Class 11 and 12 students visited the Birla Planetarium and Science Centre, New Delhi.', event_date: '2025-10-12', cover_url: 'linear-gradient(135deg,#6a1b9a,#ab47bc)', photo_count: 0, photos: [] },
      { id: 'alb_007', title: 'Inter-House Cultural Competition', slug: 'cultural-2025', description: 'Debate, quiz, and creative arts competition between the four houses.', event_date: '2025-09-22', cover_url: 'linear-gradient(135deg,#d84315,#ff8a65)', photo_count: 0, photos: [] },
      { id: 'alb_008', title: 'Classroom Activities — Primary', slug: 'primary-activities-2025', description: 'Hands-on learning across subjects in the primary wing.', event_date: '2025-11-05', cover_url: 'linear-gradient(135deg,#5d4037,#a1887f)', photo_count: 0, photos: [] },
      { id: 'alb_009', title: 'Student Council Investiture 2025', slug: 'investiture-2025', description: 'The new student council was sworn in at a formal investiture ceremony.', event_date: '2025-04-18', cover_url: 'linear-gradient(135deg,#0B2545,#3A6FB0)', photo_count: 0, photos: [] }
    ]
  },
  faculty: {
    faculty: [
      { id: 'fac_001', name: 'Dr. Meera Singh',   qualification: 'M.A. (English), M.Ed., Ph.D.', subject: 'English · Principal', department: 'SENIOR_SECONDARY', display_order: 1, is_active: 1 },
      { id: 'fac_002', name: 'Mrs. Sunita Yadav', qualification: 'M.Sc. (Physics), B.Ed.',       subject: 'Physics · Vice-Principal', department: 'SENIOR_SECONDARY', display_order: 2, is_active: 1 },
      { id: 'fac_003', name: 'Mr. Rajesh Gupta',  qualification: 'M.Sc., M.Ed.',                 subject: 'Mathematics', department: 'SECONDARY', display_order: 3, is_active: 1 },
      { id: 'fac_004', name: 'Mrs. Priya Verma',  qualification: 'M.A. (Hindi), B.Ed.',          subject: 'Hindi', department: 'SECONDARY', display_order: 4, is_active: 1 },
      { id: 'fac_005', name: 'Mr. Anil Sharma',   qualification: 'M.Sc. (Chemistry), B.Ed.',     subject: 'Chemistry', department: 'SENIOR_SECONDARY', display_order: 5, is_active: 1 },
      { id: 'fac_006', name: 'Mrs. Sneha Kumari', qualification: 'M.Sc. (Biology), B.Ed.',       subject: 'Biology', department: 'SENIOR_SECONDARY', display_order: 6, is_active: 1 },
      { id: 'fac_007', name: 'Mr. Deepak Meena',  qualification: 'M.A. (History), B.Ed.',        subject: 'Social Science', department: 'SECONDARY', display_order: 7, is_active: 1 },
      { id: 'fac_008', name: 'Mrs. Neha Khandelwal', qualification: 'M.A. (Sanskrit), B.Ed.',     subject: 'Sanskrit', department: 'SECONDARY', display_order: 8, is_active: 1 },
      { id: 'fac_009', name: 'Mr. Ravi Joshi',    qualification: 'MCA, B.Ed.',                   subject: 'Computer Science', department: 'SENIOR_SECONDARY', display_order: 9, is_active: 1 },
      { id: 'fac_010', name: 'Mr. Pramod Yadav',  qualification: 'M.P.Ed.',                      subject: 'Physical Education', department: 'SECONDARY', display_order: 10, is_active: 1 },
      { id: 'fac_011', name: 'Mrs. Asha Rathore', qualification: 'M.A. (Music), B.Ed.',          subject: 'Music & Dance', department: 'PRIMARY', display_order: 11, is_active: 1 },
      { id: 'fac_012', name: 'Mr. Vinod Kumar',   qualification: 'M.A. (Art), B.Ed.',            subject: 'Art & Craft', department: 'PRIMARY', display_order: 12, is_active: 1 },
      { id: 'fac_013', name: 'Mrs. Suman Saini',  qualification: 'M.A. (English), B.Ed.',        subject: 'English', department: 'PRIMARY', display_order: 13, is_active: 1 },
      { id: 'fac_014', name: 'Mrs. Jaya Dhaka',   qualification: 'B.Ed., NTT',                   subject: 'Pre-Primary Coordinator', department: 'PRE_PRIMARY', display_order: 14, is_active: 1 },
      { id: 'fac_015', name: 'Mr. Ram Prasad',    qualification: 'M.Com., B.Ed.',                subject: 'Commerce', department: 'SENIOR_SECONDARY', display_order: 15, is_active: 1 },
      { id: 'fac_016', name: 'Mrs. Kavita Singh', qualification: 'M.A. (Geography), B.Ed.',      subject: 'Geography', department: 'SECONDARY', display_order: 16, is_active: 1 }
    ]
  },
  holidays: {
    holidays: [
      { id: 'hol_001', holiday_date: '2026-04-03', end_date: '2026-04-03', name: 'Good Friday', type: 'GAZETTED', academic_year: '2026-27' },
      { id: 'hol_002', holiday_date: '2026-04-14', end_date: '2026-04-14', name: 'Dr. Ambedkar Jayanti', type: 'GAZETTED', academic_year: '2026-27' },
      { id: 'hol_003', holiday_date: '2026-05-01', end_date: '2026-05-01', name: 'Labour Day', type: 'GAZETTED', academic_year: '2026-27' },
      { id: 'hol_004', holiday_date: '2026-05-15', end_date: '2026-05-15', name: 'Buddha Purnima', type: 'GAZETTED', academic_year: '2026-27' },
      { id: 'hol_005', holiday_date: '2026-06-01', end_date: '2026-06-30', name: 'Summer Vacation', type: 'VACATION', academic_year: '2026-27' },
      { id: 'hol_006', holiday_date: '2026-08-15', end_date: '2026-08-15', name: 'Independence Day', type: 'GAZETTED', academic_year: '2026-27' },
      { id: 'hol_007', holiday_date: '2026-08-26', end_date: '2026-08-26', name: 'Raksha Bandhan', type: 'FESTIVAL', academic_year: '2026-27' },
      { id: 'hol_008', holiday_date: '2026-09-05', end_date: '2026-09-05', name: 'Janmashtami', type: 'FESTIVAL', academic_year: '2026-27' },
      { id: 'hol_009', holiday_date: '2026-10-02', end_date: '2026-10-02', name: 'Gandhi Jayanti', type: 'GAZETTED', academic_year: '2026-27' },
      { id: 'hol_010', holiday_date: '2026-10-12', end_date: '2026-10-18', name: 'Dussehra Break', type: 'VACATION', academic_year: '2026-27' },
      { id: 'hol_011', holiday_date: '2026-11-08', end_date: '2026-11-08', name: 'Diwali', type: 'FESTIVAL', academic_year: '2026-27' },
      { id: 'hol_012', holiday_date: '2026-11-09', end_date: '2026-11-14', name: 'Diwali Vacation', type: 'VACATION', academic_year: '2026-27' },
      { id: 'hol_013', holiday_date: '2026-11-25', end_date: '2026-11-25', name: 'Guru Nanak Jayanti', type: 'GAZETTED', academic_year: '2026-27' },
      { id: 'hol_014', holiday_date: '2026-12-25', end_date: '2026-12-25', name: 'Christmas', type: 'GAZETTED', academic_year: '2026-27' },
      { id: 'hol_015', holiday_date: '2026-12-28', end_date: '2027-01-05', name: 'Winter Break', type: 'VACATION', academic_year: '2026-27' },
      { id: 'hol_016', holiday_date: '2027-01-14', end_date: '2027-01-14', name: 'Makar Sankranti', type: 'FESTIVAL', academic_year: '2026-27' },
      { id: 'hol_017', holiday_date: '2027-01-26', end_date: '2027-01-26', name: 'Republic Day', type: 'GAZETTED', academic_year: '2026-27' },
      { id: 'hol_018', holiday_date: '2027-02-19', end_date: '2027-02-19', name: 'Mahashivratri', type: 'FESTIVAL', academic_year: '2026-27' },
      { id: 'hol_019', holiday_date: '2027-03-08', end_date: '2027-03-08', name: 'Holi', type: 'FESTIVAL', academic_year: '2026-27' },
      { id: 'hol_020', holiday_date: '2027-03-31', end_date: '2027-03-31', name: 'Last day of academic session', type: 'SCHOOL', academic_year: '2026-27' }
    ]
  },
  results: {
    resultSets: [
      {
        id: 'rst_2026_annual_10', academic_year: '2025-26', exam_name: 'Annual Examination 2025-26',
        class_name: 'Class 10', declared_at: '2026-05-12T11:00:00', is_published: 1,
        results: [
          { roll_number: '10-001', student_name: 'Aarav Sharma', dob: '2011-04-12', class_name: 'Class 10', section: 'A',
            marks: { Hindi: 88, English: 92, Mathematics: 95, Science: 90, 'Social Science': 86, Sanskrit: 78 },
            max_total: 600, total: 529, percentage: 88.17, grade: 'A2', rank: 1 },
          { roll_number: '10-002', student_name: 'Priya Yadav', dob: '2011-05-18', class_name: 'Class 10', section: 'A',
            marks: { Hindi: 92, English: 89, Mathematics: 87, Science: 94, 'Social Science': 91, Sanskrit: 85 },
            max_total: 600, total: 538, percentage: 89.67, grade: 'A2', rank: 2 },
          { roll_number: '10-003', student_name: 'Rohan Verma', dob: '2011-03-22', class_name: 'Class 10', section: 'B',
            marks: { Hindi: 78, English: 82, Mathematics: 88, Science: 75, 'Social Science': 80, Sanskrit: 72 },
            max_total: 600, total: 475, percentage: 79.17, grade: 'B1', rank: 5 },
          { roll_number: '8-015', student_name: 'Ananya Singh', dob: '2012-08-05', class_name: 'Class 8', section: 'B',
            marks: { Hindi: 82, English: 88, Mathematics: 91, Science: 85, 'Social Science': 78, Sanskrit: 80 },
            max_total: 600, total: 504, percentage: 84.0, grade: 'A2', rank: 2 }
        ]
      },
      {
        id: 'rst_2026_mid_10', academic_year: '2025-26', exam_name: 'Mid-Term Examination 2025-26',
        class_name: 'Class 10', declared_at: '2026-01-18T11:00:00', is_published: 1, results: []
      }
    ]
  }
};

export function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function loadStatic(_env, name) {
  // Return the embedded fallback data for the requested file
  return FALLBACK[name.replace('.json', '')] || null;
}

export function isD1Available(env) {
  return !!env.DB;
}

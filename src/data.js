// All portfolio content lives here. To swap images, replace the files in
// public/images/. To update the resume, replace public/resume_no_number.pdf.

export const profile = {
  name: 'Shreya Sharma',
  nameHindi: 'श्रेया शर्मा',
  roles: ['Frontend Developer', 'Project Coordinator', 'Web Development Intern'],
  interests: ['Web development', 'Data analysis', 'Cybersecurity'],
  location: 'Ahmedabad, Gujarat',
  phone: '+91 XXXXXXXXXX', // optional. While it contains X, the story hides it.
  email: 'shreyawork015@gmail.com',
  summary:
    'Results-driven intern with a background in web development and data analysis. I have worked on client projects from start to finish, and I bring problem-solving, teamwork and a habit of delivering quality work on time.',
  about:
    'I enjoy both sides of a project: building the interface and coordinating the people around it. I work comfortably with clients and teammates, solve problems as they appear, and finish what I start. Alongside web development, I am interested in data analysis and cybersecurity.',
  image: '/images/portrait.png',
  imageFocus: '50% 18%', // keeps her face in view when the photo is cropped
  imageHint: 'public/images/portrait.png',
}

export const resume = {
  url: '/resume_no_number.pdf', // file lives at public/resume_no_number.pdf
  downloadName: 'Shreya-Sharma-Resume.pdf',
}

export const experience = {
  role: 'Web Development Intern & Project Coordinator',
  org: 'SI International Pvt Ltd.',
  duration: '1.5 months',
  points: [
    'Developed a responsive website for an Australian solar client.',
    'Managed the project lifecycle from requirements through to deployment.',
    'Coordinated with the client and team members to deliver on time.',
    'Improved the UI/UX and overall performance of the website.',
  ],
}

// `url` is optional. When set, the project title becomes a link that opens in a new tab.
export const projects = [
  {
    title: 'SitetoSolar',
    kind: 'Solar quote comparison platform',
    url: 'https://share.google/HutYbtfUc6xAS31qS',
    points: [
      'Built a responsive website for comparing solar and battery quotes.',
      'Designed a user-friendly interface for better engagement.',
      'Ensured fast performance and mobile compatibility.',
    ],
    image: '/images/sitetosolar.jpg',
    imageHint: 'public/images/sitetosolar.jpg',
  },
  {
    title: 'Note Taking Website',
    kind: 'Personal project',
    points: ['Built with HTML, CSS and JavaScript. A MySQL database stores the notes.'],
    image: '/images/note-taking.png',
    imageHint: 'public/images/note-taking.png',
  },
  {
    title: 'Habit Tracker Website',
    kind: 'Personal project',
    points: ['Built with HTML and CSS.'],
    image: '/images/habit-tracker.jpg',
    imageHint: 'public/images/habit-tracker.jpg',
  },
  {
    title: 'QR Code Generator Website',
    kind: 'Personal project',
    points: ['Built with HTML, CSS, JavaScript and MySQL. It generates QR codes for any text or URL.'],
    image: '/images/qr-code-generator.png',
    imageHint: 'public/images/qr-code-generator.png',
  },
]

// Newest first. Both courses are current and separate.
export const education = [
  {
    year: '2026 – Present',
    title: 'M.Sc. in Cyber Security',
    place: 'GLS University, Ahmedabad',
    notes: ['First year'],
  },
  {
    year: '2023 – 2026',
    title: 'M.Sc. IT in FinTech (Integrated)',
    place: 'Gujarat University, Ahmedabad',
    notes: ['Third year', 'CGPA 8.56 / 10', 'SGPA 8.73 / 10'],
  },
  {
    year: '2023',
    title: 'Class XII, Commerce (GSEB)',
    place: 'Sabarmati Higher Secondary School',
    notes: ['88.05%'],
  },
  {
    year: '2021',
    title: 'Class X (CBSE)',
    place: 'Mahapragya Vidhya Niketan, Gandhinagar',
    notes: ['80%'],
  },
]

export const skills = ['HTML', 'CSS', 'JavaScript', 'React JS', 'Python', 'MySQL', 'Power BI', 'Tableau', 'GitHub']
export const strengths = ['Confidence', 'Leadership', 'Effective communication', 'Time management', 'Adaptability']
export const certificates = ['Tally Prime', 'CCC', 'Excel', 'NoSQL (MongoDB)', 'Marketing']
export const cybersecurity = ['bash scripting', 'Python programming', 'networking']
export const languages = ['English', 'Hindi']